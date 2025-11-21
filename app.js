import app from "./client.js";
import { getTTFramework, saveState } from "./datahandler.js";
import { blocks } from "./blocks.js";
const lraj23UserId = "U0947SL6AKB";
const lraj23BotTestingId = "C09GR27104V";
const gPortfolioDmId = "D09SN86RFC1";
const commands = {};

app.message("", async ({ message: { text, channel, channel_type } }) => {
	if ((channel_type === "im") && (channel === gPortfolioDmId)) {
		const info = text.split(";");
		console.log(info[0], commands[info[0]]);
		return commands[info[0]]({
			ack: _ => _,
			body: {
				user_id: info[1],
				channel_id: info[2]
			},
			respond: (response) => {
				if (typeof response === "string") return app.client.chat.postEphemeral({
					channel: info[2],
					user: info[1],
					text: response
				});
				if (!response.channel) response.channel = info[2];
				if (!response.user) response.user = info[1];
				app.client.chat.postEphemeral(response);
			}
		});
	}
});

app.message("/j", async ({ message: { channel, user, thread_ts, ts, text } }) => {
	if (text.split("/j").join("").trim()) {
		await app.client.chat.postEphemeral({ channel, user, text: "Your message was sent with a /j tone tag warning!", thread_ts: ((thread_ts == ts) ? undefined : thread_ts) });
		const info = await app.client.users.info({ user });
		await app.client.chat.postMessage({
			channel,
			text: "_This message was sent with a /j tone tag, so do not take this seriously..._",
			blocks: [
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "_<https://hackclub.slack.com/archives/" + channel + "/p" + (ts * 1000000) + "|This message was sent with a /j tone tag, so do not take this seriously...>_"
					}
				}
			],
			username: info.user.profile.display_name,
			icon_url: info.user.profile.image_original,
			thread_ts: ((thread_ts == ts) ? undefined : thread_ts)
		});
	} else {
		await app.client.chat.postEphemeral({
			channel,
			user,
			text: "Your message marked with a /j tone tag was empty, so you can enter what message you wanted to send here or cancel.",
			blocks: blocks.j,
			thread_ts: ((thread_ts == ts) ? undefined : thread_ts)
		});
	}
});

commands.j = async ({ ack, respond, body: { user_id: user, channel_id: channel }, command }) => {
	await ack();
	let text = "";
	if (command) text = command.text;
	if (text.trim()) {
		await respond({ channel, user, text: "Your message was sent with a /j tone tag warning!" });
		const info = await app.client.users.info({ user });
		await app.client.chat.postMessage({
			channel,
			text: "_This message was sent with a /j tone tag, so do not take this seriously..._\n" + text,
			username: info.user.profile.display_name,
			icon_url: info.user.profile.image_original
		});
	} else {
		await respond({
			channel,
			user,
			text: "Your message marked with a /j tone tag was empty, so you can enter what message you wanted to send here or cancel.",
			blocks: blocks.j
		});
	}
};
app.command("/ttframework-j", commands.j);
app.command("/j", commands.j);

commands["edit-opts"] = async ({ ack, body: { user_id: user }, respond }) => {
	await ack();
	const TTFramework = getTTFramework();
	const optInLevels = Object.entries({
		none: "Nothing",
		askEveryTime: "Ask Every Time",
		automatic: "Automatically Post"
	});
	if (!TTFramework.opts[user]) TTFramework.opts[user] = "askEveryTime";
	const currentOpted = TTFramework.opts[user];
	console.log(currentOpted);
	await respond({
		text: "Choose which type of opt-in you want to have:",
		blocks: [
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
		]
	});
};
app.command("/ttframework-edit-opts", commands["edit-opts"]);
app.action("edit-opts", async ({ ack, body: { user: { id: user } }, respond }) => commands["edit-opts"]({ ack, body: { user_id: user }, respond }));

app.action("confirm-opt-change", async ({ ack, body: { user: { id: user }, state: { values } }, respond }) => {
	await ack();
	const TTFramework = getTTFramework();
	console.log(values);
	const optInLevel = values[Object.keys(values)[0]]["ignore-opt-in-level"].selected_option.value || "none";
	console.log(optInLevel);

	switch (optInLevel) {
		case "none":
			await respond("<@" + user + "> set their opts to nothing. The bot will no longer interact with you whatsoever.");
			TTFramework.opts[user] = "none";
			break;
		case "askEveryTime":
			await respond("<@" + user + "> set their opts to ask every time. Every time you use a tone tag supported by the bot, the bot will ask if you want to add the tone tag warning. The bot will not send you messages or interact otherwise.");
			TTFramework.opts[user] = "askEveryTime";
			break;
		case "automatic":
			await respond("<@" + user + "> set their opts to automatically post. Every time you use a tone tag supported by the bot, the bot will post a tone tag morning. The bot will not send you messages or interact otherwise.");
			TTFramework.opts[user] = "automatic";
			break;
	}

	saveState(TTFramework);
});

app.action("confirm-j", async ({ ack }) => await ack());

app.action(/^ignore-.+$/, async ({ ack }) => await ack());

app.action("cancel", async ({ ack, respond }) => [await ack(), await respond({ delete_original: true })]);

app.action("confirm", async ({ ack }) => await ack());

commands.help = async ({ ack, respond, body: { user_id } }) => [await ack(), await respond("This is the Tone Tag Framework bot! It helps you write a message with a certain tone tag, and guides those who accidentally run tone tags as commands. _More information to be added..._\nFor more information, check out the readme at https://github.com/lraj23/tone-tag-framework."), user_id === lraj23UserId ? await respond("Test but only for <@" + lraj23UserId + ">. If you aren't him and you see this message, DM him IMMEDIATELY about this!") : null];
app.command("/ttframework-help", commands.help);

app.message(/secret button/i, async ({ message: { channel, user, thread_ts, ts } }) => await app.client.chat.postEphemeral({
	channel, user,
	text: "<@" + user + "> mentioned the secret button! Here it is:",
	thread_ts: ((thread_ts == ts) ? undefined : thread_ts),
	blocks: [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "<@" + user + "> mentioned the secret button! Here it is:"
			}
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Secret Button"
					},
					action_id: "button_click"
				}
			]
		}
	]
}));

app.action("button_click", async ({ body: { channel: { id: cId }, user: { id: uId }, container: { thread_ts } }, ack }) => [await ack(), await app.client.chat.postEphemeral({
	channel: cId,
	user: uId,
	text: "You found the secret button. Here it is again.",
	thread_ts,
	blocks: [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "You found the secret button. Here it is again."
			}
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Secret Button"
					},
					action_id: "button_click"
				}
			]
		}
	]
})]);