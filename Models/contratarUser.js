const { model, Schema } = require('mongoose')

let contratarSchema = new Schema({
    guildNegocio: String,
    guildRolEmpleo: String,
    guildJefe: String,
    NombreQuienContrata: String,
    IdQuienContrata: String,
    NombreDelNegocio: String,
    NombreEmpleado: String,
    IdEmpleado : String,
    fechaContratar: Date
}, {
    versionKey: false
})

module.exports = model('user_contratados', contratarSchema)