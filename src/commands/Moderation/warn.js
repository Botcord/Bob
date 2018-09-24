const { Command } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            permissionLevel: 6,
            description: "Warns a member of the guild",
            extendedHelp: "No extended help available.",
            usage: "<member:member> <reason:string> [...]",
            usageDelim: " "
        });
    }

    async run(msg, [member, ...reason]) {
        if (member.user.bot) throw "You can't warn bots.";
        reason = reason.length ? reason.join(this.usageDelim) : null;

        const newCaseNum = msg.guild.settings.moderationLogs.length + 1;
        await msg.guild.settings.update("moderationLogs", {
            caseNum: newCaseNum,
            action: "warn",
            member: member.id,
            moderator: msg.author.id,
            reason: reason || "No reason provided"
        }, msg.guild);
        this.client.emit("modLogger", msg.guild, newCaseNum, "warn", member, reason, msg.author);

        await member.send(`You have been **warned** in the **${msg.guild.name}** server.
**Moderator**: ${msg.author.tag} (${msg.author.id})
**Reason**: ${reason || "No reason provided"}`)
            .catch(() => {
                throw `User has disabled DMs.`;
            });
        return msg.send(`Successfully warned **${member.user.tag}**! ${reason ? `With the reason of \`${reason}\`` : ""}`);
    }

};
