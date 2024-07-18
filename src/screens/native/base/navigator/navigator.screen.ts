import _ from 'lodash';

import Screen from '../../../screen.ts'

export default class NavigatorScreen extends Screen {
    title: string;
    factFind: string;
    progressBarOnFactFinder: (segment: string, progress: string) => string;
    constructor() {
        super();
        this.title = _.toString(undefined);
        this.progressBarOnFactFinder = () => _.toString(undefined);
    }
}