const {
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    PermissionFlagsBits
} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Saluda a un usuario')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Escribe el mensaje que deseas enviar')
                .setRequired(true)
        ),

    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client 
    */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const mensaje = options.getString('mensaje');
            await interation.reply({ content: 'Enviando mensaje...' } , { ephemeral: true });
            return interation.guild.channels.cache.get(interation.channelId).send(mensaje);

        } catch (err) {
            return interation.reply({ content: `Ocurrio un error al ejecutar el comando ${interation.commandName}`, ephemeral: true });
        }
    }
}