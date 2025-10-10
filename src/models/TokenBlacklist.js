const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiredAt: { type: Date, require: true },
});

//otomatis hapus token setelah expiredAt
tokenBlacklistSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
