const Guild = require("../../mongoDB/Guild");

async function getGuildLanguage(guildId) {
  let guildLang = await Guild.findOne({ guildId: guildId });

  if (!guildLang) {
    guildLang = new Guild({
      guildId: guildId,
      lang: "en",
      economyType: false,
      commandLogChannel: 0,
      gameLogChannel: 0
    });
    await guildLang.save();
  };

  let lang = require(`../languages/${guildLang.lang}.json`);
  return lang;
};

async function changeLanguage(guildId, lang) {
  let guildLang = await Guild.findOne({ guildId: guildId });

  if (!guildLang) {
    guildLang = new Guild({
      guildId: guildId,
      lang: lang,
      economyType: false,
      commandLogChannel: 0,
      gameLogChannel: 0
    });
    await guildLang.save();
  };

  guildLang.lang = lang;
  await guildLang.save();

  let finalLang = require(`../languages/${guildLang.lang}.json`);
  return finalLang;
};

module.exports = { getGuildLanguage, changeLanguage };
