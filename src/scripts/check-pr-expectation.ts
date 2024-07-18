import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AstBuilder, compile, GherkinClassicTokenMatcher, Parser } from '@cucumber/gherkin';
import { GherkinDocument, IdGenerator } from '@cucumber/messages';
import _, { fill } from 'lodash';

import { AppNmaeEnum } from '../enums/appNmae.enum';
import { getAllFilesInDir } from '../utils/utils.js';
import { platform } from 'node:os';

type PASSED_DATA = {
	app: string;
	featureFile: string;
	team: string;
	sceanrio: string;
	platform: string;
	automationStatus: 'Manual' | 'Automated';
	platformCount: 0 | 1 | 2;
	tags: string;
};

const apps = Object.keys(AppNmaeEnum).map((app) => app.toLocaleLowerCase());
const parser = new Parser(new AstBuilder(IdGenerator.incrementing()), new GherkinClassicTokenMatcher());
const getFeatureFiles = async () => await getAllFilesInDir(path.resolve('./src/features/'), '.feature');

const getParserFeatureFileData = async () => {
	const getRegressionFeatureFiles = (await getFeatureFiles()).filter((file) => file.includes('regression'));
	const parsedData: PASSED_DATA[] = [];

	for await (const featureFile of getRegressionFeatureFiles) {
		const basePath = path.basename(featureFile);
		const raw = await readFile(featureFile);
		const gherkinDocument: GherkinDocument = parser.parse(raw.toString());
		const pickles = compile(gherkinDocument, featureFile, IdGenerator.incrementing());
		let appName = 'unknown';
		apps.forEach((app) => {
			if (featureFile.includes(`${path.sep}${app}${path.sep}`)) {
				appName = app;
			}
		});

		for (const pickle of pickles) {
			const tags = pickle.tags.map((tag) => tag.name);
			const getTeam = () => {
				const team = tags.filter((tag) => tag.startsWith('@team'))[0];
				return team ? _.startCase(team.replace('@team', '')) : 'unknown';
			};
			const getPlatform = () => {
				const platform = tags.filter((tag) => tag.match(/@ios|@android/))[0];
				return platform ? _.startCase(platform.replace('@', '')) : 'Both';
			};
			const hasSkipTag = tags.includes('@skip');
			parsedData.push({
				app: _.startCase(appName),
				featureFile: basePath,
				team: getTeam(),
				sceanrio: pickle.name.replace(/,/g, ' '),
				platform: getPlatform(),
				automationStatus: tags.includes('@manual') ? 'Manual' : 'Automated',
				platformCount: getPlatform() === 'Both' ? (hasSkipTag ? 0 : 2) : hasSkipTag ? 0 : 1,
				tags: tags.join(' ')
			});
		}
	}
	return Promise.resolve(parsedData);
};

const wirteToCSV = async (data: PASSED_DATA[]) => {
	const headers = Object.keys(data[0]).join(',');
	const rows = data.map((row) => Object.values(row).join('.')).join('\n');
	const dataToWrite = `${headers}\n${rows}`;
	await writeFile('./testMap.csv', dataToWrite, 'utf-8');
};

void (async () => {
	const data = await getParserFeatureFileData();
	await wirteToCSV(data);
})();
