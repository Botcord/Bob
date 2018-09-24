const { Command, klasaUtil, MessageEmbed } = require("../../index");

const actions = {
    warn: "Warn",
    mute: "Mute",
    kick: "Kick",
    softban: "Softban",
    ban: "Ban"
};

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            permissionLevel: 6,
            description: "See moderation cases in the guild",
            extendedHelp: "No extended help available.",
            usage: "[list] (case:integer|page:page)",
            usageDelim: " ",
            subcommands: true
        });

        this
            .createCustomResolver("page", (arg, possible, message, [action]) => {
                if (action === "list" || !arg) arg = 1;
                return Number(arg);
            });
    }

    async run(msg, caseNumber) {
        caseNumber = Number(caseNumber);
        const modLogs = msg.guild.settings.moderationLogs;
        if (!modLogs.length) throw "The moderation logs is empty! You have obedient members!";

        const modLog = modLogs[caseNumber - 1];
        if (!modLog) throw `Cannot find case ${caseNumber}`;

        const moderator = await this.resolveUserTag(modLog.moderator);
        const user = await this.resolveUserTag(modLog.member);

        return msg.send(new MessageEmbed()
            .setTitle(`${actions[modLog.action]} | Case#${caseNumber}`)
            .addField("User", user, true)
            .addField("Moderator", moderator, true)
            .addField("Reason", modLog.reason)
            .setFooter(`Requested by: ${msg.author.tag}`)
            .setTimestamp());
    }

    async list(msg, page = 1) {
        if (page <= 0) throw "Invalid page.";
        page *= 10;
        const modLogs = [];
        for (const modlog of msg.guild.settings.moderationLogs.slice(page - 10, page - 1)) {
            const user = await this.client.users.fetch(modlog.member);
            const moderator = await this.client.users.fetch(modlog.moderator);
            modLogs.push([`Case #${modlog.caseNum}`,
                `Action: ${actions[modlog.action]}`,
                `User: ${await user.tag}`,
                `Moderator: ${await moderator.tag}`,
                `Reason: ${modlog.reason}`].join("\n"));
        }
        return msg.send(`List of Moderation Cases in \`${msg.guild.name}\`  [Page ${page / 10}/${klasaUtil.chunk(modLogs, 10).length}]
            ${klasaUtil.codeBlock("http", modLogs.join("\n\n"))}`);
    }

};
