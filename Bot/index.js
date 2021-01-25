class InstagramBot {
	constructor() {
		// this.firebase_db = require('./db');
		this.config = require('./config/puppeteer.json');
	}

	async initPuppeter() {
		const puppeteer = require('puppeteer');
		this.browser = await puppeteer.launch({
			headless: this.config.settings.headless,
			args: ['--no-sandbox'],
		});
		this.page = await this.browser.newPage();
		this.page.setViewport({ width: 1500, height: 764 });
	}

	async visitInstagram() {
		await this.page.goto(this.config.base_url, { timeout: 60000 });
		await this.page.waitForTimeout(2500);
		// await this.page.click(this.config.selectors.home_to_login_button);
		/* Click on the username field using the field selector*/
		await this.page.click(this.config.selectors.username_field);
		await this.page.keyboard.type(process.env.USER);
		await this.page.waitForTimeout(1569);
		await this.page.click(this.config.selectors.password_field);
		await this.page.keyboard.type(process.env.PASSWORD);
		await this.page.waitForTimeout(2239);
		await this.page.click(this.config.selectors.login_button);
		await this.page.click(this.config.selectors.not_now_button);
		await this.page.waitForNavigation();
	}

	async visitHashtagUrl() {
		const shuffle = require('shuffle-array');
		let hashTags = shuffle(this.config.hashTags);
		// loop through hashTags
		for (let tagIndex = 0; tagIndex < hashTags.length; tagIndex++) {
			console.log('<<<< Currently Exploring >>>> page' + hashTags[tagIndex]);
			//visit the hash tag url
			await this.page.goto(
				`${this.config.base_url}/` + hashTags[tagIndex] + '/?hl=en'
			);
			// Loop through the latest 9 posts
			await this._doPostLike(
				this.config.selectors.hash_tags_base_class,
				this.page
			);
		}
	}

	/**
	 * @Description loops through the the first three rows and the their items which are also three on a row
	 * We'll be looping through nine items in total.
	 * @param parentClass the parent class for items we trying to loop through this differs depending on the page
	 * @param page this.page context of our browser
	 * we're currently browsing through
	 * @returns {Promise<void>}
	 * @private
	 */
	async _doPostLike(parentClass, page) {
		for (let r = 1; r < 2; r++) {
			//loops through each row
			for (let c = 1; c < 4; c++) {
				//loops through each item in the row

				let br = false;
				//Try to select post
				await page
					.click(
						`${parentClass} > div > div > .Nnq7C:nth-child(${r}) > .v1Nh3:nth-child(${c}) > a`
					)
					.catch((e) => {
						console.log(e.message);
						br = true;
					});
				await page.waitForTimeout(2250 + Math.floor(Math.random() * 250)); //wait for random amount of time
				if (br) continue; //if  failed selecting post continue

				await page.waitForSelector(this.config.selectors.post_like_button);
				const isLikeExists = await page.evaluate((selector) => {
					const svgElement = document.querySelector(selector);
					if (!svgElement) return false;
					return svgElement.getAttribute('fill') === '#ed4956';
				}, this.config.selectors.LIKE_BUTTON_CHILD);

				isLikeExists || page.click(this.config.selectors.LIKE_BUTTON);
				isLikeExists ? console.log('already liked') : console.log('Adde like');
				//get the username of the current post
				// let username = await page.evaluate((x) => {
				// 	let element = document.querySelector(x);
				// 	return Promise.resolve(element ? element.innerHTML : '');
				// }, this.config.selectors.post_username);
				// console.log(`INTERACTING WITH ${username}'s POST`);

				await page.waitForTimeout(1250 + Math.floor(Math.random() * 250));
				//Closing the current post modal
				await page
					.mainFrame()
					.waitForSelector(this.config.selectors.CLOSE_POPUP);
				await page
					.click(this.config.selectors.CLOSE_POPUP)
					.catch((e) => console.log('<<< ERROR CLOSING POST >>> ' + e.message));
				//Wait for random amount of time
				await page.waitForTimeout(2250 + Math.floor(Math.random() * 250));
			}
		}
	}

	/**
	 * @Description let's unfollow users we've followed for the number of days specified in our config
	 * @returns {Promise<void>}
	 */
	async unFollowUsers() {
		let date_range =
			new Date().getTime() -
			this.config.settings.unfollow_after_days * 86400000;

		// get the list of users we are currently following
		let following = await this.firebase_db.getFollowings();
		let users_to_unfollow = [];
		if (following) {
			const all_users = Object.keys(following);
			// filter our current following to get users we've been following since day specified in config
			users_to_unfollow = all_users.filter(
				(user) => following[user].added < date_range
			);
		}

		if (users_to_unfollow.length) {
			for (let n = 0; n < users_to_unfollow.length; n++) {
				let user = users_to_unfollow[n];
				await this.page.goto(`${this.config.base_url}/${user}/?hl=en`);
				await this.page.waitForTimeout(1500 + Math.floor(Math.random() * 500));

				let followStatus = await this.page.evaluate((x) => {
					let element = document.querySelector(x);
					return Promise.resolve(element ? element.innerHTML : '');
				}, this.config.selectors.user_unfollow_button);

				if (followStatus === 'Following') {
					console.log('<<< UNFOLLOW USER >>>' + user);
					//click on unfollow button
					await this.page.click(this.config.selectors.user_unfollow_button);
					//wait for a sec
					await this.page.waitForTimeout(1000);
					//confirm unfollow user
					await this.page.click(
						this.config.selectors.user_unfollow_confirm_button
					);
					//wait for random amount of time
					await this.page.waitForTimeout(
						20000 + Math.floor(Math.random() * 5000)
					);
					//save user to following history
					await this.firebase_db.unFollow(user);
				} else {
					//save user to our following history
					this.firebase_db.unFollow(user);
				}
			}
		}
	}

	async closeBrowser() {
		await this.browser.close();
	}
}

module.exports = InstagramBot;
