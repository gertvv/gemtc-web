'use strict';
var testUrl = process.env.GEMTC_NIGHTWATCH_URL ? process.env.GEMTC_NIGHTWATCH_URL : 'https://gemtc-test.drugis.org';
var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');
var AnalysisOverviewPage = require('./analyses/analysisOverviewPage');
var CreateModelPage = require('./models/createModelPage');
var ModelResultPage = require('./models/modelResultPage');
var assert = require('assert');

var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  "create fixed effect pairwise model": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    var analysisOverviewPage = new AnalysisOverviewPage(browser);
    var createModelPage = new CreateModelPage(browser);
    var modelResultPage = new ModelResultPage(browser);
    var burnInIterations = 100;
    var inferenceIterations = 52;
    var thinningFactor = 1;

    login(browser, testUrl);

    analysesPage.waitForPageToLoad();
    analysesPage.addAnalysis(analysisTitle, analysisOutcomeTitle, '/example.json');
    browser.waitForElementVisible('#analysis-header', 10000);

    analysisOverviewPage.waitForPageToLoad();
    analysisOverviewPage.addModel();

    createModelPage.waitForPageToLoad();
    createModelPage.setTitle('Nightwatch fixed effect pairwise model');
    createModelPage.setEffectsType('fixed');
    createModelPage.setModelMainType('pairwise');
    createModelPage.setModelSubType('pairwise-all')
    createModelPage.createModel();

    analysisOverviewPage.waitForPageToLoad();

    browser.pause(300);
    modelResultPage.end();
  }
};
