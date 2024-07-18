/**
 * This enum file holds dynamic data which once saved can be reused a/c steps/pages/screen.
 * Due to this structuredClone, we can improve strick validation a/c pages and ruless value when ever required.
 * Note: Objects should be combined with user journey name and actions name while added.
 */

export const SavedAppDataEnum = {
	cucumberOpts: 'cucumberOpts',
	testId: 'testId',
	isStubScenario: 'isStubScenario',
	// Above are related to core
	policyNumber: 'policyNumber',
	investmentPerformanceValue: 'investmentPerformanceValue',
	navigatedAccount: 'navigatedAccount',
	personalDetails: 'personalDetails',
	beneficiaryToBedeleted: 'benficiaryToBeDeleted',
	updtedBenficiaryAddress: 'updatedBenficiaryAddress',
	addedBenficiarydetails: 'addedBenficiarydetails'
} as const;
