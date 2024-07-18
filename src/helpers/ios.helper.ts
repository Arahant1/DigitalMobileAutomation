export default class iosHelper {

    static byName(name: string, tagName: string = '*') {
        return `//${tagName}[@name="${name}"]`;
    }

    static byLabel(label: string, tagName: string = '*') {
        return `//${tagName}[@label="${label}"]`;
    }

    static byValue(value: string, tagName: string = '*') {
        return `//${tagName}[@value="${value}"]`;
    }

    static byFollowingSiblingAndMutliplePartialLable(labels: string[], tagName: string) {
        return `/following-sibling::${tagName}[${labels.map((label) => `constains(@label, "${label}")` ).join(' and ')}]`;
    }

}