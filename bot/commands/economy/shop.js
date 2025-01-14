const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");
const paypal = require("@paypal/checkout-server-sdk");

const PlayerBoost = require("../../../mongoDB/PlayerBoost");

const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// Precios base
const basePrices = {
    "boostx2_30min": { price: 3.99, description: "Multiplica x2 tus ganancias por 30 minutos." },
    "boostx5_1h": { price: 3.99, description: "Multiplica x5 tus ganancias por 1 hora." },
    "coins_30k": { price: 4.99, description: "Obtén 30,000 monedas instantáneamente." },
    "coins_100k": { price: 12.99, description: "Obtén 100,000 monedas instantáneamente." },
    "coins_500k": { price: 59.99, description: "Obtén 500,000 monedas instantáneamente." },
    "vip_30d": { price: 9.99, description: "Ventajas VIP por 30 días." },
    "xpx2_1h": { price: 2.49, description: "Multiplica x2 tu experiencia por 1 hora." },
    "xpx5_3h": { price: 4.99, description: "Multiplica x5 tu experiencia por 3 horas." },
    "xpx10_24h": { price: 8.99, description: "Multiplica x10 tu experiencia por 24 horas." },
    "lvlup10": { price: 3.99, description: "Sube 10 niveles instantáneamente." },
    "lvlup20": { price: 6.99, description: "Sube 20 niveles instantáneamente." },
    "lvlup50": { price: 8.99, description: "Sube 50 niveles instantáneamente." },
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Buy via PayPal items to use in CasinoBot")
        .addStringOption((option) =>
            option
                .setName("catalogue")
                .setDescription("Select the item you want to buy")
                .setRequired(false)
                .addChoices(
                    { name: "Boost x2 (30 minutes)", value: "boostx2_30min" },
                    { name: "Boost x5 (1 hour)", value: "boostx5_1h" },
                    { name: "Boost x10 (2 hours)", value: "boostx10_2h" },
                    { name: "Player VIP (30 days)", value: "vip_30d" },
                    { name: "XP x2 (1 hour)", value: "xpx2_1h" },
                    { name: "XP x5 (3 hours)", value: "xpx5_3h" },
                    { name: "XP x10 (24 hours)", value: "xpx10_24h" },
                    { name: "Level Up +10 (instant)", value: "lvlup10" },
                    { name: "Level Up +20 (instant)", value: "lvlup20" },
                    { name: "Level Up +50 (instant)", value: "lvlup50" },
                )
        )
        .addIntegerOption((option) =>
            option
                .setName("quantity")
                .setDescription("Amount of items to buy")
                .setRequired(false)
        ),
    category: "economy",
    commandId: "1296240894214934532",

    async execute(interaction, client, lang, playerData) {
        const executing = await getSet(interaction, lang, client);
        if (executing) return;

        await addSet(interaction.user.id);

        const item = interaction.options.getString("catalogue");
        // Calcular el precio total
        const prices = await calculatePricesWithVip(interaction.user.id);

        // Si no se selecciona un ítem, mostrar la lista de precios y recompensas
        if (!item) {
            let priceList = "**Lista de Precios y Recompensas:**\n";
            for (const [key, { price, description }] of Object.entries(prices)) {
                priceList += `• **${key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}**: €${price} - ${description}\n`;
            }

            return greenEmbed(interaction, client, {
                type: "editReply",
                title: "Tienda de CasinoBot",
                description: priceList,
                footer: client.user.username,
                ephemeral: true,
            });
        }
        
        const quantity = interaction.options.getInteger("quantity") || 1;

        if (quantity <= 0) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: "Error",
                description: "Quantity must be greater than 0.",
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
                title: "Error",
                description: "Invalid item selected.",
                footer: client.user.username,
                ephemeral: true,
            });
        }
        const totalPrice = (price * quantity).toFixed(2);

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
                title: "Compra Pendiente",
                description: `Haz clic [aquí](${approvalLink}) para completar tu pago de €${totalPrice}. Tienes 15 minutos para completar la compra.`,
                footer: client.user.username,
                ephemeral: true,
            });

            const timeout = setTimeout(async () => {
                try {
                    const orderDetails = await paypalClient.execute(new paypal.orders.OrdersGetRequest(order.result.id));

                    if (orderDetails.result.status !== "APPROVED") {
                        await delSet(interaction.user.id);
                        await redEmbed(interaction, client, {
                            type: "editReply",
                            title: "Tiempo Agotado",
                            description: "La orden ha expirado después de 15 minutos y ha sido cancelada.",
                            footer: client.user.username,
                            ephemeral: true,
                        });

                        // Notificar al usuario de la cancelación de la compra
                        await interaction.followUp({
                            content: `La compra de ${quantity} x ${item.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} por €${totalPrice} ha sido cancelada debido a la expiración del tiempo.`,
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
                        if (item.includes("boost")) {
                            const boostExpiration = new Date();
                            if (item === "boostx2_30min") boostExpiration.setMinutes(boostExpiration.getMinutes() + (quantity * 30));
                            else if (item === "boostx5_1h") boostExpiration.setHours(boostExpiration.getHours() + (quantity * 1));
                            // Se pueden agregar más tipos de Boost si es necesario

                            boostData.boosts.set(item, boostExpiration);
                        }

                        if (item.includes("xpx")) {
                            const xpMultiplierExpiration = new Date();
                            if (item === "xpx2_1h") xpMultiplierExpiration.setHours(xpMultiplierExpiration.getHours() + (quantity * 1));
                            else if (item === "xpx5_3h") xpMultiplierExpiration.setHours(xpMultiplierExpiration.getHours() + (quantity * 3));
                            // Se pueden agregar más tipos de XP Boost si es necesario

                            boostData.boosts.set(item, xpMultiplierExpiration);
                        }
                        
                        if (item.includes("coins")) {
                            if (item === "coins_30k") playerData.balance += 30000;
                            else if (item === "coins_100k") playerData.balance += 100000;
                            else if (item === "coins_500k") playerData.balance += 500000;
                            await playerData.save();
                        }
                        
                        if (item.includes("levelup")) {
                            if (item === "levelup10") playerData.level += 10;
                            else if (item === "levelup20") playerData.level += 20;
                            else if (item === "levelup50") playerData.level += 50;
                            await playerData.save();
                        }

                        // Guardar la compra del VIP
                        if (item === "vip_30d") {
                            const vipExpiration = new Date();
                            vipExpiration.setDate(vipExpiration.getDate() + (quantity * 30)); // 30 días de expiración
                            boostData.isVip = true;
                            boostData.vipExpiration = vipExpiration;
                        }

                        // Guardar los cambios
                        await boostData.save();

                        await greenEmbed(interaction, client, {
                            type: "editReply",
                            title: "Compra Completada",
                            description: `¡Tu compra de ${quantity} x ${item.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} por €${totalPrice} ha sido completada con éxito!`,
                            footer: client.user.username,
                            ephemeral: true,
                        });

                        // Notificar al usuario del éxito de la compra
                        await interaction.followUp({
                            content: `Compra exitosa de ${quantity} x ${item.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} por €${totalPrice}.`,
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
                title: "Error",
                description: "Hubo un problema al crear tu orden de PayPal. Por favor, intenta de nuevo más tarde.",
                footer: client.user.username,
                ephemeral: true,
            });
        }
    },
};
