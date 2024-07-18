import {PlatformEnum } from '../enums/platform.enum.js'
import { config as baseConfig } from './config.js';
import { CustomRemoteCapabilities, CustomTestRunnerOptions } from './interface/index.js';

baseConfig.logLevel = 'debug';
baseConfig.hostname = '127.0.0.1';
baseConfig.port = 4723;
baseConfig.path = '/';

const baseBeforeSession = baseConfig.beforeSession;
baseConfig.beforeSession = (conf: CustomTestRunnerOptions, capabilities: CustomRemoteCapabilities, specs) => {
    const deviceUdid = conf.cucumberOpts.deviceIds;

    capabilities['appium:udid'] = deviceUdid;
    capabilities['appium:deviceName'] = deviceUdid;

    capabilities['appium:fullReset'] = false;
    capabilities['appium:noReset'] = true;

    if (capabilities.platformName === PlatformEnum.Android){
        capabilities['appium:automationName'] = 'uiautomator2';
    }

    if (capabilities.platformName === PlatformEnum.iOS) {
        capabilities['appium:includeSafariInWebviews'] = true;
        capabilities['appium:useNewWDA'] = false;
        capabilities['appium:automationName'] = 'xcuitest';
    }

    // @ts-expect-error
    baseBeforeSession (conf,capabilities, specs);

    // @ts-expect-error
    baseConfig.debug(conf,capabilities);
};

export const config = baseConfig;
