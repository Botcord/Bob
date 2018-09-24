const { Command } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ["BAN_MEMBERS"],
            runIn: ["text"],
            description: "Unbans a user.",
            usage: "<user:user> [reason:string] [...]",
            usageDelim: " "
        });
    }

    async run(msg, [user, ...reason]) {
        const bans = await msg.guild.fetchBans();
        if (bans.has(user.id)) {
            await msg.guild.members.unban(user, reason.join(" "));
        }

        reason = reason.length ? reason.join(" ") : null;

        const newCaseNum = msg.guild.settings.moderationLogs.length + 1;
        await msg.guild.settings.update("moderationLogs", {
            caseNum: newCaseNum,
            action: "unban",
            member: user.id,
            moderator: msg.author.id,
            reason: reason || "No reason provided"
        }, msg.guild);
        this.client.emit("modLogger", msg.guild, newCaseNum, "unban", user, reason, msg.author);

        return msg.sendMessage(`${user.tag} was unbanned.${reason ? ` With reason of: ${reason}` : ""}`);
    }

};
