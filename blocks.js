const blocks = {};

blocks["ask-j"] = [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "Your message included a /j tone tag! Do you want to add the warning?"
		}
	},
	{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":x: Cancel",
					emoji: true
				},
				value: "cancel",
				action_id: "cancel"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":very-mad: Change Opts",
					emoji: true
				},
				value: "edit-opts",
				action_id: "edit-opts"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":white_check_mark: Go",
					emoji: true
				},
				value: "confirm",
				action_id: "tone-tag-j"
			}
		]
	}
];

blocks["automatic-j"] = (channel, ts) => [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "_<https://hackclub.slack.com/archives/" + channel + "/p" + (ts * 1000000) + "|This message was sent with a /j tone tag, so do not take this seriously...>_"
		}
	}
];

blocks["empty-j"] = [
	{
		type: "input",
		element: {
			type: "plain_text_input",
			multiline: true,
			action_id: "ignore-j"
		},
		label: {
			type: "plain_text",
			text: "Your message marked with a /j tone tag was empty, so you can enter what message you wanted to send here or cancel.",
			emoji: true
		},
		optional: false
	},
	{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":x: Cancel",
					emoji: true
				},
				value: "cancel",
				action_id: "cancel"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":very-mad: Don't like this; opt out",
					emoji: true
				},
				value: "edit-opts",
				action_id: "edit-opts"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":white_check_mark: Confirm",
					emoji: true
				},
				value: "confirm-j",
				action_id: "confirm-j"
			}
		]
	}
];

blocks["edit-opts"] = (optInLevels, currentOpted) => [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "Choose which type of opt-in you want to have:"
		},
		accessory: {
			type: "static_select",
			placeholder: {
				type: "plain_text",
				text: "Required",
				emoji: true
			},
			options: optInLevels.map(level => ({
				text: {
					type: "plain_text",
					text: level[1],
					emoji: true
				},
				value: level[0]
			})),
			initial_option: {
				text: {
					type: "plain_text",
					text: Object.fromEntries(optInLevels)[currentOpted],
					emoji: true
				},
				value: currentOpted
			},
			action_id: "ignore-opt-in-level"
		}
	},
	{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":x: Cancel",
					emoji: true
				},
				value: "cancel",
				action_id: "cancel"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":white_check_mark: Go!",
					emoji: true
				},
				value: "confirm",
				action_id: "confirm-opt-change"
			}
		]
	}
];

export {
	blocks
};