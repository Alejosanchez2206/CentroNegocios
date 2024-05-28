const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');

const negocioSchema = require('../../Models/crearNegocios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agregarnegocios')
        .setDescription('Crea un sistema de negocios')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Escribe el nombre del negocio')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(32)
        ).addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol para el negocio')
                .setRequired(true)
        ).addRoleOption(option =>
            option.setName('rol-jefe')
                .setDescription('Rol para el jefe del negocio')
                .setRequired(true)
        ).addStringOption(option =>
            option.setName('crear-categoria')
                .setDescription('Desea crear una categoria para el negocio')
                .addChoices(
                    { name: 'Si', value: 'Si' },
                    { name: 'No', value: 'No' },
                ),
        ),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */

    async execute(interation, client) {
        try {
            const { options } = interation
            const negocioName = options.getString('nombre')
            const rol = options.getRole('rol')
            const rolJefe = options.getRole('rol-jefe')
            const Existencia = options.getString('crear-categoria')

            const data = await negocioSchema.findOne({ guildNegocio: interation.guild.id, guildRol: rol.id })

            if (data) {
                await negocioSchema.findOneAndUpdate(
                    { guildNegocio: interation.guild.id, guildRol: rol.id },
                    { nombreNegocio: negocioName }
                )
                return interation.reply({
                    content: 'Nombre de negocio actualizado correctamente',
                    ephemeral: true
                })
            }

            if (Existencia === 'Si') {
                const categoria = await interation.guild.channels.create({
                    name: negocioName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: interation.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: rol.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                })

                const canales = ['📢〡ᴀᴠɪꜱᴏꜱ', '👥〡ᴄʜᴀʀʟᴀ', '🚩〡ᴍɪꜱɪᴏɴᴇꜱ', '⛔〡ʀᴇɴᴜɴᴄɪᴀꜱ', '📋〡ᴍɪᴇᴍʙʀᴏꜱ']

                canales.forEach(async canal => {
                    await interation.guild.channels.create({
                        name: canal,
                        type: ChannelType.GuildText,
                        parent: categoria.id,
                        permissionOverwrites: [
                            {
                                id: interation.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: rol.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                            }, {
                                id: rolJefe.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                            }
                        ]
                    })
                })
            }

            const newNegocio = new negocioSchema({
                guildNegocio: interation.guild.id,
                guildRol: rol.id,
                guildJefe: rolJefe.id,
                nombreNegocio: negocioName
            })

            await newNegocio.save()

            return interation.reply({ content: 'Sistema de negocios creado correctamente', ephemeral: true })
        } catch (error) {
            console.log(error)
        }
    }
}