const mongoose = require("mongoose");

module.exports = async () => {
  await mongoose.connect(process.env.MONGODB);
  console.log(`MongoDB service started.`);
};
