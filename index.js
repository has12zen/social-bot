const Bot = require('./Bot'); // this directly imports the Bot/index.js file
const config = require('./Bot/config/puppeteer.json');
const dotenv = require('dotenv');
dotenv.config();

const run = async () => {
	const bot = new Bot();
	const startTime = Date();
	await bot.initPuppeter().then(() => console.log('PUPPETEER INITIALIZED'));

	await bot.visitInstagram().then(() => console.log('BROWSING INSTAGRAM'));

	await bot.visitHashtagUrl().then(() => console.log('VISITED HASH-TAG URL'));

	// await bot.unFollowUsers();

	console.log('begin close');
	await bot
		.closeBrowser()
		.then(() => console.log('BROWSER CLOSED'))
		.catch((e) => {
			process.exit();
		});

	const endTime = Date();

	console.log(`START TIME - ${startTime} / END TIME - ${endTime}`);
	process.exit();
};

run().catch((e) => {
	console.log(e);
	process.exit(1);
});

process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
	console.log(err.name, err.message);
	process.exit(1);
});
//run bot at certain interval we have set in our config file
// setInterval(run, config.settings.run_every_x_hours * 3600000);
