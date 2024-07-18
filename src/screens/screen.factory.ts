import fs from 'node:fs';
import path from 'node:path';

import _ from 'lodash';

import { getData } from '../data/savedAppData.repository.js';
import { SavedAppDataEnum } from '../enums/saveAppData.enum.js';

export default class ScreenFactory {
    static async createScreen(trialPaths: string[]) {
        for await (const trialPath of trialPaths) {
            if (fs.existsSync(path.join(path.resolve('./src/screens'), trialPath))){
                const Screen = (await import(trialPath)).default;
                return new Screen();
            }
        }
        throw new Error (`Screen not found on ${trialPaths.join(' or ')}`);
    }

    static async getNativeScreen(screenName: string) {
        const platform = (_.get(getData(SavedAppDataEnum.cucumberOpts),'platform') as unknown as string).toLowerCase();
        const appName = (_.get(getData(SavedAppDataEnum.cucumberOpts),'appName') as unknown as string).toLowerCase();

        return await ScreenFactory.createScreen([`./native/${appName}/${platform}/${screenName}.ts`]);
    }

    static async getWebScreen( screenName: string) {
        const appName = (_.get(getData(SavedAppDataEnum.cucumberOpts),'appName') as unknown as string).toLowerCase();
        return await ScreenFactory.createScreen([`./web/${appName}/${screenName}.ts`]);
    }
}