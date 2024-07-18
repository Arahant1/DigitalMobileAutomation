import { HookFunctionExtension } from '@wdio/cucumber-framework/build/types';
import { Capabilities, Options } from '@wdio/types'

export interface Config extends WebdriverIO.Config, HookFunctionExtension {
    debugInfo?: (config: object, capabilities: CustomRemoteCapabilities) => void; 
}

export interface CustomRemoteCapabilities extends Capabilities.DesiredCapabilities {
    'cusotom:testId': string;
}

interface CustomCucumberOpts extends WebdriverIO.CucumberOpts {
    useInstalledApp: boolean;
    buildSubFolder: string;
    dataRepository: string;
    provider: string;
    preset?: string;

    server: string;
    appName: string;
    plaform: string;
    deviceId: any;
    platformVersion?: string;

    reportingName?: string;
    reportingNumber?: number;
    numberOfDaysSince:number;
}

export interface CustomTestRunnerOptions extends Options.Testrunner {
    cucumberOpts: CustomCucumberOpts;
}
