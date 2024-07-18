import path from 'node:path';

import parse from '@cucumber/tag-expressions';
import _ from 'lodash';
import { v4 } from 'uuid';

import { AppNmaeEnum } from '../enums/appNmae.enum.js';
import { PlatformEnum } from '../enums/platform.enum.js';
import { ServerEnum } from '../enums/server.enum.js';
import { cartesianProduct, getAllFilesInDir } from '../utils/utils.js';
import { CommandLineArguments } from './commandLineArgumentParser.js';
import { ParsedFeatureFileData, parseFeatueFile } from './featureFileParser.js';

export interface BaseCucumberOpts {
	specs: string[];
	cucumberOpts: {
		backtrace: boolean;
		failFast: boolean;
		format: string[];
		import: string[];
		tags: string;
		timeout: number;

		useInstalledApp: boolean;
		buildSubFolder: string;
		dataRepository: string;
		provider: string;
		preset?: string;

		id?: string;
		server?: string;
		appName?: string;
		platform?: string;
		deviceId?: string;
		platformVersion?: string;

		reportingName?: string;
		reportingNumber?: number;
		numberOfdaysSince: number;
	};
}

const createBaseCucumberOpts = async (argv: CommandLineArguments) => {
	const baseCucumberOpts: BaseCucumberOpts[] = [];

	const getAllTsFiles = async () => {
		const stepDefinitions = await getAllFilesInDir(path.resolve('./src/step_definitions'), '.ts');
		const hooks = await getAllFilesInDir(path.resolve('./src/wdio_config/hooks'), '.ts');
		return _.flatMap(stepDefinitions.concat(hooks));
	};

	const generateTagExpression = (tags: string[]) => {
		let defaultTags = `(${tags.join(' and ')}) and (${['not @pending', 'not @manual'].join(' and ')})`;
		if (argv.t && argv.t !== '@smoke') {
			defaultTags = defaultTags.concat(` and (${argv.t})`);
		}
		return defaultTags;
	};

	const generateDefaultOpts = async (tags: string[]) => ({
		specs: [],
		cucumberOpts: {
			backtrace: true,
			failFast: false,
			format: [],
			import: await getAllTsFiles(),
			tags: generateTagExpression(tags),
			timeout: 10 * 60 * 1000,

			useInstalledApp: argv.useInstalledApp,
			buildSubfolder: argv.buildSubFolder,
			dataRepository: argv.dataRepository,
			provider: argv.provider,
			preset: argv.preset,

			reportingName: argv.reportingName,
			reportingNumber: argv.reportingNumber,
			numberOfDaysSince: argv.numberOfDaysSince!
		}
	});

	for (const product of cartesianProduct(argv.server, argv.app, argv.plaform)) {
		const [server, app, platform]: [keyof typeof ServerEnum, keyof typeof AppNmaeEnum, keyof typeof PlatformEnum] = product;

		for (const device of argv.deviceIds(platform)) {
			const opts: BaseCucumberOpts = await generateDefaultOpts([argv.tags]);

			// unique identifier for each opts
			opts.cucumberOpts.id = v4();

			const appExpression = `@${app.toLocaleLowerCase()}`;
			const platformExpresion = platform === PlatformEnum.Android ? 'not @ios' : 'not @android';

			opts.cucumberOpts.tags = `${opts.cucumberOpts.tags} and (${[appExpression, platformExpresion].join(' and ')})`;

			opts.cucumberOpts.server = server;
			opts.cucumberOpts.appName = app;
			opts.cucumberOpts.platform = platform;

			if (typeof device !== 'symbol') {
				opts.cucumberOpts.deviceId = device;
			}

			if (typeof device === 'object' && !Array.isArray(device)) {
				const { deviceName, platformVersion } = device;
				opts.cucumberOpts.deviceId = deviceName;
				opts.cucumberOpts.platformVersion = platformVersion;
			}

			baseCucumberOpts.push(opts);
		}
	}

	return baseCucumberOpts;
};

interface GroupedCucumberOpts {
	[x: string]: BaseCucumberOpts;
}

const groupCucumberOpts = (baseCucumberOpts: BaseCucumberOpts[], parsedFeatureFileData: ParsedFeatureFileData[]) => {
	const groupedCucumberOpts: GroupedCucumberOpts = {};

	const fileContainsRunnableScenarios = (rawData: ParsedFeatureFileData, cucumberOpts: BaseCucumberOpts) => {
		const fileTags = rawData.tags;
		const ast = parse(cucumberOpts.cucumberOpts.tags);
		return fileTags.some((tags) => ast.evaluate(tags));
	};

	for (const product of cartesianProduct(parsedFeatureFileData, baseCucumberOpts)) {
		const [rawData, cucumberOpts]: [ParsedFeatureFileData, BaseCucumberOpts] = product;

		if (fileContainsRunnableScenarios(rawData, cucumberOpts)) {
			const id: string = cucumberOpts.cucumberOpts.id as string;

			if (!groupedCucumberOpts[id]) {
				groupedCucumberOpts[id] = JSON.parse(JSON.stringify(cucumberOpts));
			}
			if (!groupedCucumberOpts[id].specs.includes(rawData.featureFile)) {
				groupedCucumberOpts[id].specs.push(rawData.featureFile);
			}
		}
	}

	// Sort the spec files in order
	Object.values(groupedCucumberOpts).forEach(({ specs }) => {
		specs.sort();
	});

	return Object.values(groupedCucumberOpts);
};

export const generateOpts = async (argv: CommandLineArguments, parsedFeatureFileData: ParsedFeatureFileData[]) => {
	const baseCucumberOpts = await createBaseCucumberOpts(argv);
	return Promise.resolve(groupCucumberOpts(baseCucumberOpts, parsedFeatureFileData));
};

export const generateCucumberOpts = async (argv: CommandLineArguments, featureFiles: string[]) => {
	const parsedFeatureFileData = await parseFeatueFile(featureFiles);
	return await generateOpts(argv, parsedFeatureFileData);
};
