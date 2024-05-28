
const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    ComponentType,
} = require('discord.js');


const contratarSchema = require('../../Models/contratarUser');
const negociosSchema = require('../../Models/crearNegocios');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('contratar')
        .setDescription('Contrata un usuario')
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
            const { options } = interation
            const user = options.getUser('nombre-usuario')


            const rolesUser = interation.member.roles.cache.map(role => role.id).join(',')

            const rolesArray = rolesUser.split(',')


            const validarRol = await negociosSchema.find({ guildNegocio: interation.guild.id, guildJefe: { $in: rolesArray } })


            if (validarRol.length === 0) {
                return interation.reply({ content: 'No hay negocios asociados a tu usuario', ephemeral: true })
            }

            if (validarRol.length === 1) {
                const rol = validarRol[0].guildRol;
                const guildNegocio = validarRol[0].guildNegocio

                const validarContratar = await contratarSchema.findOne({
                    guildNegocio: guildNegocio,
                    guildRolEmpleo: rol,
                    guildJefe: { $in: rolesArray },
                    IdEmpleado: user.id
                });

                if (validarContratar) {
                    return interation.reply({ content: 'Este usuario ya se encuentra contratado', ephemeral: true })
                }

                const NegocioSchema = await negociosSchema.findOne({
                    guildNegocio: guildNegocio,
                    guildRol: rol,
                    guildJefe: { $in: rolesArray }
                });


                if (!NegocioSchema) {
                    return interation.reply({ content: 'No perteneces a este negocio', ephemeral: true })
                }


                const contratar = new contratarSchema({
                    guildNegocio: interation.guild.id,
                    guildRolEmpleo: rol,
                    NombreEmpleado: user.username,
                    IdEmpleado: user.id,
                    NombreQuienContrata: interation.user.username,
                    IdQuienContrata: interation.user.id,
                    NombreDelNegocio: NegocioSchema.nombreNegocio,
                    guildJefe: NegocioSchema.guildJefe,
                    fechaContratar: new Date()
                });

                await contratar.save();
                await interation.guild.members.cache.get(user.id).roles.add(rol);
                await interation.guild.members.cache.get(user.id).user.send({
                    content: `Has sido contratado en ${NegocioSchema.nombreNegocio} compañia de COMPLEX RP, recuerda leer las normativas y estar atento a los comunicados.`
                });
                return interation.reply({
                    content: `Has contratado a ${user.username} en ${NegocioSchema.nombreNegocio} exitosamente.`,
                    ephemeral: true
                })
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


            const message = await interation.reply({ content: 'Selecciona el negocio donde vas a contratar', components: [row], ephemeral: true })

            const ifiter = i => i.user.id === interation.user.id

            const collectorFilter = message.createMessageComponentCollector({ filter: ifiter, time: 30000 })


            collectorFilter.on('collect', async interaction => {
                if (interaction.customId === 'selecMenunegocios') {
                    try {
                        const rol = interaction.values[0];
                        const validarContratar = await contratarSchema.findOne({
                            guildNegocio: interaction.guild.id,
                            guildRolEmpleo: rol,
                            guildJefe: { $in: rolesArray },
                            IdEmpleado: user.id
                        });

                        if (validarContratar) {
                            return interaction.update({ content: 'Este usuario ya se encuentra contratado', components: [] })
                        }

                        const NegocioSchema = await negociosSchema.findOne({
                            guildNegocio: interaction.guild.id,
                            guildRol: rol,
                            guildJefe: { $in: rolesArray }
                        });


                        if (!NegocioSchema) {
                            return interaction.update({ content: 'No perteneces a este negocio', components: [] })
                        }


                        const contratar = new contratarSchema({
                            guildNegocio: interaction.guild.id,
                            guildRolEmpleo: rol,
                            NombreEmpleado: user.username,
                            IdEmpleado: user.id,
                            NombreQuienContrata: interaction.user.username,
                            IdQuienContrata: interaction.user.id,
                            NombreDelNegocio: NegocioSchema.nombreNegocio,
                            guildJefe: NegocioSchema.guildJefe,
                            fechaContratar: new Date()
                        });

                        await contratar.save();
                        await interaction.guild.members.cache.get(user.id).roles.add(rol);
                        await interaction.guild.members.cache.get(user.id).user.send({
                            content: `Has sido contratado en ${NegocioSchema.nombreNegocio} compañia de COMPLEX RP, recuerda leer las normativas y estar atento a los comunicados.`
                        });
                        await interaction.update({
                            content: `Has contratado a ${user.username} en ${NegocioSchema.nombreNegocio} exitosamente.`,
                            components: []
                        })
                    } catch (error) {
                        console.error('Error handling interaction:', error);
                        interaction.reply({ content: 'Ha ocurrido un error al procesar tu solicitud.', ephemeral: true });
                    }
                }
            });



        } catch (e) {
            console.log(e)
        }
    }


}