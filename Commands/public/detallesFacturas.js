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

const facturarSchema = require('../../Models/facturacionUser');
const negociosSchema = require('../../Models/crearNegocios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resumen-factura')
        .setDescription('Detalles de una factura')
        .addNumberOption(option =>
            option.setName('dias')
                .setDescription('Dias a consultar sobre la facturas')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)
        ),
    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */

    async execute(interation, client) {
        try {
            const { options } = interation
            const dias = options.getNumber('dias')


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


            const message = await interation.reply({ content: 'Selecciona el negocio donde quieres ver los detalles de la facturas', components: [row], ephemeral: true })

            const ifiter = i => i.user.id === interation.user.id

            const collectorFilter = message.createMessageComponentCollector({ filter: ifiter, time: 30000 })

            collectorFilter.on('collect', async i => {

                if (i.customId === 'selecMenunegocios') {

                    const selec = i.values[0]

                    const facturas = await facturarSchema.aggregate([

                        {
                            $match: {   // Filtra por el rol seleccionado
                                guildRolEmpleo: selec,
                                fechaFacturacion: {
                                    $gte: new Date(Date.now() - (dias * 24 * 60 * 60 * 1000)),
                                    $lte: new Date(Date.now())
                                } // Filtra por los ultimos 30 dias
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    IdEmpleado: "$IdEmpleado",
                                    NombreEmpleado: "$NombreEmpleado"
                                },
                                totalFacturado: { $sum: '$valorFactura' }, // Suma el valor de las facturas por empleado     
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                IdEmpleado: "$_id.IdEmpleado",
                                NombreEmpleado: "$_id.NombreEmpleado",
                                TotalFact: "$totalFacturado"
                            }
                        },
                        { $sort: { TotalFact: -1 } }

                    ])

                    const negocio = await negociosSchema.findOne({ guildNegocio: interation.guild.id, guildRol: selec })
                    const formatoMiles = (number) => {
                        const exp = /(\d)(?=(\d{3})+(?!\d))/g;
                        const rep = '$1,';
                        let arr = number.toString().split('.');
                        arr[0] = arr[0].replace(exp, rep);
                        return arr[1] ? arr.join('.') : arr[0];
                    }

                    if (facturas.length === 0) {
                        return i.update({ content: `No hay facturas para este negocio`, components: [] }) // Actualiza el embed con el nuevo valor       

                    } else {
                        const facturacionTotal = facturas.reduce((total, fact) => total + fact.TotalFact, 0)
                        const embed = new EmbedBuilder()
                            .setColor('#00FF2E')
                            .setTitle(`Facturas de ${negocio.nombreNegocio}`)
                        for (let i = 0; i < facturas.length; i++) {
                            const fact = facturas[i]
                            embed.addFields({ name: `**Top ${i + 1}**`, value: `Nombre: ${fact.NombreEmpleado}\nFacturado: $ ${formatoMiles(fact.TotalFact)}` })
                        }
                        embed.addFields({ name: `**Total facturado**`, value: ` $ ${formatoMiles(facturacionTotal)}` })
                        await i.update({ content: `Detalle de la Facturas`, components: [] })
                        await i.channel.send({ content: `**Detalles de las facturas de ${negocio.nombreNegocio} , de los ultimos ${dias} dias**`, embeds: [embed] }) // Actualiza el embed con el nuevo valor

                    }

                }

            })
        } catch (err) {
            console.log(err)
        }
    }
}