const { model, Schema } = require('mongoose')

let suggestSchema = new Schema({
    guildSuggest: String,
    guildChannel: String,
}, {
    versionKey: false
})

module.exports = model('Suggests', suggestSchema)