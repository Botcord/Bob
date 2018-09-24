const { Event, MessageEmbed } = require("../index");

const actions = {
    warn: "Warn",
    mute: "Mute",
    kick: "Kick",
    softban: "Softban",
    ban: "Ban",
    unmute: "Unmute",
    unban: "Unban"
};

const colors = {
    warn: "008AFF",
    mute: "C500D1",
    kick: "2E8B57",
    softban: "FFFC00",
    ban: "FF0000",
    unmute: "DA009F",
    unban: "DA009F"
};

module.exports = class extends Event {

    async run(guild, caseNumber, type, user, reason, moderator, duration) {
        user = await this.client.users.fetch(user.id);
        moderator = await this.client.users.resolve(moderator.id);
        return guild.channels.get(guild.settings.channels.modlog).send(new MessageEmbed()
            .setColor(colors[type])
            .addField("User", await user.tag, true)
            .addField("Moderator", await moderator.tag, true)
            .addField("Reason", reason, true)
            .setTitle(`${actions[type]}${duration ? ` [${duration}]` : ""} | Case #${caseNumber}`)
            .setTimestamp());
    }

};
