import { Given, When, Then, type DataTable } from '@cucumber/cucumber';

Given('I am logged in as a {string} User', async function (desiredUserType: string) {
	await (await task.enrolment(this)).loginasUserWithAccountTypes(desiredUserType);
});

When('I should be on the home page', async function () {});

Then('I should see navigator onboarding model popup on the hom screen', async function () {});
