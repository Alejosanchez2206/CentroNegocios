const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder
} = require('discord.js');

const contratarSchema = require('../../Models/contratarUser');
const negociosSchema = require('../../Models/crearNegocios');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('listar-empleados')
        .setDescription('Lista todos los empleados'),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */

    async execute(interation, client) {
        const rolesUser = interation.member.roles.cache.map(role => role.id).join(',')

        const rolesArray = rolesUser.split(',')

        const validarRol = await negociosSchema.find({ guildNegocio: interation.guild.id, guildJefe: { $in: rolesArray } })


        if (validarRol.length === 0) {
            return interation.reply({ content: 'No hay negocios asociados a tu usuario', ephemeral: true })
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


        const message = await interation.reply({ content: 'Selecciona el negocio donde quieres ver los empleados', components: [row], ephemeral: true })

        const ifiter = i => i.user.id === interation.user.id

        const collectorFilter = message.createMessageComponentCollector({ filter: ifiter, time: 30000 })

        collectorFilter.on('collect', async interation => {
            const rol = interation.values[0]

            const empleados = await contratarSchema.find({ guildNegocio: interation.guild.id, guildRolEmpleo: rol, guildJefe: { $in: rolesArray } })

            if (empleados.length === 0) {
                return interation.update({ content: 'No hay empleados', components: [] })
            }

            const NegocioSchema = await negociosSchema.findOne({
                guildNegocio: interation.guild.id,
                guildRol: rol,
                guildJefe: { $in: rolesArray }
            });

            if (!NegocioSchema) {
                return interation.update({ content: 'No perteneces a este negocio', components: [] })
            }

            const empleadoList = empleados.map(emp => {
                const fechaContratacion = new Date(emp.fechaContratar);
                const diferencia = new Date(new Date() - fechaContratacion);
                const months = diferencia.getUTCMonth();
                const days = diferencia.getUTCDate() - 1;
                return `${emp.NombreEmpleado} - ${months} meses y ${days} días`;
            }).join('\n');

            const embebEmpleados = new EmbedBuilder()
                .setColor("#00FF2E")
                .setTitle(`Empleados de ${NegocioSchema.nombreNegocio}`)
                .setDescription(`**${NegocioSchema.nombreNegocio}** tiene ${empleados.length} empleados\n\n${empleadoList}`);

            return interation.update({ embeds: [embebEmpleados], components: [] })
        })
    }
}