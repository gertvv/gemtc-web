'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var MetaRegressionService = function() {

    /*
     ** Transform covariate effects plots object to a list of objects,
     ** each object has treatmentName and a plot for the corresponding treatment
     **
     ** The returned list is sorted by treatmentName
     */
    function buildCovariatePlotOptions(results, problem) {
      var treatmentsById = _.keyBy(problem.treatments, 'id');
      return Object
        .keys(results.covariateEffectPlot)
        .map(function(key) {
          return {
            treatmentName: treatmentsById[key].name,
            plot: results.covariateEffectPlot[key]
          };
        })
        .sort(function(a, b) {
          return a.treatmentName.localeCompare(b.treatmentName);
        });
    }

    function getCovariateSummaries(results, problem) {
      var quantiles = results.summaries.quantiles;
      var covariateSummaries = [];
      Object.keys(quantiles).forEach(function(key){
        if (key === 'B') {
         covariateSummaries.push({key: key, label: 'beta (covariate)', value: quantiles[key]});
        }
        else if (key.slice(0, 5) === 'beta[') {
          var treatmentIndex = Number(key.substring(key.indexOf('[') + 1, key.length - 1)) -1 ;
          covariateSummaries.push({key: key, label: 'beta (' + problem.treatments[treatmentIndex].name + ')', value: quantiles[key]});
         }
      });
      return covariateSummaries;
    }

    return {
      buildCovariatePlotOptions: buildCovariatePlotOptions,
      getCovariateSummaries: getCovariateSummaries
    };
  };

  return dependencies.concat(MetaRegressionService);
});
