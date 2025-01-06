const { model , Schema } = require('mongoose')

let autoMembersSchema = new Schema({
    guild: String,
    guildRol: String,
    guildChannel: String,
    nameAutoMember: String
}, {
    versionKey: false
})

module.exports = model('autoMembers', autoMembersSchema)