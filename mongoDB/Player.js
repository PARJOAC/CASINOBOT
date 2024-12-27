const mongoose = require("mongoose");
const { infoSchema } = require("./info");

const PlayerSchema = new mongoose.Schema({
  infoSchema
});

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;
