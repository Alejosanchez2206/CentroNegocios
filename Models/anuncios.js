const { Schema , model } = require('mongoose')

let anunciosSchema = new Schema({
    guildId : {
        type : String,
        required : true
    },
    canalAnuncios : {
        type : String,
        required : true
    },
    roleAnuncios : {
        type : String,
        required : true
    },
    nameAnuncios : {
        type : String,
        required : true
    }
}, {
    versionKey: false
})


module.exports = model('anuncios', anunciosSchema)