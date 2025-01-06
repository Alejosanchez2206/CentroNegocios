const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');

const autoMembers = require('../../Models/autoMember');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto-members')
        .setDescription('Configura el canal de automembers')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal donde se enviara los automembers')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol para los automembers')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Escribe el nombre de los automembers')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(32)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client
     */

    async execute(interaction) {
        try {
            const { options } = interaction
            const channel = options.getChannel('channel')
            const rol = options.getRole('rol')
            const name = options.getString('name')

            const data = await autoMembers.findOne({ guild: interaction.guild.id , guildRol: rol.id  })

            if (data) {
                await autoMembers.findOneAndUpdate({ guild: interaction.guild.id , guildRol: rol.id }, {
                    $set: {
                        guildChannel: channel.id,
                        guildRol: rol.id,
                        nameAutoMember: name
                    }
                }, { upsert: true })
                return interaction.reply({ content: 'AutoMembers actualizado correctamente', ephemeral: true })
            } else {
                const newAutoMembers = new autoMembers({
                    guild: interaction.guild.id,
                    guildChannel: channel.id,
                    guildRol: rol.id,
                    nameAutoMember: name

                });
                await newAutoMembers.save();
                return interaction.reply({ content: 'AutoMembers configurado correctamente', ephemeral: true })
            }
        } catch (err) {
            console.log(err)
        }
    }
}