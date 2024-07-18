import { After, Before, IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import _ from 'lodash';

import DataRepository from '../../data/data.repository.js';
import FeatureFlagRepository from '../../data/featureFlag.repository.js'
import { getData, setData } from '../../data/savedAppData.repository.js';
import StandaloneResponseRepository from '../../data/standaloneResponse.repository.js'
import { SavedAppDataEnum } from '../../enums/saveAppData.enum.js';
import { terminateApp} from '../../helpers/device.helper.js';
import LogoutTask from '../../tasks/LogoutTask.js';

class CustomWorld extends World {
    protected dataRepository: DataRepository;
    protected featureFlagRepository: FeatureFlagRepository;
    protected standaloneResponseRepositor: StandaloneResponseRepository;
    constructor(options: IWorldOptions) {
        super(options);
        this.dataRepository = new DataRepository();
        this.featureFlagRepository = new FeatureFlagRepository();
        this.standaloneResponseRepositor = new StandaloneResponseRepository();
    }
}

setWorldConstructor(CustomWorld);

Before(async function (world) {
    const dataRepository = _.get(getData(SavedAppDataEnum.cucumberOpts), 'dataRepository');
    await this.dataRepository.initialize(dataRepository);
    const tags = world.pickle.tags.map((tag) => tag.name);
    const hasSurveyTag = tags.some((tag) => tag.startsWith('@ff-showSurevyEnabled'));
    if (!hasSurveyTag) {
        tags.push('@ff-showSurveyEnabled-off');
    }
    setData(SavedAppDataEnum.isStubScenario, tags.includes('@stub'));
    this.featureFlagRepository.set(tags);
    this.standaloneResponseRepositor.set(tags);
});

After(async function() {
    try {
        await LogoutTask.logOut();
        await terminateApp();
    } catch (error) {
        // error is suppressed as is executes in after hook
    }
});