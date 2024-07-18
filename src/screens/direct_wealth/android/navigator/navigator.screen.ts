import {AndroidViewClassEnum } from '../../../../enums/AndroidViewClass.enum.js';
import AndroidHelper from '../../../../helpers/android.helpers.js';
import BaseNavigatorScreen from '../../../native/base/navigator/navigator.screen.js';

export default class NavigatorScreen extends BaseNavigatorScreen {
    constructor() {
        super();
        this.title = AndroidHelper.byText(AndroidViewClassEnum.TEXT_VIEW, 'Navigator');
    }
}