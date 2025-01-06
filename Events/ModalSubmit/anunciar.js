const { Events } = require('discord.js');
const anunciar = require('../../Models/anuncios');

module.exports = {
    name: Events.InteractionCreate,
    customId: 'anunciarModal',
    once: false,
    async execute(interaction) {
        if (interaction.customId === 'anunciarModal') {
            try {
                // Primero diferimos la respuesta para evitar el timeout
                await interaction.deferReply({ ephemeral: true });

                const data = await anunciar.find({ guildId: interaction.guild.id });
                if (data.length > 0) {
                    const anuncioDesc = interaction.fields.getTextInputValue('anunciarTextInput');
                    let successCount = 0;
                    let errorCount = 0;

                    for (const channelData of data) {
                        try {
                            const anuncioChannel = interaction.guild.channels.cache.get(channelData.canalAnuncios);
                            if (anuncioChannel) {
                                await anuncioChannel.send(anuncioDesc);
                                successCount++;
                            } else {
                                errorCount++;
                                console.error(`Canal no encontrado: ${channelData.canalAnuncios}`);
                            }
                        } catch (channelError) {
                            errorCount++;
                            console.error(`Error al enviar al canal ${channelData.canalAnuncios}:`, channelError);
                        }
                    }

                    // Usamos editReply en lugar de reply porque ya diferimos la respuesta
                    await interaction.editReply({ 
                        content: `Anuncio enviado correctamente a ${successCount} canal(es)${
                            errorCount > 0 ? `. Hubo errores en ${errorCount} canal(es)` : ''
                        }` 
                    });
                } else {
                    await interaction.editReply({ 
                        content: 'No hay canales de anuncios configurados'
                    });
                }
            } catch (error) {
                console.error('Error general:', error);
                
                try {
                    if (interaction.deferred) {
                        await interaction.editReply({ 
                            content: 'Ocurrió un error al enviar el anuncio' 
                        });
                    } else {
                        await interaction.reply({ 
                            content: 'Ocurrió un error al enviar el anuncio', 
                            ephemeral: true 
                        });
                    }
                } catch (replyError) {
                    console.error('Error al responder a la interacción:', replyError);
                }
            }
        }
    }
};