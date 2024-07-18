export default class WebHelper {
	private static makeCaseInsensitive(): string {
		return "translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxy)";
	}

	static btText(webElement: { elemnt: string }, text: string) {
		return `//${webElement.elemnt}[normalize-space(${this.makeCaseInsensitive()})]="${text.toLocaleLowerCase()}"]`;
	}

	static byPartialText(webElement: { element: string }, text: string) {
		return `//${webElement.element} [contains(${this.makeCaseInsensitive()}, "${text.toLowerCase()}")]`;
	}

	static byId(webElement: { element: string }, id: string) {
		return `//${webElement.element} [@id="${id}"]`;
	}
}
