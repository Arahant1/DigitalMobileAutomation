import iosHelper from '../../../../helpers/ios.helper.js';
import BaseNavigatorScreen from '../../../native/base/navigator/navigator.screen.js';

export default class NavigatorScreen extends BaseNavigatorScreen {
    constructor(){
        super();
        this.title = iosHelper.byLabel('navigator','XCUIElementTypeStaticText');
    }
}