const { Command } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ["MANAGE_ROLES"],
            runIn: ["text"],
            description: "Unmutes a mentioned user.",
            usage: "<member:member> [reason:string] [...]",
            usageDelim: " "
        });
    }

    async run(msg, [member, ...reason]) {
        if (member.roles.highest.position >= msg.member.roles.highest.position) throw "You cannot unmute this user.";
        if (!member.roles.has(msg.guild.settings.roles.muted)) throw "This user is not muted.";

        await member.roles.remove(msg.guild.settings.roles.muted);

        reason = reason.length > 0 ? reason.join(" ") : null;

        const newCaseNum = msg.guild.settings.moderationLogs.length + 1;
        await msg.guild.settings.update("moderationLogs", {
            caseNum: newCaseNum,
            action: "unmute",
            member: member.id,
            moderator: msg.author.id,
            reason: reason || "No reason provided"
        }, msg.guild);
        this.client.emit("modLogger", msg.guild, newCaseNum, "unmute", member, reason, msg.author);

        return msg.sendMessage(`${member.user.tag} was unmuted.${reason ? ` With reason of: ${reason}` : ""}`);
    }

};
