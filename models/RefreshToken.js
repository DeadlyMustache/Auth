const { Schema, model } = require("mongoose");

const refreshTokenSchema = new Schema({
    guid: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = model('refreshtokens', refreshTokenSchema);