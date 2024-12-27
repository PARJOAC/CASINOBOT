const mongoose = require("mongoose");
const { createInfoSchema } = require("./info");

const PlayerSchema = createInfoSchema();

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;
