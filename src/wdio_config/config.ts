/* eslint no-console:0, @typescript-eslint/no-unused-vars:0, @typescript-eslint/no-misussed-promises: 0 */
/**
 * This shared configuration is ready by each webdriver io process. There is an initial main thread
 * and one for each cappability. Therefore, it is important not to do anything in this config which
 * is either
 * Required to be run only once, or
 * Requires state to be shared a/c mutliple threads.
 *
 * setup and trardown tasks should be placed in onpreapre and oncomplete respectively
 *
 * NB: Exception thrown in beforescenario, afterscenario, etc. will be logged but will not fail
 * the tests, so code which may fail should be placed in here, but rather in the step
 * defininations themselves
 */

import fs from 'node:fs';
import path from 'node:path';

import _ from 'lodash';
// @ts-expect-error
import { generate } from 'multiple-cucumber-html-reporter';
import util from 'util';
import { v4 } from 'uuid';

import { getData, setData } from '../data/savedAppData.repository.js';
import { SavedAppDataEnum } from '../enums/saveAppData.enum.js';
import logger from '../utils/logger.js';
import { categorizeFailure, maskFields } from '../utils/utils.js';
import { Config, CustomRemoteCapabilities, CustomTestRunnerOptions } from './interface/index.js';
import { exitCode } from 'node:process';

const jsonReportDir = path.resolve('./reports/cucumber/json');

const defrag = (params: string[]) =>
	params.map((param) => {
		if (typeof param === 'object') {
			return maskFields(param, ['desiredCapabitlies']);
		}
		return param;
	});

// webdriverIO will only log to the console, so we have to override it so that everything will go through the winston logger

console.debug = (...params: string[]) => logger.debug(util.format.apply(null, defrag(params)));
console.info = (...params: string[]) => logger.debug(util.format.apply(null, defrag(params)));
console.log = (...params: string[]) => logger.debug(util.format.apply(null, defrag(params)));
console.warn = (...params: string[]) => logger.debug(util.format.apply(null, defrag(params)));
console.error = (...params: string[]) => logger.debug(util.format.apply(null, defrag(params)));

export const config: Config = {
	framework: 'cucumber',
	reporters: ['spec'],
	maxInstances: 1,
	capabilities: [
		{
			timeouts: {
				script: 30000,
				pageLoad: 300000,
				implicit: 0
			}
		}
	]
};

config.onPrepare = (conf, capabilities) => {
	logger.info('Executed onPrepare hook....');
};

config.onWorkerStart = (cid, caps, specs, args: CustomTestRunnerOptions, execArgv) => {
	caps.platformName = args?.cucumberOpts?.plaform;
};

config.beforeSession = (conf, capabilities: CustomRemoteCapabilities, specs) => {
	const testId = v4();
	logger.info(`beforeSession testId: ${testId}`);
	capabilities['cusotom:testId'] = testId;
	if (conf.cucumberOpts) {
		conf.cucumberOpts.format = [`json:${jsonReportDir}/${testId}.json`];
	}
	setData(SavedAppDataEnum.testId, testId);
	setData(SavedAppDataEnum.cucumberOpts, conf.cucumberOpts as any);
};

config.beforeScenario = async (world, context) => {
	logger.info(`beforeScenario, Scenario Name : ${world.pickle.name}`);
	await browser.setTimeout({ implicit: 2000 });
};

config.afterScenario = (world, result, context) => {
	const testResult = result.passed ? 'passed' : 'failed';
	const errorMessage = result.error;
	const errorCategory = categorizeFailure(testResult, errorMessage);
	logger.info(`afterScenario, Scenario Name: ${world.pickle.name}, Test Result: ${testResult}, Error Category: ${errorCategory}`);
};

config.afterSession = (conf, capabilities, specs) => {
	const testId = getData(SavedAppDataEnum.testId);
	const jsonFilePath = `${jsonReportDir}/${testId}.json`;
	const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
	const data = JSON.parse(jsonData);
	const metdata = {
		device: _.get(conf.cucumberOpts, 'deviceId') || 'Virtual Device',
		platform: {
			name: _.get(conf.cucumberOpts, 'platform')
		}
	};
	data[0].metdata = metdata;
	const updatedJsonData = JSON.stringify(data, null, 2);
	fs.writeFileSync(jsonFilePath, updatedJsonData, 'utf-8');
};

config.debugInfo = (conf: { specs: string | string[] }, capabilities: CustomRemoteCapabilities) => {
	logger.info(`Prepared wdio configuration: specs: ${conf.specs}
    capabilities: ${util.inspect(maskFields(capabilities, ['options']))}`);
};

config.onComplete = (exitCode, conf, capabilities, result) => {
	generate({
		openReporterInBrowser: true,
		disableLog: true,
		reportName: 'aviva mu workspace report',
		jsonDir: 'reports/cucumber/json',
		reportpath: 'reports/cucumner/html',
		pageTitle: 'aviva my workplace report',
		displayDuration: true
	});
};
