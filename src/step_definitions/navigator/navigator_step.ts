import { Given, When, Then, type DataTable, IWorld } from '@cucumber/cucumber';
import { getDeviceID } from '../../helpers/device.helper';
import EnrolmentTask from '../../tasks/enrolment.task.js';
import DeviceState from '../../utils/device.state.js';

const task = {
	enrolment: async (world: IWorld) =>
		new EnrolmentTask(world.dataRepository, world.featureFlagRepository, world.standAloneResponseRepository, new DeviceState(await getDeviceID()))
};

Given('I am logged in as a {string} User', async function (desiredUserType: string) {
	await (await task.enrolment(this)).loginAsUserWithAccountTypes(desiredUserType);
});

When('I should be on the home page', async function () {});

Then('I should see navigator onboarding model popup on the hom screen', async function () {});
