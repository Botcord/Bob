const klasa = require("klasa");
const discord = require("discord.js");

module.exports = {
    ...klasa,
    ...discord,
    config: require("../config.js"),
    klasaUtil: klasa.util,
    discordUtil: discord.Util,
    klasaVersion: klasa.version,
    discordVersion: discord.version,
    klasaConstants: klasa.constants,
    discordConstants: discord.Constants,
};
