const {
    EmbedBuilder,
    ChatInputCommandInteraction,
    Client,
    Events 
} = require('discord.js');

const suggestSchema = require('../../Models/suggestSchema');


module.exports = {
    name: Events.InteractionCreate,
    once: false,
    /**
   * @param {ChatInputCommandInteraction} interation
   * @param {Client} client 
   * * 
   * */
    async execute(interaction) {
        const { customId, member } = interaction;
        if (!interaction.isModalSubmit()) return;
        if (customId == 'suggestModal') {
            try {
                const data = await suggestSchema.findOne({ guildSuggest: interaction.guild.id });
                if (data) {
                    const suggestChannel = member.guild.channels.cache.get(data.guildChannel)
                    const suggestDesc = interaction.fields.getTextInputValue('suggestTextInput')
                    
                    const embed = new EmbedBuilder()
                        .setTitle('Nueva Sugerencia')
                        .setDescription(suggestDesc)
                        .setTimestamp()
                        .setColor('Random')
                        .setFooter({ text: `Sugerencia de ${member.user.tag}` })
    
                    await suggestChannel.send({ embeds: [embed] });
                    await interaction.reply({ content: 'Sugerencia enviada correctamente', ephemeral: true })
                }else{
                    return interaction.reply({ content: 'Errror al enviar la sugerencia 😒', ephemeral: true })
                }

            } catch (error) {
                console.log(error);
            }
        } else {
            return interaction.reply({ content: 'Error al enviar la sugerencia 😒', ephemeral: true })
        }
    }
}