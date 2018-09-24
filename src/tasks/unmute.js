const { Task } = require("../../index");

module.exports = class extends Task {

    async run({ guild, user }) {
        const _guild = this.client.guilds.get(guild);
        if (!_guild) return;
        const member = await _guild.members.fetch(user).catch(() => null);
        if (!member) return;
        await member.roles.remove(_guild.settings.roles.muted);

        const newCaseNum = _guild.settings.moderationLogs.length + 1;
        await _guild.settings.update("moderationLogs", {
            caseNum: newCaseNum,
            action: "unmute",
            member: member.id,
            moderator: this.client.user.tag,
            reason: "Reached mute threshold"
        }, _guild);
        this.client.emit("modLogger", _guild, newCaseNum, "unmute", member, "Reached mute threshold", this.client.user);
    }

};
