import _ from 'lodash';

import { StandaloneResponseEnum } from '../enums/standaloneResponse.repository.Enum.js';

export default class StandaloneResponseRepository {
    private standaloneResponse: undefined;

    constructor() {
        this.standaloneResponse = undefined;
    }

    set (tags: string[]) {
        this.standaloneResponse = StandaloneResponseRepository.parseStandaloneResponseTags(tags);
    }

    get() {
        if (!this.standaloneResponse) {
            throw Error('Unable to retrieve standalone response before they set have been set');
        }
        return this.standaloneResponse;
    }

    private static parseStandaloneResponseTags(tags: string[]) {
       const standaloneResponseJson: any = {};

       tags.filter((tag) => tag.startsWith('@standalone')).forEach((tag) => {
        const [, standaloneKey, standaloneValue] = tag.split('-');
        const standaloneKeys = Object.keys(StandaloneResponseEnum);

        const enumKey = _.find(standaloneKeys, (element) => element.toLowerCase() === standaloneKey.toLowerCase()) as keyof typeof StandaloneResponseEnum;
        if (!enumKey) {
            throw new Error (`Given standaloneKey "${standaloneKey}" is not declared in standaloneResponseEnum`);
        }

        const enumValue = _.get(StandaloneResponseEnum[enumKey], standaloneValue);

        if (!enumValue) {
            throw new Error(`Given standaloneValue "${standaloneValue}" is not declared in standaloneResponseEnum under standaloneKey "${standaloneKey}"`);
        }

        _.assign(standaloneResponseJson, { [enumKey]: enumValue });
       }); 

       return standaloneResponseJson;
    }
}