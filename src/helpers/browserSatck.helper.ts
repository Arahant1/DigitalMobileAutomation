import _ from 'lodash';

import requestHelper from './requester.helper.js';

export const getBrowserStackLatestAppUrl = async (appName: string, buildSunFolder: string) => {
    const customAppId = `${appName}-${buildSunFolder}`;
    const response = await requestHelper.get(`https://api-cloud.browserstack.com/app-automate/recent_apps/${customAppId}`,{
        Authorization: `Basic ${Buffer.from(`${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESSKEY}`).toString('base64')}`
    });
    const appUrl = _.isEmpty(response.body) ? null : _.get(response.body[0], 'app_url');
    return appUrl;
};

export const getReportLink = async (sessionId: string) =>{
    const response = await requestHelper.get(`https://api-cloud.browserstack.com/app-automate/sessions/${sessionId}.json` ,{
        Authorization: `Basic ${Buffer.from(`${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESSKEY}`).toString('base64')}`
    });
    return _.get(response.body, 'automation_session.public_url');
}