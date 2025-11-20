const blocks = {};

blocks.j = [
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

export {
	blocks
};