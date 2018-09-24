const { Command } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ["BAN_MEMBERS"],
            runIn: ["text"],
            description: "Bans a mentioned user. Currently does not require reason (no mod-log).",
            usage: "<member:user> [reason:string] [...]",
            usageDelim: " "
        });
    }

    async run(msg, [user, ...reason]) {
        if (user.id === msg.author.id) throw "Why would you ban yourself?";
        if (user.id === this.client.user.id) throw "Have I done something wrong?";

        const member = await msg.guild.members.fetch(user).catch(() => null);
        if (member) {
            if (member.roles.highest.position >= msg.member.roles.highest.position) throw "You cannot ban this user.";
            if (!member.bannable) throw "I cannot ban this user.";
        }

        reason = reason.length ? reason.join(" ") : null;

        const newCaseNum = msg.guild.settings.moderationLogs.length + 1;
        await msg.guild.settings.update("moderationLogs", {
            caseNum: newCaseNum,
            action: "ban",
            member: user.id,
            moderator: msg.author.id,
            reason: reason || "No reason provided"
        }, msg.guild);
        this.client.emit("modLogger", msg.guild, newCaseNum, "ban", user.id, reason, msg.author.id);

        await member.send(`You have been **banned** in the **${msg.guild.name}** server.
**Moderator**: ${msg.author.tag} (${msg.author.id})
**Reason**: ${reason || "No reason provided"}`)
            .catch(() => {
                throw `User has disabled DMs.`;
            });
        await msg.guild.members.ban(user, { reason: reason || "No reason provided" });

        return msg.sendMessage(`${member.user.tag} got banned.${reason ? ` With reason of: ${reason}` : ""}`);
    }

};
