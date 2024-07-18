module.exports = {
	extends: ['@commitlint/config-conventional'],
	plugins: [
		{
			rules: {
				'commit-message-rule': ({ header }) => {
					const regex = /((^(DCTI|DMA|DW|MANGA|WPSS)-[0-9]{1-8})|^(pilot|Revert|Merge)).*$/;
					if (header.match(regex)) {
						return [true];
					}
					return [false, 'commit message must match this format, i.e Jira Id followed by commit message. EX: "DCTI-0000 This is an example"'];
				}
			}
		}
	],
	rules: {
		'type-empty': [0],
		'subject-empty': [0],
		'type-enum': [0],
		'head-max-length': [0, 'always', 150],
		'commit-message-rule': [2, 'always']
	}
};
