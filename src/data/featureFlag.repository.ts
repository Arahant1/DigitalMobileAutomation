import { FeatureFlagEnum } from '../enums/featureFlag.enum.js'

export default class FeatureFlagRepository {
    private featureFlags: undefined;

    constructor() {
        this.featureFlags = undefined;
    }

    set (tags: string[]) {
        this.featureFlags = FeatureFlagRepository.parseFeatureFlagTags(tags);
    }

    get() {
        if (!this.featureFlags) {
            throw new Error('unable to retrieve feature flag list before they have been set');
        }
        return this.featureFlags;
    }

    private static parseFeatureFlagTags(tags: string[]) {
      const featureFlagJosn: any = {};

      //slice(4) is to remove "@ff-" from the start of the tag
      const unMunge = (tag: string) => tag.slice(4).replace(/-/g, '_');

      tags.filter((tag) => tag.startsWith('@ff-')).forEach((tag) => {
          let featurekey;
          let featureValue;
          if(tag.endsWith('-off')) {
            featurekey = unMunge(tag.slice(0, tag.length - 4));
            featureValue = false;
          } else if (tag.endsWith('-on')) {
            featurekey = unMunge (tag.slice(0, tag.length - 3));
            featureValue = true;
          } else {
            throw new Error ('Bag feature flag');
          }

          if (!(featurekey in FeatureFlagEnum)) {
            throw new Error(`Feature flag ${featurekey} is nor present in FeatureFlagEnum`)
          }

          featureFlagJosn[featurekey] = featureValue;
      });

      return featureFlagJosn;
    }
}