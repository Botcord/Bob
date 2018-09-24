const { Command, Duration, klasaVersion, discordVersion } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 10,
            description: language => language.get("COMMAND_STATS_DESCRIPTION")
        });
    }

    async run(msg) {
        return msg.sendCode("asciidoc", msg.language.get("COMMAND_STATS",
            (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
            Duration.toNow(Date.now() - (process.uptime() * 1000)),
            this.client.users.size.toLocaleString(),
            this.client.guilds.size.toLocaleString(),
            this.client.channels.size.toLocaleString(),
            klasaVersion, discordVersion, process.version, msg
        ));
    }

};
