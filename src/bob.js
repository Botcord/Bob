const BobClient = require('./strcutures/BobClient');
const { config, token } = require('./config');

BobClient.defaultGuildSchema
    .add("moderationLogs", "any", { array: true, configurable: false })
    .add("roles", folder => folder
        .add("mute", "role", { configurable: true }))
    .add("channels", folder => folder
		.add("modlog", "channel", { configurable: true }));
		
new BobClient(config).login(token);