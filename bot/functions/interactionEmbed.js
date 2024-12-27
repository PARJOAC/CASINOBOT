const { EmbedBuilder } = require("discord.js");

async function interactionEmbed({ title, description, fields = [], thumbnail, footer, color, client }) {
    const embed = new EmbedBuilder()
        .setTimestamp();

    if (thumbnail) embed.setThumbnail(thumbnail);
    if (color) embed.setColor(color);
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (footer) embed.setFooter({ text: footer, iconURL: client.user.displayAvatarURL() });
    if (fields.length > 0) embed.addFields(fields);

    return embed;
};

module.exports = {
    interactionEmbed
};