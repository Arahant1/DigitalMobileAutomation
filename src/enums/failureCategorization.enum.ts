/* This Enum file returns the error category when a test case is failed with mapped error.
*Based on this error mapping failure category will be updated in dashboard/script output.
*Note: This file should be untouched until unless there is a need.
*/

export const FailureCategorizationEnum = {
    ELEMENT_NOT_FOUND: [
        'An element could not be located on the page using the give search parameters',
        'was expected to be displayed',
        'was expected to be enabled',
        'not found afetr scrolling',
        'not found afetr swipping'
    ],
    INFRA_ERROR: ['No chromedriver found that can automate Chrome'],
    SCRIPT_ERROR:['some args are undefined','Screen not found'],
    LOGIN_ERROR:['Login to the app is unsuccessful'],
    TEST_DATA_NOT_FOUND:['Test not found']
}as const