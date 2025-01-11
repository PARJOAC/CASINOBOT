const mongoose = require("mongoose");
const { getInfoSchema } = require("../bot/functions/getInfoSchema");

const PlayerSchema = getInfoSchema();

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;
