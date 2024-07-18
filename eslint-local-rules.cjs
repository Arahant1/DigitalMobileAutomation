'use strict';

/**
 * ESlint rule to avoid using 'new Date()'. Suggests using 'moment()' mthod insead
 * @type{import('eslint').Rule.RuleModule}
 */

const noNewDateRule = {
	meta: {
		type: 'problem',
		hasSuggestions: false,
		docs: {
			description: 'Avoid using "new Date()". Consider using "moment()" methods.',
			category: 'Best Practies'
		}
	}
};
