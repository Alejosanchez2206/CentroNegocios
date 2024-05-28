const { model , Schema } = require('mongoose')

let negociosSchema = new Schema({
    guildNegocio: String,
    guildRol : String,
    guildJefe : String,
    nombreNegocio: String
}, {
    versionKey: false
})

module.exports = model('Negocios', negociosSchema)