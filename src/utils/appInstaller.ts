import DeviceState from './device.state.js';
import logger from './logger.js';

export default class AppInstaller {
    deviceState: DeviceState;
    install:() => Promise<void>;
    uninstall:() => Promise<void>;
    sleepTime: number;
    constructor (deviceState: DeviceState, appInstall: () => Promise<void>, appUnInstall: () => Promise<void>) {
        this.deviceState = deviceState;
        this.install = appInstall;
        this.uninstall = appUnInstall;
        this.sleepTime = 3000;
    }
   
    async installApp(forceInstall: boolean = false) {
        const shouldInstallApp = forceInstall || !this.deviceState.getAppInstalled();

        if (shouldInstallApp) {
            this.deviceState.setAppInstalled(false);
            logger.debug('Unintsalling App from app installer');
            await this.uninstall();
            await browser.pause(this.sleepTime);
            logger.debug('App Unintsalation has been  completed');

            logger.debug('Installing app from app installer');
            for (let i = 0; i < 3; i++) {
                try {
                    logger.debug(`App install: Attempt number ${i +1}`);
                    await this.install();
                    break;                    
                } catch (error) {
                    if (error.message.includes('App path is undefined or not set for provider')){
                        throw error;
                    }
                    if (i === 2) {
                        this.deviceState.setAppInstalled(false);
                        throw error;
                    }
                    logger.debug(`App install Failed: Retry after ${i +1} minute.`);
                    await browser.pause(60000 * (i + 1));                   
                }
            }
            logger.debug('App Installation has been completed. ');
            this.deviceState.setAppInstalled(true);
            this.deviceState.setEnrolledUser(undefined)
        }
        return Promise.resolve(shouldInstallApp);    
    }

    async forceInstallApp() {
        return this.installApp(true)     
    }
}