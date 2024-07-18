const androidXClasses = ['RecyclerView', 'LinearLayoutCompat','cardview'];
const svgClasses = ['SvgView'];

const apiPackage = (viewClass: { class: string }) => {
    if (androidXClasses.includes(viewClass.class)){
        return 'androidx';
    }else if (svgClasses.includes(viewClass.class)) {
        return 'com.horcux';
    }else {
        return 'android';
    }
};

const selectorString = (viewClass: { namespace: string; class: string}) => `//${apiPackage(viewClass)},${viewClass.namespace}.${viewClass.class}`;
const axesString = (axes: 'ancestor' | 'parent' | 'following-sibling' | 'preceding-sibling', viewClass:{ namespace: string; class: string}) =>
      `/${axes}::${apiPackage(viewClass)}.${viewClass.namespace}.${viewClass.class}`;

export default class AndroidHelper {
    static byEnabledPartialResourceId(viewClass: {namespace: string; class: string }, id: string) {
        return `${selectorString(viewClass)}[constains(@resource-id,"${id}")] and @enabled="true"]` ;
    }

    static bydisabledPartialResourceId(viewClass: {namespace: string; class: string }, id: string) {
        return `${selectorString(viewClass)}[constains(@resource-id,"${id}")] and @enabled="false"]` ;
    }

    static bydisabledPartialResourceIdAndIndex(viewClass: {namespace: string; class: string }, id: string, index:number) {
        return `${selectorString(viewClass)}[constains(@resource-id,"${id}")] and @enabled="false"][${index}]` ;
    }

    static byText(viewClass: {namespace: string; class: string }, text: string) {
        return `${selectorString(viewClass)}[@text="${text}"]` ;
    }

    static byAncestor(viewClass: {namespace: string; class: string }) {
        return axesString ('ancestor', viewClass);
    }

    static byFollowingSiblingAndPartialTextAndIndex(viewClass: {namespace: string; class: string }, text: string, index: number) {
        return `${axesString('following-sibling', viewClass)}[constains(@resource-id,"${text}")][${index}]`;
    }
}
  