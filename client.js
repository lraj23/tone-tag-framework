import bolt from "@slack/bolt";
const { App } = bolt;

const startTime = Date.now();

const isSocketMode = (process.env.TT_FRAMEWORK_SOCKET_MODE === "true"); // only true in development
const app = new App({
	"token": process.env.TT_FRAMEWORK_BOT_TOKEN,
	"signingSecret": process.env.TT_FRAMEWORK_SIGNING_SECRET,
	"socketMode": isSocketMode,
	"appToken": process.env.TT_FRAMEWORK_APP_TOKEN,
});

console.log(isSocketMode ? "Starting in Socket Mode!" : "Starting in Request URL Mode!");

await app.start(process.env.TT_FRAMEWORK_PORT || 5040);
console.log("⚡ Slack bot ready in " + (Date.now() - startTime) + "ms.");

export default app