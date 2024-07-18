/* eslint @typescript-eslint/nounused-vars:0, @typescript-eslint/no-misused-promises: 0 */
import os from 'node:os';
import path from 'node:path';

import { PickleStep } from '@cucumber/messages';
import _ from 'lodash';

import AppInfoFactory from '../apps/appInfo.factory.js';
import { getData } from '../data/savedAppData.repository.js';
import { PlatformEnum } from '../enums/platform.enum.js'
import { SavedAppDataEnum } from '../enums/saveAppData.enum';
import { getBrowserStackLatestAppUrl, getReportLink } from '../helpers/browserSatck.helper.js';
import JsonDBHelper from '../helpers/jsonDb.helper.js';
import { initialize } from '../utils/proxyEnabler.js';
import { categorizeFailure,resetTemDir } from '../utils/utils';
import { config as baseConfig } from './config.js';
import { CustomRemoteCapabilities, CustomTestRunnerOptions } from './interface/index.js';

initialize();

let isSessionReloadRequired: boolean = false;
const scenariomap = new Map <string, string>();

baseConfig.logLevel= 'debug';
baseConfig.protocol = 'https';
baseConfig.hostname = 'hub.browserstack.com';
baseConfig.port = 443;
baseConfig.path = 'wd/hub';

baseConfig.user = process.env.BROWSERSTACK_USERNAME;
baseConfig.key = process.env.BROWSERSTACK_ACCESSKEY;

const getBuildName = (numberOfdaysSince: number, preset?: string, reportingName?: string, reprotingNumber?: number) =>{
    if (baseConfig.user?.includes('mobileautomation')) {
        let reportName;
        if(reportingName) {
            reportName = reportingName;
        }
        if(preset) {
            reportName += `-${preset}`;
        }
        reportName += `-${numberOfdaysSince}`;
        if(reprotingNumber) {
            reportName += `-${reprotingNumber}`;
        } 
        return reportName;
    } else {
        const suffix = `${os.userInfo().username}`;
        return preset ? `${preset} run by ${suffix}` : `local run by ${suffix}`;
    }
};

const baseBeforeSession = baseConfig.beforeSession;
baseConfig.beforeSession = async (conf: CustomTestRunnerOptions, capabilities: CustomRemoteCapabilities, specs) => {
    // @ts-expect-error
    baseBeforeSession(confg, capabilities,specs);
    const { buildSubFolder, deviceId, preset, reportingName, reportingNumber,numberOfDaysSince,platformVersion } = conf.cucumberOpts;
    const appInfo =async () => await AppInfoFactory.getAppInfo();
    const { appName } = await appInfo();
    const latestAppUrl = await getBrowserStackLatestAppUrl(appName, buildSubFolder);

    capabilities ['bstack:options'] = {
        appiumVersion: '2.4.1',
        buildName: getBuildName(numberOfDaysSince, preset, reportingName, reportingNumber),
        interactiveDebugging: true,
        appiumLogs: false,
        networkLogs: true,
        idleTimeout: conf.cucumberOpts.timeout,
        deviceLogs: false,
        midSessionInstallApps: [latestAppUrl]
    };
    if (platformVersion) {
        capabilities['appium:platformVersion'] = platformVersion;
    }
    if (capabilities.platformName === PlatformEnum.Android) {
        capabilities['appium:automationName'] = 'UIAutomator2'
    }
    if (capabilities.platformName === PlatformEnum.iOS) {
        capabilities['appium:automationName'] = 'XCUITest';
    }
    capabilities['appium:newCommandTimeout'] = conf.cucumberOpts.timeout;
    capabilities['appium:app'] = `${appName}-${buildSubFolder}`;
    capabilities['appium:deviceName'] = deviceId;

    // @ts-expect-error
    baseConfig.debugInfo(conf, capabilities);
};

const baseBeforeScenario = baseConfig.beforeScenario;
baseConfig.beforeScenario =async (world, context) => {
    const scenarioId = scenariomap.get(world.pickle.uri);
    if (! scenarioId) {
        scenariomap.set(world.pickle.uri, world.pickle.id);
        isSessionReloadRequired = false;
    }
    if (scenarioId && scenarioId !== world.pickle.id){
        isSessionReloadRequired = true;
        scenariomap.set(world.pickle.uri, world.pickle.id);
    }
    if (isSessionReloadRequired) {
        await resetTemDir();
        await browser.reloadSession();
    }
    const teamTag = world.pickle.tags
    .map((tag)=>tag.name)
    .filter((tag) => tag.startsWith('@team'))
    .toString();

    const featureFile = world.pickle.uri.substring(world.pickle.uri.lastIndexOf(path.sep) +1);
    const scenarioName = world.pickle.name;

    await browser.execute (
        `browserstack_executor: ${JSON.stringify({
            action: 'setSessionName',
            arguments: {
                name: [teamTag, featureFile,scenarioName].join(' _ ')}

        })}`
    );
    // @ts-expect-error
    baseBeforeScenario(world, context);
};

baseConfig.beforeStep =async (step:PickleStep & { keyword: string }, scenario, context) => {
    await browser.execute(
        `browserstack_executor: ${JSON.stringify({
            action: 'annotate',
            arguments: {
                data: `${step.keyword} ${step.text}`
            }
        })}`
    );
};

const baseAfterScenario = baseConfig.afterScenario;
baseConfig.afterScenario =async (world, result, context) => {
    const testResult = result.passed? 'passed' : 'failed';
    const errorMessage = result.error;
    const errorCategory = categorizeFailure(testResult, errorMessage);
    await browser.execute(
        `browserstack_executor: ${JSON.stringify({
            action: 'setSessionStatus',
            arguments: {
                status: testResult,
                reason: errorCategory
            }
     })}`
    );
    const cucumberOpts = getData(SavedAppDataEnum.cucumberOpts);
    const { sessionId } = browser;
    const reportLink = await getReportLink(sessionId);
    const { platform, platformVersion, deviceId, preset, shard } = cucumberOpts as keyof typeof cucumberOpts;
    const { current, total } = shard;
    const jsondb = new JsonDBHelper(`${preset || 'local'}-shard-${current}-${total}`);
    await jsondb.set (`/${platform}-${platformVersion}[]`, {
        scenarioName: world.pickle.name,
        scenarioStatus: testResult,
        reportLink,
        deviceId
    });
    // @ts-expect-error
    baseAfterScenario(world, result,context);
};

const baseAfterSession = baseConfig.afterSession;
baseConfig.afterSession =async (conf, capabilities, specs ) => {
    await resetTemDir();
    // @ts-expect-error
    baseAfterSession(conf, capabilities, specs);  
};

export const config = baseConfig;
