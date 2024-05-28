const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');
const suggestSchema = require('../../Models/suggestSchema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerencia')
        .setDescription('Configura el canal de la sugerencia')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal donde se enviara la sugerencia')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client 
    * * 
    * */
    async execute(interaction) {
        const { options } = interaction
        const channel = options.getChannel('channel')

        const data = await suggestSchema.findOne({ guildSuggest: interaction.guild.id })


        if (data) {
            await suggestSchema.findOneAndUpdate(
                { guildSuggest: interaction.guild.id },
                { guildChannel: channel.id }
            )
            return interaction.reply({
                content: `Sugerencia actualizada correctamente`,
                ephemeral: true
            })
        }

        const newSuggestion = new suggestSchema({
            guildSuggest: interaction.guild.id,
            guildChannel: channel.id
        });

        await newSuggestion.save();

        return interaction.reply({
            content: `Sugerencia creada correctamente`,
            ephemeral: true
        })
    }

}
