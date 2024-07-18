/* eslint no-mixed-operators: 0 */
import _ from 'lodash';
import moment from 'momnet';
import { v4 } from 'uuid';
import { Selector } from 'webdriverio/build/types';

import { isAndroid, isiOS } from '../../helpers/device.helper';
import { promises } from 'fs';

const WAIT_FOR_TIMEOUT = 5000;
const WAIT_FOR_NOT_VISIBLE_TIMEOUT = 1000;
const IMPLICATION_TIMEOUT = 2000;

type RectReturn = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type Timeouts = {
	script?: number;
	pageLoad?: number;
	implicit?: number;
};

let screensize: RectReturn;

interface BrowserSize {
	width: number;
	height: number;
}

export default class Actions {
	/**
	 *  @module Custom
	 *  @name validateUndefinedArgs
	 *  @description Validate the arguments passed to the action methods. If the arguments are empty throw error
	 *  @param {any []} args arguments to be vaildated
	 *
	 *  @return {void}
	 */

	static validateUndefinedArgs(...args: any[]): void {
		if (_.some(args, (value) => value === undefined || '')) {
			throw Error('some args are undefined');
		}
	}

	// ========================= Below are generic WDIO / Appium methods =======================================

	/**
	 *  @module Appium/webdriverio
	 *  @name switchContext
	 *  @description Mobile JSON wire protocol command, used to switch to particular context
	 *  @see {@Link https://webdriver.io/docs/api/mjsonwp#switchcontext}
	 *
	 *  @param {string} context a string representing an available context
	 *
	 *  @return {Promise <void>}
	 */
	static async switchContext(context: string): Promise<void> {
		this.validateUndefinedArgs(context);
		await driver.switchContext(context);
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name getContexts
	 *  @description Mobile JSON wire protocol command, used to switch to particular context
	 *  @see {@Link https://webdriver.io/docs/api/mjsonwp#getcontexts}
	 *
	 *  @return {Promise <string[]>}
	 */
	static async getContexts(): Promise<string[]> {
		return (await browser.getContexts()).map((context) => context.toString());
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name getContext
	 *  @description Mobile JSON wire protocol command, used to switch to particular context
	 *  @see {@Link https://webdriver.io/docs/api/mjsonwp#getcontext}
	 *
	 *  @return {Promise <string>}
	 */
	static async getContext(): Promise<string> {
		return (await browser.getContext()).toString();
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name pause
	 *  @description pauses the execution for given specific amount of time
	 *  @see {@Link https://webdriver.io/docs/api/browser/pause}
	 *
	 *  @param {number} as a time in ms
	 *
	 *  @return {Promise <unknown>}
	 */
	static async pause(ms: number): Promise<unknown> {
		this.validateUndefinedArgs(ms);
		return await browser.pause(ms);
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name click
	 *  @description click on the given selector
	 *  @see {@Link https://webdriver.io/docs/api/browser/element/click}
	 *
	 *  @param {Selector} selector to be clicked
	 *
	 *  @return {Promise <void>}
	 */
	static async click(selector: Selector): Promise<void> {
		this.validateUndefinedArgs(selector);
		await $(selector).click();
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name isDisplayed
	 *  @description Return true if the selector is displayed
	 *  @see {@Link https://webdriver.io/docs/api/browser/element/isDisplayed}
	 *
	 *  @param {Selector} selector to be displayed
	 *
	 *  @return {Promise <boolean>}
	 */
	static async isDisplayed(selector: Selector): Promise<boolean> {
		this.validateUndefinedArgs(selector);
		let isDisplayed: boolean;
		try {
			isDisplayed = await $(selector).isExisting();
		} catch {
			isDisplayed = false;
		}
		return isDisplayed;
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name isExisting
	 *  @description Return true if the selector is isExisting
	 *  @see {@Link https://webdriver.io/docs/api/browser/element/isExisting}
	 *
	 *  @param {Selector} selector to be isExisting
	 *
	 *  @return {Promise <boolean>}
	 */
	static async isExisting(selector: Selector): Promise<boolean> {
		this.validateUndefinedArgs(selector);
		let isExisting: boolean;
		try {
			isExisting = await $(selector).isExisting();
		} catch {
			isExisting = false;
		}
		return isExisting;
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name isEnabled
	 *  @description Return true if the selector is isEnabled
	 *  @see {@Link https://webdriver.io/docs/api/browser/element/isEnabled}
	 *
	 *  @param {Selector} selector to be isEnabled
	 *
	 *  @return {Promise <boolean>}
	 */
	static async isEnabled(selector: Selector): Promise<boolean> {
		this.validateUndefinedArgs(selector);
		let isEnabled: boolean;
		try {
			isEnabled = await $(selector).isEnabled();
		} catch {
			isEnabled = false;
		}
		return isEnabled;
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name clearValue
	 *  @description Return true if the selector is displayed
	 *  @see {@Link https://webdriver.io/docs/api/browser/element/clearValue}
	 *
	 *  @param {Selector} selector to clear the Value
	 *
	 *  @return {Promise <void>}
	 */
	static async clearValue(selector: Selector): Promise<void> {
		this.validateUndefinedArgs(selector);
		await $(selector).clearValue();
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name getWindowSize
	 *  @description Return true if the selector is displayed
	 *  @see {@Link https://webdriver.io/docs/api/browser/getWindowSize}
	 *
	 *  @return {Promise <BrowserSize>}
	 */
	static async getWindowSize(): Promise<BrowserSize> {
		return await browser.getWindowSize();
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name installApp
	 *  @description install the given app onto the device
	 *  @see {@Link https://webdriver.io/docs/api/appium/#installApp}
	 *
	 *  @param {string} appPath path of app to be installed
	 *
	 *  @return {Promise <void>}
	 */
	static async installApp(appPath: string): Promise<void> {
		this.validateUndefinedArgs(appPath);
		await browser.installApp(appPath);
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name activateApp
	 *  @description Activate the given app onto the device
	 *  @see {@Link https://webdriver.io/docs/api/appium/#activateApp}
	 *
	 *  @param {string} appPackage to activate
	 *
	 *  @return {Promise <void>}
	 */
	static async activateApp(appPackage: string): Promise<void> {
		this.validateUndefinedArgs(appPackage);
		await browser.activateApp(appPackage);
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name terminateApp
	 *  @description terminate the given app onto the device
	 *  @see {@Link https://webdriver.io/docs/api/appium/#terminateapp}
	 *
	 *  @param {string} appPackage app to terminate
	 *
	 *  @return {Promise <void>}
	 */
	static async terminateApp(appPackage: string): Promise<void> {
		this.validateUndefinedArgs(appPackage);
		await browser.terminateApp(appPackage);
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name removeApp
	 *  @description remove the given app onto the device
	 *  @see {@Link https://webdriver.io/docs/api/appium/#removeapp}
	 *
	 *  @param {string} appPackage app to remove
	 *
	 *  @return {Promise <void>}
	 */
	static async removeApp(appPackage: string): Promise<void> {
		this.validateUndefinedArgs(appPackage);
		await browser.removeApp(appPackage);
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name getOrientation
	 *  @description JSON write protocal command, used to the orientation of device
	 *  @see {@Link https://webdriver.io/docs/api/jsnow/#getprientation}
	 *
	 *
	 *  @return {Promise <string>}
	 */

	static async getOrientation(): Promise<string> {
		return await browser.getOrientation();
	}

	/**
	 *  @module Appium/webdriverio
	 *  @name setOrientation
	 *  @description JSON write protocal command, used to the orientation of device
	 *  @see {@Link https://webdriver.io/docs/api/jsnow/#setprientation}
	 *
	 *
	 *  @return {Promise <string>}
	 */

	static async setOrientation(orientation: string): Promise<void> {
		await browser.setOrientation(orientation);
	}

	// TODO
}
