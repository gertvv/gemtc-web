'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$q', '$modal', '$state', '$stateParams', 'gemtcRootPath', 'ModelResource', 'FunnelPlotResource', 'PataviService',
    'RelativeEffectsTableService', 'PataviTaskIdResource', 'ProblemResource', 'AnalysisResource', 'ModelService',
    'DiagnosticsService', 'AnalysisService', 'DevianceStatisticsService', 'MetaRegressionService',
    'ResultsPlotService'
  ];
  var ModelController = function($scope, $q, $modal, $state, $stateParams, gemtcRootPath, ModelResource, FunnelPlotResource, PataviService,
    RelativeEffectsTableService, PataviTaskIdResource, ProblemResource, AnalysisResource, ModelService,
    DiagnosticsService, AnalysisService, DevianceStatisticsService, MetaRegressionService,
    ResultsPlotService) {

    var modelDefer = $q.defer();

    $scope.resultsViewTemplate = gemtcRootPath + 'views/results-section.html';
    $scope.modelSettingsViewTemplate = gemtcRootPath + 'views/model-settings-section.html';
    $scope.convergenceDiagnosticsViewTemplate = gemtcRootPath + 'views/convergence-diagnostics-section.html';
    $scope.modelFitViewTemplate = gemtcRootPath + 'views/model-fit-section.html';
    $scope.metaRegressionTemplate = gemtcRootPath + 'views/meta-regression-section.html';

    $scope.analysis = AnalysisResource.get($stateParams);
    $scope.progress = {
      percentage: 0
    };
    $scope.model = ModelResource.get($stateParams);
    $scope.modelPromise = modelDefer.promise;
    $scope.comparisonAdjustedFunnelPlots = FunnelPlotResource.query($stateParams);
    $scope.$parent.model = $scope.model;
    $scope.openRunLengthDialog = openRunLengthDialog;
    $scope.openComparisonAdjustedModal = openComparisonAdjustedModal;
    $scope.goToRefineModel = goToRefineModel;
    $scope.selectedBaseline = undefined;
    $scope.stateParams = $stateParams;

    // pass information to parent for use in breadcrumbs
    $scope.$parent.model = $scope.model;
    $scope.$parent.analysis = $scope.analysis;

    $scope.resultsPromise = $scope.model
      .$promise
      .then(getTaskInfo)
      .then(getTaskUrl)
      .then(PataviService.listen)
      .then(pataviRunSuccessCallback,
        function(pataviError) {
          console.error('an error has occurred, error: ' + JSON.stringify(pataviError));
          $scope.$emit('error', {
            type: 'PATAVI',
            message: pataviError.desc
          });
        },
        function(update) {
          if (update && update.eventType === 'progress' && update.eventData && $.isNumeric(update.eventData.progress)) {
            $scope.progress.percentage = update.eventData.progress;
          }
        });

    function goToRefineModel(){
      $state.go('refineModel', $stateParams);
    }

    function getTaskInfo() {
      return PataviTaskIdResource.get($stateParams).$promise;
    }

    function getTaskUrl(taskInfo) {
      $scope.taskUri = taskInfo.uri;
      return taskInfo.uri;
    }

    function nameRankProbabilities(rankProbabilities, treatments) {
      return _.reduce(_.toPairs(rankProbabilities), function(memo, pair) {
        var treatmentName = _.find(treatments, function(treatment) {
          return treatment.id.toString() === pair[0];
        }).name;
        memo[treatmentName] = pair[1];
        return memo;
      }, {});
    }

    function openRunLengthDialog() {
      $modal.open({
        windowClass: 'small',
        templateUrl: gemtcRootPath + 'js/models/extendRunLength.html',
        scope: $scope,
        controller: 'ExtendRunLengthController',
        resolve: {
          problem: function() {
            return $scope.problem;
          },
          model: function() {
            return $scope.model;
          },
          successCallback: function() {
            return function() {
              // reload page, with empty params object
              $state.go($state.current, {}, {
                reload: true
              });
            };
          }
        }
      });
    }

    function openComparisonAdjustedModal() {
      $modal.open({
        windowClass: 'small',
        templateUrl: gemtcRootPath + 'js/models/addComparisonFunnelPlot.html',
        scope: $scope,
        controller: 'AddComparisonFunnelPlotController',
        resolve: {
          problem: function() {
            return $scope.problem;
          },
          studyRelativeEffects: function() {
            return $scope.result.studyRelativeEffects;
          },
          successCallback: function() {
            return function() {
              $scope.comparisonAdjustedFunnelPlots = FunnelPlotResource.query($stateParams);
            };
          }
        }
      });
    }

    $scope.problemPromise = ProblemResource.get({
      analysisId: $stateParams.analysisId,
      projectId: $stateParams.projectId
    }).$promise;

    function prefixPlots(result, taskUri) {
      var resultPlotPrefix = taskUri +  '/results/';
      result.convergencePlots.trace = ResultsPlotService.prefixImageUris(result.convergencePlots.trace, resultPlotPrefix);
      result.convergencePlots.density = ResultsPlotService.prefixImageUris(result.convergencePlots.density, resultPlotPrefix);
      result.convergencePlots.psrf = ResultsPlotService.prefixImageUris(result.convergencePlots.psrf, resultPlotPrefix);
      result.deviancePlot = ResultsPlotService.prefixImageUris(result.deviancePlot, resultPlotPrefix);
      return result;
    }

    function pataviRunSuccessCallback(result) {
      return $scope.problemPromise.then(function(problem) {
        $scope.problem = problem;
        $scope.nodeSplitOptions = AnalysisService.createNodeSplitOptions(problem);

        $scope.result = prefixPlots(result, $scope.taskUri);
        if (problem.treatments && problem.treatments.length > 0) {
          $scope.selectedBaseline = problem.treatments[0];
        }
        var isLogScale = result.logScale;
        $scope.scaleName = AnalysisService.getScaleName($scope.model);
        $scope.diagnosticMap = DiagnosticsService.buildDiagnosticMap(
          $scope.model,
          $scope.problem,
          $scope.result
        );

        var unsorted = _.values($scope.diagnosticMap);
        $scope.diagnostics = unsorted.sort(DiagnosticsService.compareDiagnostics);

        if ($scope.model.modelType.type !== 'node-split') {
          $scope.rankProbabilitiesByLevel = _.map(result.rankProbabilities, function(rankProbability, key) {
            return {
              level: key,
              data: nameRankProbabilities(rankProbability, problem.treatments)
            };
          });
          $scope.relativeEffectsTables = _.map(result.relativeEffects, function(relativeEffect, key) {
            return {
              level: key,
              table: RelativeEffectsTableService.buildTable(relativeEffect, isLogScale, problem.treatments)
            };
          });

          if ($scope.model.regressor && ModelService.isVariableBinary($scope.model.regressor.variable, $scope.problem)) {
            $scope.rankProbabilitiesByLevel = ModelService.filterCentering($scope.rankProbabilitiesByLevel);
            $scope.relativeEffectsTables = ModelService.filterCentering($scope.relativeEffectsTables);
            $scope.relativeEffectsTable = $scope.relativeEffectsTables[0];
            $scope.rankProbabilities = $scope.rankProbabilitiesByLevel[0];
          } else {
            $scope.relativeEffectsTable = ModelService.findCentering($scope.relativeEffectsTables);
            $scope.rankProbabilities = ModelService.findCentering($scope.rankProbabilitiesByLevel);
            if ($scope.model.regressor) {
              $scope.relativeEffectsTable.level = 'centering (' + $scope.result.regressor.modelRegressor.mu + ')';
              $scope.rankProbabilities.level = 'centering (' + $scope.result.regressor.modelRegressor.mu + ')';
            }
          }
        } // end not nodesplit

        $scope.absoluteDevianceStatisticsTable = DevianceStatisticsService.buildAbsoluteTable(result.devianceStatistics, problem);
        $scope.relativeDevianceStatisticsTable = DevianceStatisticsService.buildRelativeTable(result.devianceStatistics);
        if ($scope.model.regressor) {
          $scope.controlTreatment = _.find($scope.problem.treatments, function(treatment) {
            return treatment.id === Number($scope.model.regressor.control);
          });
          $scope.covariateQuantiles = MetaRegressionService.getCovariateSummaries($scope.result, $scope.problem);
        }
        $scope.model = ModelResource.get($stateParams); // refresh so that model.taskUrl is set
        $scope.model.$promise.then(function(model) {
          modelDefer.resolve(model);
        });
        return result;
      });
    }



  };
  return dependencies.concat(ModelController);
});
