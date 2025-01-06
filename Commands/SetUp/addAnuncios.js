const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');

const anuncios = require('../../Models/anuncios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anuncios-config')
        .setDescription('Configura el canal de anuncios')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal donde se enviara los anuncios')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol para los anuncios')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Escribe el nombre de los anuncios')
                .setRequired(true)
                .setMinLength(3)
        ),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const channel = options.getChannel('channel');
            const rol = options.getRole('rol');
            const name = options.getString('name');

            const data = await anuncios.findOne({ guild: interation.guild.id, roleAnuncios: rol.id });

            if (data) {
                await anuncios.findOneAndUpdate({ guild: interation.guild.id, roleAnuncios: rol.id }, {
                    $set: {
                        guildChannel: channel.id,
                        roleAnuncios: rol.id,
                        nameAnuncios: name
                    }
                }, { upsert: true })
                return interation.reply({ content: 'Anuncios actualizados', ephemeral: true });
            }

            const newAnuncios = new anuncios({
                guildId: interation.guild.id,
                canalAnuncios: channel.id,
                roleAnuncios: rol.id,
                nameAnuncios: name
            });
            await newAnuncios.save();

            return interation.reply({ content: 'Anuncios configurados', ephemeral: true });
        } catch (err) {
            return interation.reply({ content: `Ocurrio un error al ejecutar el comando ${interation.commandName}`, ephemeral: true });
        }
    }
}
