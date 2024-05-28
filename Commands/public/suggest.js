const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Client,
    ChatInputCommandInteraction
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Crea una sugerencia'),

    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client 
    * * 
    * */

    async execute(interaction) {
        const suggestModal = new ModalBuilder()
            .setCustomId('suggestModal')
            .setTitle('Deja tu sugerencia')


        const suggestTextInput = new TextInputBuilder()
            .setCustomId('suggestTextInput')
            .setLabel('¿Cual es tu sugerencia?')
            .setStyle(TextInputStyle.Paragraph)

        const componentModal = new ActionRowBuilder().addComponents(suggestTextInput)

        suggestModal.addComponents(componentModal)

        await interaction.showModal(suggestModal)
    }
}