const { Command, Duration } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ["MANAGE_ROLES"],
            requiredSettings: ["roles.mute"],
            runIn: ["text"],
            description: "Mutes a mentioned member.",
            usage: "[when:time] <member:member> [reason:string] [...]",
            usageDelim: " "
        });
    }

    async run(msg, [when, member, ...reason]) {
        if (member.id === msg.author.id) throw "Why would you mute yourself?";
        if (member.id === this.client.user.id) throw "Have I done something wrong?";

        if (member.roles.highest.position >= msg.member.roles.highest.position) throw "You cannot mute this user.";

        if (member.roles.has(msg.guild.settings.roles.muted)) throw "The member is already muted.";
        await member.roles.add(msg.guild.settings.roles.muted);

        reason = reason.length > 0 ? reason.join(" ") : null;

        const newCaseNum = msg.guild.settings.moderationLogs.length + 1;
        await msg.guild.settings.update("moderationLogs", {
            caseNum: newCaseNum,
            action: "mute",
            member: member.id,
            moderator: msg.author.id,
            reason: reason || "No reason provided"
        }, msg.guild);
        this.client.emit("modLogger", msg.guild, newCaseNum, "mute", member, reason, msg.author, msg.args[0]);

        await member.send(`You have been **banned** in the **${msg.guild.name}** server.
**Moderator**: ${msg.author.tag} (${msg.author.id})
**Reason**: ${reason || "No reason provided"}
**Duration**: ${when ? Duration.toNow(when) : "Indefinite"}`)
            .catch(() => {
                throw `User has disabled DMs.`;
            });
        if (when) {
            await this.client.schedule.create("unmute", when, {
                data: {
                    guild: msg.guild.id,
                    user: member.id
                }
            });
            return msg.sendMessage(`${member.user.tag} got temporarily muted for ${Duration.toNow(when)}.${reason ? ` With reason of: ${reason}` : ""}`);
        }

        return msg.sendMessage(`${member.user.tag} got muted.${reason ? ` With reason of: ${reason}` : ""}`);
    }

};
