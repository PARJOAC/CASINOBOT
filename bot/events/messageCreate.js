const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) => {
        if (message.author.bot) return;

        if (!message) return;
    },
};
