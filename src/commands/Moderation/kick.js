const { Command } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ["KICK_MEMBERS"],
            runIn: ["text"],
            description: "Kicks a mentioned user.",
            usage: "<Member:member> [Reason:string] [...]",
            usageDelim: " "
        });
    }

    async run(msg, [member, ...reason]) {
        if (member.id === msg.author.id) throw "Why would you kick yourself?";
        if (member.id === this.client.user.id) throw "Have I done something wrong?";
        if (member.roles.hinpmghest.position >= msg.member.roles.highest.position) throw "You cannot kick this user.";
        if (!member.kickable) throw "I cannot kick this user.";

        reason = reason.length > 0 ? reason.join(" ") : null;

        const newCaseNum = msg.guild.settings.moderationLogs.length + 1;
        await msg.guild.settings.update("moderationLogs", {
            caseNum: newCaseNum,
            action: "kick",
            member: member.id,
            moderator: msg.author.id,
            reason: reason || "No reason provided"
        }, msg.guild);
        this.client.emit("modLogger", msg.guild, newCaseNum, "kick", member, reason, msg.author);

        await member.send(`You have been **kicked** in the **${msg.guild.name}** server.
**Moderator**: ${msg.author.tag} (${msg.author.id})
**Reason**: ${reason || "No reason provided"}`)
            .catch(() => {
                throw `User has disabled DMs.`;
            });
        await member.kick(reason);

        return msg.sendMessage(`${member.user.tag} got kicked.${reason ? ` With reason of: ${reason}` : ""}`);
    }

};
