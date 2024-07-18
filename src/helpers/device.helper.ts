import { resolve } from 'node:path';

import _ from 'lodash';

import AppInforFactory from '../apps/appInfo.factory.js';
import { getData } from '../data/savedAppData.repository.js';
import { SavedAppDataEnum } from '../enums/saveAppData.enum.js';
import Actions from '../pages/common/actions.js';
import AppInstaller from '../utils/appInstaller.js';
import DeviceState from '../utils/device.state.js';
import logger from '../utils/logger.js';
import { getBrowserStackLatestAppUrl } from './browserSatck.helper.js';

export const isAndroid = () => driver.isAndroid;
export const isiOS = () => driver.isIOS;

export const windowHandleSize = async () => await Actions.getWindowSize();
export const isSmallScreenSize = async () => (await windowHandleSize()).height <= 1200;

export const getDeviceID = async () => Promise.resolve(_.get(getData(SavedAppDataEnum.cucumberOpts), 'deviceId') as unknown as string);

const provider = _.get(getData(SavedAppDataEnum.cucumberOpts), 'provider') as unknown as string;

export const isAppium = () => provider === 'appium';

export const isMock = () => provider === 'mock';

export const isBrowserstack = () => provider === 'browserstack';

const appInfo = async () => await AppInforFactory.getAppInfo();

export const getMobileNumber = async () => {
	const mobileNumber = 'undefined';
	if (isBrowserstack()) {
		//     await driver.execute(`browserstack_executor: ${JSON.stringify({
		//         action: 'deviceInfo',
		//         arguments: {
		//             devicesProperties: ['simOptions']
		//         }
		//     })}`);
	}
	return Promise.resolve(mobileNumber);
};

export const terminateApp = async () => {
	await Actions.terminateApp((await appInfo()).appPackage);
};

export const activateApp = async () => {
	await Actions.activateApp((await appInfo()).appPackage);
};

export const relaunchApp = async () => {
	try {
		await terminateApp();
	} finally {
		await activateApp();
		await Actions.pause(5000);
	}
};

const appInstall = async () => {
	let appPath: string | undefined = undefined;
	const buildSubFolder = _.get(getData(SavedAppDataEnum.cucumberOpts), 'buildSubFolder') as unknown as string;
	const { appName, fileName } = await appInfo();
	if (isAppium() || isMock()) {
		appPath = resolve(`${buildSubFolder}/${fileName}`);
	}
	if (isBrowserstack()) {
		appPath = await getBrowserStackLatestAppUrl(appName, buildSubFolder);
	}
	if (!appPath) {
		throw new Error(`app path is undefined pr not set for provider: ${provider}`);
	}
	try {
		await Actions.installApp(appPath);
	} catch (error) {
		logger.error(error.message);
		throw error;
	}
};

const appUnInstall = async () => {
	try {
		await Actions.removeApp((await appInfo()).appPackage);
	} catch (error) {
		logger.error(error.message);
	}
};

const resetApp = async () => {
	await appUnInstall();
	await appInstall();
};

export const ensureCleanAppInstall = async (isAppEnrolled: boolean = false, forceInstall: boolean = false) => {
	let firstLaunchAfterInstall: boolean = false;

	const deviceState = new DeviceState(await getDeviceID());
	const appInstaller = new AppInstaller(deviceState, appInstall, appUnInstall);
	const isAppInstalled = await appInstaller.installApp(forceInstall);

	const enrolledUser = deviceState.getEnrolledUser();

	if (isAppInstalled) {
		firstLaunchAfterInstall = true;
	}

	if (!isAppEnrolled && !isAppInstalled && enrolledUser !== undefined) {
		await resetApp();
		deviceState.setEnrolledUser(undefined);
		firstLaunchAfterInstall = false;
	}

	if (firstLaunchAfterInstall) {
		logger.debug('Slower devices longer to lunch App.');
		await Actions.activateApp((await appInfo()).appPackage);
		if (!isMock()) {
			await Actions.pause(7000);
		}
	} else {
		try {
			await Actions.terminateApp((await appInfo()).appPackage);
		} finally {
			await Actions.activateApp((await appInfo()).appPackage);
			if (!isMock()) {
				await Actions.pause(3000);
			}
		}
	}
};
