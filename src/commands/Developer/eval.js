const klasa = require("klasa");
const discord = require("discord.js"); // eslint-disable-line
const { inspect } = require("util");
const { haste } = require("../../lib/util/Util");

module.exports = class extends klasa.Command {

    constructor(...args) {
        super(...args, {
            aliases: ["ev"],
            permissionLevel: 10,
            guarded: true,
            description: language => language.get("COMMAND_EVAL_DESCRIPTION"),
            extendedHelp: language => language.get("COMMAND_EVAL_EXTENDEDHELP"),
            usage: "<expression:str>"
        });

        this.depth = 0;
        this.showHidden = false;
    }

    async run(msg, [code]) {
        const { success, result, time, type } = await this.eval(msg, code);
        const output = msg.language.get(success ? "COMMAND_EVAL_OUTPUT" : "COMMAND_EVAL_ERROR",
            time, klasa.util.codeBlock("js", result), type);
        const silent = "silent" in msg.flags;

        // Handle errors
        if (!success) {
            if (!silent) return msg.sendMessage(output);
        }

        if (silent) return null;

        // Handle too-long-messages
        if (output.length > 2000) {
            return msg.send(`\`${type} ${time}\`\n**Eval output was too long so here you go:** ${await haste(result)}`);
        }

        // If it's a message that can be sent correctly, send it
        return msg.sendMessage(output);
    }

    // Eval the input
    async eval(msg, code) {
        const message = msg; // eslint-disable-line
        const client = this.client; // eslint-disable-line
        const guild = msg.guild; // eslint-disable-line

        const stopwatch = new klasa.Stopwatch();
        let success, syncTime, asyncTime, result;
        let thenable = false;
        let type;
        try {
            if (msg.flags.async) code = `(async () => {\n${code}\n})();`;
            result = eval(code);
            syncTime = stopwatch.toString();
            type = new klasa.Type(result);
            if (klasa.util.isThenable(result)) {
                thenable = true;
                stopwatch.restart();
                result = await result;
                asyncTime = stopwatch.toString();
            }
            success = true;
        } catch (error) {
            if (!type) type = new klasa.Type(error);
            if (!syncTime) syncTime = stopwatch.toString();
            if (thenable && !asyncTime) asyncTime = stopwatch.toString();
            result = error;
            success = false;
        }

        stopwatch.stop();
        if (typeof result !== "string") {
            result = inspect(result, {
                depth: msg.flags.depth ? Number(msg.flags.depth) : this.depth,
                showHidden: msg.flags.showHidden ? Boolean(msg.flags.showHidden) : this.showHidden,
                showProxy: true
            });
        }
        return { success, type, time: this.formatTime(syncTime, asyncTime), result: klasa.util.clean(result.stack || result) };
    }

    formatTime(syncTime, asyncTime) {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    }

};
