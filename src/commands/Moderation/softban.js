const { Command } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ["BAN_MEMBERS"],
            runIn: ["text"],
            description: "Softbans a mentioned user. Currently does not require reason (no mod-log).",
            usage: "<member:user> [days:int{1,7}] [reason:string] [...]",
            usageDelim: " "
        });
    }

    async run(msg, [user, days = 1, ...reason]) {
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
            action: "softban",
            member: user.id,
            moderator: msg.author.id,
            reason: reason || "No reason provided"
        }, msg.guild);
        this.client.emit("modLogger", msg.guild, newCaseNum, "softban", user, reason, msg.author);

        await member.send(`You have been **softbanned** in the **${msg.guild.name}** server.
**Moderator**: ${msg.author.tag} (${msg.author.id})
**Reason**: ${reason || "No reason provided"}`)
            .catch(() => {
                throw `User has disabled DMs.`;
            });

        await msg.guild.members.ban(user, { days: days, reason: reason || "No reason provided" });
        await msg.guild.members.unban(user, "Softban released.");

        return msg.sendMessage(`${member.user.tag} got softbanned.${reason ? ` With reason of: ${reason}` : ""}`);
    }

};
