const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    ComponentType,
} = require('discord.js');

const despedirSchema = require('../../Models/despedirUser');
const negociosSchema = require('../../Models/crearNegocios');
const contratarSchema = require('../../Models/contratarUser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('despedir')
        .setDescription('Despedir a un usuario')
        .addUserOption(option =>
            option.setName('nombre-usuario')
                .setDescription('Escribe el nombre del usuario')
                .setRequired(true)
        ),
    /**
           * @param {ChatInputCommandInteraction} interation
           * @param {Client} client 
           */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const user = options.getUser('nombre-usuario');

            const rolesUser = interation.member.roles.cache.map(role => role.id).join(',')

            const rolesArray = rolesUser.split(',')

            const validarRol = await negociosSchema.find({ guildNegocio: interation.guild.id, guildJefe: { $in: rolesArray } })


            if (validarRol.length === 0) {
                return interation.reply({ content: 'No hay negocios asociados a tu usuario', ephemeral: true })
            }

            if (validarRol.length === 1) {
                const rol = validarRol[0].guildRol;
                const guildNegocio = validarRol[0].guildNegocio

                const validarContratar = await contratarSchema.findOne({ guildNegocio: guildNegocio, guildRolEmpleo: rol, guildJefe: { $in: rolesArray }, IdEmpleado: user.id })

                const NegocioSchema = await negociosSchema.findOne({
                    guildNegocio: guildNegocio,
                    guildRol: rol,
                    guildJefe: { $in: rolesArray }
                });

                if (!NegocioSchema) {
                    return interation.reply({ content: 'No perteneces a este negocio', ephemeral: true })
                }

                if (!validarContratar) {
                    return interation.reply({ content: 'No has contratado a este usuario', ephemeral: true })  //No hay empleos
                }

                if (validarContratar) {
                    const despedir = new despedirSchema({
                        guildNegocio: interation.guild.id,
                        NombreEmpleado: user.username,
                        NombreQuienDespide: interation.user.username,
                        IdQuienDespide: interation.user.id,
                        fechaDespedir: new Date(),
                        ArrayContratado: validarContratar
                    })
                    await despedir.save()

                    await contratarSchema.findOneAndDelete({ guildNegocio: interation.guild.id, guildRolEmpleo: rol, guildJefe: { $in: rolesArray }, IdEmpleado: user.id })

                    await interation.guild.members.cache.get(user.id).roles.remove(rol)
                    await interation.guild.members.cache.get(user.id).user.send({ content: `Lo sentimos, has sido despedido, ${NegocioSchema.nombreNegocio} Colaborador de COMPLEX RP, Cualquier duda, por favor comunicarse con su jefe inmediato` })
                    return interation.reply({ content: `Has despedido a ${user.username} de ${NegocioSchema.nombreNegocio}`, ephemeral: true })
                }

            }

            const selecMenu = new StringSelectMenuBuilder()
                .setCustomId('selecMenunegocios')
                .setPlaceholder('Elige un negocio')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(validarRol.map(rol => {
                    return {
                        label: rol.nombreNegocio,
                        value: rol.guildRol
                    }
                }))

            const row = new ActionRowBuilder()
                .addComponents(selecMenu)


            const message = await interation.reply({ content: 'Selecciona el negocio donde vas a despedir', components: [row], ephemeral: true })

            const ifiter = i => i.user.id === interation.user.id

            const collectorFilter = message.createMessageComponentCollector({ filter: ifiter, time: 30000 })


            collectorFilter.on('collect', async interaction => {
                if (interaction.customId === 'selecMenunegocios') {
                    const rol = interaction.values[0]

                    const validarContratar = await contratarSchema.findOne({ guildNegocio: interation.guild.id, guildRolEmpleo: rol, guildJefe: { $in: rolesArray }, IdEmpleado: user.id })

                    const NegocioSchema = await negociosSchema.findOne({
                        guildNegocio: interaction.guild.id,
                        guildRol: rol,
                        guildJefe: { $in: rolesArray }
                    });

                    if (!NegocioSchema) {
                        return interaction.update({ content: 'No perteneces a este negocio', components: [] })
                    }

                    if (!validarContratar) {
                        return interaction.update({ content: 'No has contratado a este usuario', components: [] })  //No hay empleos
                    }

                    if (validarContratar) {
                        const despedir = new despedirSchema({
                            guildNegocio: interation.guild.id,
                            NombreEmpleado: user.username,
                            NombreQuienDespide: interation.user.username,
                            IdQuienDespide: interation.user.id,
                            fechaDespedir: new Date(),
                            ArrayContratado: validarContratar
                        })
                        await despedir.save()

                        await contratarSchema.findOneAndDelete({ guildNegocio: interation.guild.id, guildRolEmpleo: rol, guildJefe: { $in: rolesArray }, IdEmpleado: user.id })

                        await interation.guild.members.cache.get(user.id).roles.remove(rol)
                        await interation.guild.members.cache.get(user.id).user.send({ content: `Lo sentimos, has sido despedido, ${NegocioSchema.nombreNegocio} Colaborador de COMPLEX RP, Cualquier duda, por favor comunicarse con su jefe inmediato` })
                        await interaction.update({ content: `Has despedido a ${user.username} de ${NegocioSchema.nombreNegocio}`, components: [] })
                    }
                }
            })

        } catch (error) {
            console.log(error)
        }


    }
}