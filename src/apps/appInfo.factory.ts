import _ from 'lodash';

import { getData } from '../data/savedAppData.repository.js';
import { SavedAppDataEnum } from '../enums/saveAppData.enum.js';


interface AppInfo{
    appPackage: string;
    appActivity: string;
    appName: string;
    fileName: string;

}


export default class AppInforFactory {
    static async getAppInfo(): Promise <AppInfo> {
        const platform = (_.get(getData(SavedAppDataEnum.cucumberOpts), 'platform') as unknown as string).toLowerCase();
        const appName = (_.get(getData(SavedAppDataEnum.cucumberOpts), 'appName') as unknown as string).toLowerCase();

        return (await import(['.', appName, platform, 'app.info.js'].join('/'))).default;
    }
}