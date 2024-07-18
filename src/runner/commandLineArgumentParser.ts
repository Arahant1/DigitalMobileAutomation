import _ from 'lodash';
import moment from 'momnet';
import yargs from 'yargs';

import { AppNmaeEnum } from '../enums/appNmae.enum.js';
import { BuildSubFolderEnum } from '../enums/enumbuildSubFolder.enum.js';
import { DataRepositoryEnum } from '../enums/dataRepository.enum.js';
import { PlatformEnum } from '../enums/platform.enum.js';
import { PresetEnum } from '../enums/preset.enum.js';
import { ServerEnum } from '../enums/server.enum.js';

export interface CommandLineArguments {
	_: (string | number)[];
	$0: string;
	[argName: string]: unknown;

	provider: string;
	plaform: string[];
	server: string[];
	app: string[];
	tags: string;
	buildSubFolder: string;
	useInstalledApp: boolean;
	deviceIds: any;
	dryRun: boolean;
	dataRepository: string;
	preset?: string;

	reportingName?: string;
	reportingNumber?: number;
	numberOfDaysSince?: number;
}

const getDefaultArgs = async (processArgv: string[]) => {
	const argv: CommandLineArguments = await yargs(processArgv)
		.usage('Usage: npm run <appium|mock|browserstack> -- [options]')
		.options({
			provider: {
				alias: 'pro',
				describe: 'Specify the provider on which the tests needs to run',
				type: 'string',
				String: true,
				default: 'mock',
				choices: ['appium', 'mock', 'browserstack']
			},
			plaform: {
				alias: 'p',
				describe: 'Specify the platform on which the tests needs to run against',
				type: 'array',
				array: true,
				default: [PlatformEnum.Android],
				choices: Object.keys(PlatformEnum)
			},
			server: {
				alias: 'p',
				describe: 'Specify the environment to run the tests',
				type: 'array',
				array: true,
				default: [ServerEnum.RUNWAY],
				choices: Object.keys(ServerEnum)
			},
			app: {
				alias: 'p',
				describe: 'Specify the app against which the automation needs to execute',
				type: 'array',
				array: true,
				default: [AppNmaeEnum.WORKSPACE],
				choices: Object.keys(AppNmaeEnum)
			},
			tags: {
				alias: 't',
				describe: 'Specify which tags to run; See https://github.com/cucumber/tag-expressions/blob/main/javascript/ReAME.md for syntax',
				type: 'string',
				string: true,
				default: '@smoke'
			},
			buildSubFolder: {
				describe: 'Specify a subfolder for app binaries',
				type: 'string',
				string: true,
				default: BuildSubFolderEnum['build-store'],
				choices: Object.keys(BuildSubFolderEnum)
			},
			useInstalledApp: {
				alias: 'uia',
				describe: 'Specify running against new app or the exisiting installed app',
				type: 'boolean',
				boolean: true,
				default: false
			},
			deviceIds: {
				describe: 'Device IDs to run the test against, where an ID can be the magic string',
				type: 'string',
				string: true,
				default: 'randomDevice'
			},
			dryRun: {
				describe: "Don't actually spawn the WDIO process",
				type: 'boolean',
				boolean: true,
				default: false
			},
			dataRepository: {
				describe: 'Use `remote`for the new TDaaS, and `local` for CSV files',
				type: 'string',
				string: true,
				default: DataRepositoryEnum.local,
				choices: Object.keys(DataRepositoryEnum)
			},
			preset: {
				describe: 'Append arguments from one of the preset lists',
				type: 'string',
				string: true,
				default: undefined,
				choices: Object.keys(PresetEnum)
			},
			reportingName: {
				describe: 'Label used on cloud providers dashboard',
				type: 'string',
				string: true,
				default: undefined
				// choices: Object.keys(PresetEnum)
			},
			reportingNumber: {
				describe: 'Label used on cloud providers dashboard',
				type: 'number',
				number: true,
				default: undefined
			}
		})
		.help()
		.alias('help', 'h')
		.strict()
		.parserConfiguration({ 'camel-case-expansion': false, 'short-option-groups': false }).argv;

	return argv;
};

const applyPreset = (argv: CommandLineArguments) => {
	if (argv.preset) {
		const preset = _.get(PresetEnum, argv.preset);
		if (preset) {
			Object.assign(argv, preset);
		}
	}
};

const verifyAndApplyDeviceIds = (argv: CommandLineArguments) => {
	if (typeof argv.deviceID === 'string') {
		const devicesId = argv.deviceIds;
		if (devicesId === 'randomDevice') {
			argv.deviceIds = () => [Symbol('randomDevice')];
		} else {
			argv.deviceIds = () => [devicesId];
		}
	}
};

const verifyAppCompatibleWithServer = (argv: CommandLineArguments) => {
	const { app, server } = argv;
	const supportedServer = [ServerEnum.RUNWAY, ServerEnum.RUNWAY1];
	const nonSupportedServer: string[] = [ServerEnum.RUNWAY2, ServerEnum.RUNWAY3];
	if (app.toString() === AppNmaeEnum.WORKSPACE && nonSupportedServer.includes(server.toString())) {
		throw new Error(`${app.toString()} app can only use ${supportedServer.join('/')} as server`);
	}
};

const verifyProviderCompatibleWithBuildSubFolder = (argv: CommandLineArguments) => {
	const { provider } = argv;
	const providersWithBuildStoreSupport = ['appium', 'mock'];
	if (providersWithBuildStoreSupport.includes(provider) && argv.buildSubFolder !== BuildSubFolderEnum['build-store']) {
		throw new Error(`${provider} can only use ${BuildSubFolderEnum['build-store']} as buildSubFolder`);
	}
	if (provider === 'browserstack' && argv.buildSubFolder === BuildSubFolderEnum['build-store']) {
		throw new Error(`${provider} can't use ${BuildSubFolderEnum['build-store']} as buildSubFolder`);
	}
};

const verifyAppCompatibleWithBuildSubFolder = (argv: CommandLineArguments) => {
	const { app, buildSubFolder, provider } = argv;
	const ignorableProvider = ['appium', 'mock'];
	const workSpaceSupportedBuildSubFolder: string[] = [
		BuildSubFolderEnum.BrowserStack,
		BuildSubFolderEnum['BrowserStack-Stagging'],
		BuildSubFolderEnum['BrowserStack-Standalone'],
		BuildSubFolderEnum['Standalone-Beta']
	];

	const mangaSupportBuildSubFolder: string[] = [BuildSubFolderEnum.Regression, BuildSubFolderEnum.Feature, BuildSubFolderEnum.Runway];
	const directWealthSupportBuildSubFolder: string[] = [BuildSubFolderEnum.Regression, BuildSubFolderEnum.Feature, BuildSubFolderEnum.Runway];

	if (ignorableProvider.includes(provider)) {
		return;
	}

	if (app.toString() === AppNmaeEnum.WORKSPACE && !workSpaceSupportedBuildSubFolder.includes(buildSubFolder)) {
		throw new Error(`${app.toString()} app can only use ${workSpaceSupportedBuildSubFolder.join('/')} as buildSubFolder`);
	}
	if (app.toString() === AppNmaeEnum.MANGA && !mangaSupportBuildSubFolder.includes(buildSubFolder)) {
		throw new Error(`${app.toString()} app can only use ${mangaSupportBuildSubFolder.join('/')} as buildSubFolder`);
	}
	if (app.toString() === AppNmaeEnum.DIRECT_WEALTH && !directWealthSupportBuildSubFolder.includes(buildSubFolder)) {
		throw new Error(`${app.toString()} app can only use ${directWealthSupportBuildSubFolder.join('/')} as buildSubFolder`);
	}
};

const applyNumberOfDaysSince = (argv: CommandLineArguments) => {
	const fromSpecificDate = moment('13-11-2023', 'DD-MM-YY');
	const today = moment();
	argv.numberOfDaysSince = today.diff(fromSpecificDate, 'days');
};

export const getArgv = async (processArgv: string[]) => {
	const argv = await getDefaultArgs(processArgv);
	// The .Strict() above will catch unreconized Arguments which begin with - or -- we need the below to catch other excess arguments.
	const unrecognizedArguments = argv._.slice(2);

	if (unrecognizedArguments.length > 0) {
		throw new Error(`\n Found unreconized arguments : ${unrecognizedArguments.join(' ')}`);
	}

	applyPreset(argv);
	verifyAndApplyDeviceIds(argv);
	verifyAppCompatibleWithServer(argv);
	verifyAppCompatibleWithBuildSubFolder(argv);
	verifyProviderCompatibleWithBuildSubFolder(argv);
	applyNumberOfDaysSince(argv);
	return argv;
};
