const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed, blueEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");
const paypal = require("@paypal/checkout-server-sdk");

const Guild = require("../../../mongoDB/Guild");
const PlayerBoost = require("../../../mongoDB/PlayerBoost");

const environment = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Buy upgrades to be the best!")
        .addStringOption((option) =>
            option
                .setName("catalogue")
                .setDescription("Select the item you want to buy")
                .setRequired(false)
                .addChoices(
                    { name: "Multiplier +0.25 (permanent)", value: "multiplier_x0.25" },
                    { name: "Multiplier +0.5 (permanent)", value: "multiplier_x0.5" },
                    { name: "Multiplier +0.75 (permanent)", value: "multiplier_x0.75" },
                    { name: "Coins 30k (instant)", value: "coins_30k" },
                    { name: "Coins 100k (instant)", value: "coins_100k" },
                    { name: "Coins 500k (instant)", value: "coins_500k" },
                    { name: "Level Up +10 (instant)", value: "level_+10" },
                    { name: "Level Up +20 (instant)", value: "level_+20" },
                    { name: "Level Up +50 (instant)", value: "level_+50" },
                    { name: "Player VIP (30 days)", value: "vip_30d" },
                )
        )
        .addIntegerOption((option) =>
            option
                .setName("quantity")
                .setDescription("Amount of items to buy")
                .setRequired(false)
        ),
    category: "economy",
    commandId: "1328646056287670323",

    async execute(interaction, client, lang, playerData) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (guildData.economyType) return redEmbed(interaction, client, {
            type: "editReply",
            title: lang.errorTitle,
            description: lang.onlyBotGlobal,
            footer: client.user.username,
            ephemeral: false
        });

        const executing = await getSet(interaction, lang, client);
        if (executing) return;

        // Precios base
        const basePrices = {
            "multiplier_x0.25": { price: 5.99, description: lang.buyMultiplier.replace("{multiplier}", 0.25) },
            "multiplier_x0.5": { price: 8.99, description: lang.buyMultiplier.replace("{multiplier}", 0.5) },
            "multiplier_x0.75": { price: 10.99, description: lang.buyMultiplier.replace("{multiplier}", 0.75) },
            "coins_30k": { price: 3.99, description: lang.buyCoins.replace("{coins}", Number(30000).toLocaleString()) },
            "coins_100k": { price: 11.99, description: lang.buyCoins.replace("{coins}", Number(100000).toLocaleString()) },
            "coins_500k": { price: 39.99, description: lang.buyCoins.replace("{coins}", Number(500000).toLocaleString()) },
            "level_+10": { price: 3.99, description: lang.buyLevel.replace("{level}", 10) },
            "level_+20": { price: 6.49, description: lang.buyLevel.replace("{level}", 20) },
            "level_+50": { price: 9.99, description: lang.buyLevel.replace("{level}", 50) },
            "vip_30d": { price: 4.99, description: lang.buyVip },
        };

        // Función para calcular precios ajustados
        async function calculatePricesWithVip(userId) {
            const player = await PlayerBoost.findOne({ userId });

            // Determinar si el jugador es VIP
            const isVip = player && player.isVipActive();

            // Aplicar descuento del 20% si es VIP
            const discountMultiplier = isVip ? 0.8 : 1;

            // Calcular precios ajustados
            const adjustedPrices = {};
            for (const [key, { price, description }] of Object.entries(basePrices)) {
                adjustedPrices[key] = {
                    price: (price * discountMultiplier).toFixed(2), // Asegurarse de que sea número
                    description, // Propagar descripción
                };
            }

            return adjustedPrices;
        }

        await addSet(interaction.user.id);

        const item = interaction.options.getString("catalogue");
        // Calcular el precio total
        const prices = await calculatePricesWithVip(interaction.user.id);

        // Si no se selecciona un ítem, mostrar la lista de precios y recompensas
        if (!item) {
            await delSet(interaction.user.id);
            let descriptionList = "";
            for (const [key, { price, description }] of Object.entries(prices)) {
                descriptionList += `• **${key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}**: ${price}€ - ${description}\n\n`;
            }

            return greenEmbed(interaction, client, {
                type: "editReply",
                title: lang.buyItemTitle,
                description: descriptionList,
                thumbnail: client.user.displayAvatarURL(),
                footer: client.user.username,
                ephemeral: true,
            });
        }

        const quantity = interaction.options.getInteger("quantity") || 1;

        if (quantity <= 0) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.negativeItem,
                footer: client.user.username,
                ephemeral: true,
            });
        }

        // Verificar si el producto existe
        const price = prices[item];
        if (!price) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.invalidItemSelect,
                footer: client.user.username,
                ephemeral: true,
            });
        }
        const totalPrice = (parseFloat(price.price) * quantity).toFixed(2);

        // Crear la orden de PayPal
        const orderRequest = new paypal.orders.OrdersCreateRequest();
        orderRequest.requestBody({
            intent: "CAPTURE", // Intención de capturar el pago
            purchase_units: [
                {
                    amount: {
                        currency_code: "EUR", // Moneda en euros
                        value: totalPrice, // Precio total
                    },
                    description: `${quantity} x ${item.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} for CasinoBot`, // Descripción
                },
            ],
            application_context: {
                brand_name: "CasinoBot",
                return_url: `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`, // URL de éxito
                cancel_url: `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`, // URL de cancelación
            },
        });

        try {
            const order = await paypalClient.execute(orderRequest);
            const approvalLink = order.result.links.find((link) => link.rel === "approve").href;

            // Mensaje inicial de compra pendiente
            await greenEmbed(interaction, client, {
                type: "editReply",
                title: lang.purchaseInit,
                description: lang.purchaseInitContent.replace("{category}", item.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())).replace("{url}", approvalLink).replace("{price}", totalPrice),
                thumbnail: client.user.displayAvatarURL(),
                footer: client.user.username,
                ephemeral: true,
            });

            const timeout = setTimeout(async () => {
                try {
                    const orderDetails = await paypalClient.execute(new paypal.orders.OrdersGetRequest(order.result.id));

                    if (orderDetails.result.status !== "APPROVED") {
                        await delSet(interaction.user.id);
                        return redEmbed(interaction, client, {
                            type: "editReply",
                            title: lang.timeException,
                            description: lang.buyTimeExceptionContent,
                            footer: client.user.username,
                            ephemeral: true,
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            }, 10 * 60 * 1000); // 10 minutos

            // Verificar el estado de la orden periódicamente
            const interval = setInterval(async () => {
                try {
                    const orderDetails = await paypalClient.execute(new paypal.orders.OrdersGetRequest(order.result.id));
                    if (orderDetails.result.status === "APPROVED") {
                        clearTimeout(timeout);
                        clearInterval(interval);
                        await delSet(interaction.user.id);

                        let boostData = await PlayerBoost.findOne({ userId: interaction.user.id });

                        if (!boostData) {
                            boostData = new PlayerBoost({
                                userId: interaction.user.id,
                                isVip: false,
                                vipExpiration: null,
                                multiplier: 1,
                                boosts: new Map(),
                            })
                            await boostData.save();
                        };

                        // Guardar la compra de Boost o Multiplicador en el esquema
                        if (item.includes("coins")) {
                            if (item === "coins_30k") playerData.balance += 30000 * quantity;
                            else if (item === "coins_100k") playerData.balance += 100000 * quantity;
                            else if (item === "coins_500k") playerData.balance += 500000 * quantity;
                            await playerData.save();
                        }

                        if (item.includes("level")) {
                            if (item === "level_+10") playerData.level += 10 * quantity;
                            else if (item === "level_+20") playerData.level += 20 * quantity;
                            else if (item === "level_+50") playerData.level += 50 * quantity;
                            await playerData.save();
                        }

                        if (item.includes("multiplier")) {
                            if (item === "multiplier_x0.25") playerData.multiplier += 0.25 * quantity;
                            else if (item === "multiplier_x0.5") playerData.multiplier += 0.5 * quantity;
                            else if (item === "multiplier_x0.75") playerData.multiplier += 0.75 * quantity;
                            await playerData.save();
                        }

                        // Guardar la compra del VIP
                        if (item === "vip_30d") {
                            const currentDate = new Date();
                            const vipExpiration = boostData.vipExpiration && boostData.vipExpiration > currentDate
                                ? new Date(boostData.vipExpiration)
                                : currentDate;

                            vipExpiration.setDate(vipExpiration.getDate() + (quantity * 30)); // Agregar 30 días por cada compra
                            boostData.isVip = true;
                            boostData.vipExpiration = vipExpiration;
                        }

                        // Guardar los cambios
                        await boostData.save();

                        await blueEmbed(process.env.SHOP_CHANNEL_ID, client, {
                            title: "🛍️ PURCHASE SUCCESS",
                            description: `**${interaction.user.username}** has purchased **${quantity}** ${item.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} for **${totalPrice} €**!`,
                            thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
                            footer: client.user.username
                        })

                        return greenEmbed(interaction, client, {
                            type: "editReply",
                            title: lang.purchaseSuccess,
                            description: lang.purchaseSuccessContent.replace("{quantity}", quantity).replace("{item}", item.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())).replace("{price}", totalPrice),
                            thumbnail: client.user.displayAvatarURL(),
                            footer: client.user.username,
                            ephemeral: true,
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            }, 5 * 1000); // Verificar cada 5 segundos

        } catch (err) {
            console.error(err);
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.purchaseError,
                footer: client.user.username,
                ephemeral: true,
            });
        }
    },
};
