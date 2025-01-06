const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Client,
    ChatInputCommandInteraction,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anunciar')
        .setDescription('Crea un anuncio')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client
    * 
    * */

    async execute(interation, client) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('anunciarModal')
                .setTitle('Mensaje de anuncio');

            const messageInput = new TextInputBuilder()
                .setCustomId('anunciarTextInput')
                .setLabel('Mensaje')
                .setStyle(TextInputStyle.Paragraph);

            const componentModal = new ActionRowBuilder().addComponents(messageInput);

            modal.addComponents(componentModal);

            await interation.showModal(modal);
        } catch (err) {
            return interation.reply({ content: `Ocurrio un error al ejecutar el comando ${interation.commandName}`, ephemeral: true });
        }
    }
}

