const puppeteer = require('puppeteer');
function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
const run = async () => {
	const startTime = Date();
	const browser = await puppeteer.launch();
	const page = [];
	let p;
	for (let i = 0; i < 30; i++) {
		p = await browser.newPage();
		await timeout(300 + Math.random() * 5000);
		await p.goto('https://www.youtube.com/watch?v=zC8ghDRu7mM');
		console.log(i, ':browser opened');
		await timeout(300 + Math.random() * 5000);
		page.push(p);
	}

	await timeout(83000 + Math.random() * 5000);

	console.log('begin close');
	await browser.close();
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
