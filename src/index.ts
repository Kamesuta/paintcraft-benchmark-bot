import * as mineflayer from 'mineflayer';
import navigatePlugin from 'mineflayer-navigate';
import { Vec3 } from 'vec3';

const bot = mineflayer.createBot({
	host: 'localhost', // minecraft server ip
	username: 'bot1', // minecraft username
	// password: '12345678' // minecraft password, comment out if you want to log into online-mode=false servers
	// port: 25565, // only set if you need a port that isn't 25565
	// version: false, // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
	// auth: 'mojang' // only set if you need microsoft auth, then set this to 'microsoft'
});

// install the plugin
navigatePlugin()(bot);

bot.on('chat', (username, message) => {
	if (username === bot.username) return;
	bot.chat(message);
});

// Log errors and kick reasons:
bot.on('kicked', console.log);
bot.on('error', console.log);

// optional configuration
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops
bot.navigate.on('pathFound', function (path: string) {
	bot.chat('found path. I can get there in ' + path.length + ' moves.');
});
bot.navigate.on('cannotFind', function (closestPath: Vec3[]) {
	bot.chat('unable to find path. getting as close as possible');
	bot.navigate.walk(closestPath);
});
bot.navigate.on('arrived', function () {
	bot.chat('I have arrived');
});
bot.navigate.on('interrupted', function () {
	bot.chat('stopping');
});
bot.on('chat', function (username, message) {
	// navigate to whoever talks
	if (username === bot.username) return;
	const target = bot.players[username].entity;
	if (message === 'come') {
		bot.navigate.to(target.position);
	} else if (message === 'stop') {
		bot.navigate.stop();
	}
});
