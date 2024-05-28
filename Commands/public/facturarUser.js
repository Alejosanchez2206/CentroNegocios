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
const contratarSchema = require('../../Models/contratarUser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('facturar')
        .setDescription('Factura a un usuario')
        .addNumberOption(option =>
            option.setName('valor-factura')
                .setDescription('Dinero a facturar')
                .setRequired(true)
                .setMinValue(0)
        ).addStringOption(option =>
            option.setName('razon-factura')
                .setDescription('Razon de la factura')
                .setRequired(true)
                .setMinLength(3)
        ),

    /**
       * @param {ChatInputCommandInteraction} interation
       * @param {Client} client 
       */

    async execute(interation, client) {
        const { options } = interation;
        const valor = options.getNumber('valor-factura');
        const razon = options.getString('razon-factura');

        const rolesUser = interation.member.roles.cache.map(role => role.id).join(',')

        const rolesArray = rolesUser.split(',')

        const validarRol = await negociosSchema.find({ guildNegocio: interation.guild.id, guildRol: { $in: rolesArray } })

        if (validarRol.length === 0) {
            return interation.reply({ content: 'No hay negocios asociados a tu usuario', ephemeral: true })
        }

        if (validarRol.length === 1) {
            const rol = validarRol[0].guildRol;
            const guildNegocio = validarRol[0].guildNegocio

            const NegocioSchema = await negociosSchema.findOne({ guildNegocio: guildNegocio, guildRol: rol })

            if (!NegocioSchema) {
                return interation.reply({ content: 'No perteneces a este negocio', ephemeral: true })
            }

            if (NegocioSchema) {
                const facturar = new facturarSchema({
                    guildNegocio: NegocioSchema.guildNegocio,
                    guildRolEmpleo: NegocioSchema.guildRol,
                    NombreDelNegocio: NegocioSchema.nombreNegocio,
                    NombreEmpleado: interation.user.username,
                    IdEmpleado: interation.user.id,
                    RazonFactura: razon,
                    valorFactura: valor,
                    fechaFacturacion: Date.now()
                })

                await facturar.save()

                const formatoMiles = (number) => {
                    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
                    const rep = '$1,';
                    let arr = number.toString().split('.');
                    arr[0] = arr[0].replace(exp, rep);
                    return arr[1] ? arr.join('.') : arr[0];
                }

                const embebFact = new EmbedBuilder()
                    .setTitle('Facturacion Realizada')
                    .setDescription(`Detalles de la facturación`)
                    .setColor('#00FF2E')
                    .addFields({ name: 'Valor', value: `$${formatoMiles(valor)}` })
                    .addFields({ name: 'Razon', value: razon })
                    .addFields({ name: 'Facturado por', value: interation.user.username })
                    .setTimestamp()

                await interation.reply({ content: 'Factura realizada correctamente', ephemeral: true })

                return interation.channel.send({ embeds: [embebFact] })
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


        const message = await interation.reply({ content: 'Selecciona el negocio donde vas a contratar', components: [row], ephemeral: true })

        const ifiter = i => i.user.id === interation.user.id

        const collectorFilter = message.createMessageComponentCollector({ filter: ifiter, time: 30000 })

        collectorFilter.on('collect', async interation => {
            if (interation.customId === 'selecMenunegocios') {
                const rol = interation.values[0]

                const NegocioSchema = await negociosSchema.findOne({ guildNegocio: interation.guild.id, guildRol: rol })

                if (!NegocioSchema) {
                    return interation.update({ content: 'No perteneces a este negocio', components: [] })
                }

                if (NegocioSchema) {
                    const facturar = new facturarSchema({
                        guildNegocio: NegocioSchema.guildNegocio,
                        guildRolEmpleo: NegocioSchema.guildRol,
                        NombreDelNegocio: NegocioSchema.nombreNegocio,
                        NombreEmpleado: interation.user.username,
                        IdEmpleado: interation.user.id,
                        RazonFactura: razon,
                        valorFactura: valor,
                        fechaFacturacion: Date.now()
                    })

                    await facturar.save()

                    const formatoMiles = (number) => {
                        const exp = /(\d)(?=(\d{3})+(?!\d))/g;
                        const rep = '$1,';
                        let arr = number.toString().split('.');
                        arr[0] = arr[0].replace(exp, rep);
                        return arr[1] ? arr.join('.') : arr[0];
                    }

                    const embebFact = new EmbedBuilder()
                        .setTitle('Facturacion Realizada')
                        .setDescription(`Detalles de la facturación`)
                        .setColor('#00FF2E')
                        .addFields({ name: 'Valor', value: `$${formatoMiles(valor)}` })
                        .addFields({ name: 'Razon', value: razon })
                        .addFields({ name: 'Facturado por', value: interation.user.username })
                        .setTimestamp()

                    await interation.update({ content: 'Factura realizada correctamente', components: [] })

                    await interation.channel.send({ embeds: [embebFact] })
                }

            }

        })

    }
}