const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  lang: { type: String, required: true },
  economyType: { type: Boolean, default: false }
});

const Guild = mongoose.model("Guild", GuildSchema);
module.exports = Guild;
