const { EmbedBuilder } = require("discord.js");
const Guild = require("../../mongoDB/Guild");
async function interactionEmbed({ title, description, fields = [], thumbnail, footer, color, client }) {
    if (!client) throw new Error('Client instance is required for interactionEmbed.');

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

async function redEmbed(interaction, client, { type = '', title = '', description = '', fields = [], thumbnail = null, footer = null, ephemeral = null, components = [], fetchReply = false } = {}) {
    return sendEmbed(interaction, client, {
        type: type,
        title: title,
        description: description,
        fields: fields,
        thumbnail: thumbnail,
        footer: footer,
        color: parseInt(process.env.RED_COLOR, 16),
        ephemeral: ephemeral,
        components: components,
        fetchReply: fetchReply
    });
};

async function greenEmbed(interaction, client, { type = '', title = '', description = '', fields = [], thumbnail = null, footer = null, ephemeral = null, components = [], fetchReply = false } = {}) {
    return sendEmbed(interaction, client, {
        type: type,
        title: title,
        description: description,
        fields: fields,
        thumbnail: thumbnail,
        footer: footer,
        color: parseInt(process.env.GREEN_COLOR, 16),
        ephemeral: ephemeral,
        components: components,
        fetchReply: fetchReply
    });
};

async function blueEmbed(interaction, client, { type = '', title = '', description = '', fields = [], thumbnail = null, footer = null, ephemeral = null, components = [], fetchReply = false } = {}) {
    return sendEmbed(interaction, client, {
        type: type,
        title: title,
        description: description,
        fields: fields,
        thumbnail: thumbnail,
        footer: footer,
        color: parseInt(process.env.BLUE_COLOR, 16),
        ephemeral: ephemeral,
        components: components,
        fetchReply: fetchReply
    });
};
async function yellowEmbed(interaction, client, { type = '', title = '', description = '', fields = [], thumbnail = null, footer = null, ephemeral = null, components = [], fetchReply = false } = {}) {
    return sendEmbed(interaction, client, {
        type: type,
        title: title,
        description: description,
        fields: fields,
        thumbnail: thumbnail,
        footer: footer,
        color: parseInt(process.env.YELLOW_COLOR, 16),
        ephemeral: ephemeral,
        components: components,
        fetchReply: fetchReply
    });
};

async function sendEmbed(interaction, client, { type, title, description, fields, thumbnail, footer, color, ephemeral, components = [], fetchReply }) {
    const embed = await interactionEmbed({
        title: title,
        description: description,
        fields: fields,
        thumbnail: thumbnail,
        footer: footer,
        color: color,
        client: client,
    });

    const methods = {
        editReply: interaction.editReply ? interaction.editReply.bind(interaction) : undefined,
        followUp: interaction.followUp ? interaction.followUp.bind(interaction) : undefined,
        edit: interaction.edit ? interaction.edit.bind(interaction) : undefined,
        update: interaction.update ? interaction.update.bind(interaction) : undefined,
        reply: interaction.reply ? interaction.reply.bind(interaction) : undefined,
        channelSend: interaction.channel && interaction.channel.send ? interaction.channel.send.bind(interaction.channel) : undefined,
        userSend: interaction.user && interaction.user.send ? interaction.user.send.bind(interaction.user) : undefined,
    };

    if (typeof type !== "string" || !type) {
        const channel = client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(interaction);

        if (!channel || !channel.isTextBased()) {
            throw new Error(`El canal con ID ${interaction} no es válido o no es basado en texto.`);
        }

        return channel.send({ embeds: [embed], components: components });
    }

    const method = methods[type];
    if (!method) throw new Error(`Invalid method on sendEmbed: ${type}`);

    if (!fetchReply) fetchReply = false;

    return method({
        embeds: [embed],
        ephemeral: ephemeral,
        components: components,
        fetchReply: fetchReply
    });
};

module.exports = { interactionEmbed, redEmbed, greenEmbed, blueEmbed, yellowEmbed };
