const { model, Schema } = require('mongoose')

const despedirSchema = new Schema({
    guildNegocio: String,
    guildJefe: String,
    NombreQuienDespide: String,
    IdQuienDespide: String,
    NombreDelNegocio: String,
    NombreEmpleado: String,
    fechaDespedir: Date,
    ArrayContratado: Array
}, {
    versionKey: false
})

module.exports = model('user_despedidos', despedirSchema)