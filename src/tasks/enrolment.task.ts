import _ from 'lodash';

import DataRepository from '../data/data.repository.js';
import FeatureFlagRepository from '../data/featureFlag.repository.js';
import { getData, setData } from '../data/savedAppData.repository';
import StandAloneResponseRepository from '../data/standaloneResponse.repository.js';
import { SavedAppDataEnum } from '../enums/saveAppData.enum';
import { ensureCleanAppInstall, getDeviceID, getMobileNumber, isBrowserstack, isMock, relaunchApp } from '../helpers/device.helper';
import Actions from '../pages/common/actions.js';
import DeviceState from '../utils/device.state';
import logger from '../utils/logger.js';

export default class EnrolmentTask {
	dataRepository: DataRepository;
	featureFlagRepository: FeatureFlagRepository;
	standAloneResponseRepository: StandAloneResponseRepository;
	deviceState: DeviceState;
	constructor(
		dataRepository: DataRepository,
		featureFlagRepository: FeatureFlagRepository,
		standAloneResponseRepository: StandAloneResponseRepository,
		deviceState: DeviceState
	) {
		(this.dataRepository = dataRepository),
			(this.featureFlagRepository = featureFlagRepository),
			(this.standAloneResponseRepository = standAloneResponseRepository),
			(this.deviceState = deviceState);
	}

	async assignUser(desiredUserType: string) {
		const server = _.get(getData(SavedAppDataEnum.cucumberOpts), 'server') as unknown as string;
		const appName = _.get(getData(SavedAppDataEnum.cucumberOpts), 'appName') as unknown as string;
		await this.dataRepository.assign(appName, server, desiredUserType, await getMobileNumber());
		logger.info(`Executing test with user ${this.dataRepository.assinedUser.username}`);
	}

	isAppEnrolled() {
		return this.deviceState.getEnrolledUser() === this.dataRepository.assinedUser.username;
	}

	async prepareAppForDesiredUserType() {
		await Actions.switchContext('NATIVE_APP');
		const platformVersion =
			(_.get(getData(SavedAppDataEnum.cucumberOpts), 'platformVersion') as unknown as string) ||
			_.get(browser.capabilities, 'platformVersion') ||
			undefined;
		const cucumberOpts = getData(SavedAppDataEnum.cucumberOpts);
		setData(SavedAppDataEnum.cucumberOpts, _.assign(cucumberOpts, { platformVersion }));
		const useInstalledApp = _.get(getData(SavedAppDataEnum.cucumberOpts), 'useInstalledApp') as unknown as boolean;
		if (useInstalledApp) {
			const deviceState = new DeviceState(await getDeviceID());
			deviceState.setAppInstalled(true);
			await relaunchApp();
		} else {
			if (isBrowserstack()) {
				// Avoid app installation on bs for each new session, as each session automatically conducts device celanup and install the app freshly
				return;
			}
			await ensureCleanAppInstall(this.isAppEnrolled());
		}
		const [orientation] = await Promise.all([Actions.getOrientation()]);
		if (orientation.toLocaleLowerCase() === 'landscape') {
			await Actions.setOrientation('portrait');
		}
	}

	async proceedToLoginWithAccountTypes(desiredUserType: string) {
		await this.assignUser(desiredUserType);
		await this.prepareAppForDesiredUserType();
		const data = await this.dataRepository.get();

		let userName = data.username;
		let password = data.password;

		if (!this.isAppEnrolled()) {
		}
	}

	async loginAsUserWithAccountTypes(desiredUserType: string) {
		await this.proceedToLoginWithAccountTypes(desiredUserType);
	}
}
