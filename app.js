import app from "./client.js";
import { getTTFramework, saveState } from "./datahandler.js";
import { blocks } from "./blocks.js";
const lraj23UserId = "U0947SL6AKB";
const lraj23BotTestingId = "C09GR27104V";
const gPortfolioDmId = "D09SN86RFC1";
const commands = {};
const toneTags = {};

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


const setToneTag = (tagName, description) => {
	toneTags[tagName] = async interaction => {
		if (interaction.ack) interaction.ack();
		const TTFramework = getTTFramework();
		if (interaction.message) {
			const { message: { channel, user, thread_ts, ts, text } } = interaction;
			if (!TTFramework.opts[user]) TTFramework.opts[user] = "askEveryTime";
			const opts = TTFramework.opts[user];
			if (opts === "none") return;
			const message = text.split("/" + tagName).join("").trim();
			console.log(opts, message, thread_ts, ts);
			if (message) {
				if (opts === "askEveryTime") await app.client.chat.postEphemeral({
					channel,
					user,
					text: "Your message included a /" + tagName + " tone tag! Do you want to add the warning?",
					blocks: blocks["ask"](thread_ts, ts, tagName),
					thread_ts: ((thread_ts == ts) ? undefined : thread_ts)
				});
				else {
					const info = await app.client.users.info({ user });
					await app.client.chat.postMessage({
						channel,
						text: "_This message was sent with a /" + tagName + " tone tag, so " + description + "_",
						blocks: blocks["automatic"](channel, ts, tagName, description),
						username: info.user.profile.display_name,
						icon_url: info.user.profile.image_original,
						thread_ts: ((thread_ts == ts) ? undefined : thread_ts)
					});
				}
			} else await app.client.chat.postEphemeral({
				channel,
				user,
				text: "Your message marked with a /" + tagName + " tone tag was empty, so you can enter what message you wanted to send here or cancel.",
				blocks: blocks["empty"](thread_ts, ts, tagName),
				thread_ts: ((thread_ts == ts) ? undefined : thread_ts)
			});
			saveState(TTFramework);
		} else {
			const { respond, body: { user_id: user, channel_id: channel }, command } = interaction;
			let text = "";
			if (command) text = command.text;
			if (text.trim()) {
				const info = await app.client.users.info({ user });
				await app.client.chat.postMessage({
					channel,
					text: "_This message was sent with a /" + tagName + " tone tag, so " + description + "_\n" + text,
					username: info.user.profile.display_name,
					icon_url: info.user.profile.image_original
				});
				await respond({ channel, user, text: "Your message was sent with a /" + tagName + " tone tag warning!" });
			} else {
				await respond({
					channel,
					user,
					text: "Your message marked with a /" + tagName + " tone tag was empty, so you can enter what message you wanted to send here or cancel.",
					blocks: blocks["empty"](undefined, undefined, tagName)
				});
			}
		}
	};
	app.message("/" + tagName, toneTags[tagName]);
	commands[tagName] = toneTags[tagName];
	app.command("/ttframework-" + tagName, commands[tagName]);
	app.command("/" + tagName, commands[tagName]);

	app.action("tone-tag-" + tagName, async ({ ack, body: { user: { id: user }, channel: { id: channel }, state: { values }, actions: { 0: { value } } }, respond }) => {
		await ack();
		console.log(values, user, !!Object.entries(values).length);
		const thread_ts = value.split("|")[0];
		const ts = value.split("|")[1];
		if (Object.entries(values).length) {
			const message = values[Object.keys(values)[0]]["ignore-" + tagName].value;
			console.log(message);
			const warn = async msg => app.client.chat.postEphemeral({
				channel,
				user,
				text: msg,
				blocks: blocks.warn(msg)
			});
			if (!message) return await warn("Enter a message!");
			const info = await app.client.users.info({ user });
			console.log(value);
			await app.client.chat.postMessage({
				channel,
				text: "_This message was sent with a /" + tagName + " tone tag, so " + description + "_\n" + message,
				username: info.user.profile.display_name,
				icon_url: info.user.profile.image_original,
				thread_ts: ((thread_ts == "undefined") ? undefined : thread_ts)
			});
			await respond({ channel, user, text: "Your message was sent with a /" + tagName + " tone tag warning!" });
		} else {
			console.log(value);
			console.log(thread_ts, ts);
			await app.client.chat.postMessage({
				channel,
				text: "_This message was sent with a /" + tagName + " tone tag, so " + description + "_",
				blocks: blocks["automatic"](channel, ts, tagName, description),
				thread_ts: ((thread_ts === "undefined") ? undefined : thread_ts)
			});
		}
	});
}
setToneTag("j", "do not take this seriously...");
setToneTag("srs", "what this person is saying is actually important, and you probably shouldn't joke around...");

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
		blocks: blocks["edit-opts"](optInLevels, currentOpted)
	});
};
app.command("/ttframework-edit-opts", commands["edit-opts"]);
app.action("edit-opts", async ({ ack, body: { user: { id: user } }, respond }) => commands["edit-opts"]({ ack, body: { user_id: user }, respond }));

app.action("confirm-opt-change", async ({ ack, body: { user: { id: user }, state: { values } }, respond }) => {
	await ack();
	const TTFramework = getTTFramework();
	console.log(values);
	values = (Object.entries(values).length ? values : { 0: { "ignore-opt-in-level": { selected_option: { value: TTFramework.opts[user] } } } });
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