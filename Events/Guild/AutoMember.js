const { Client, GatewayIntentBits } = require('discord.js');
const autoMembers = require('../../Models/autoMember');

module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    /**
     * @param {GuildMember} oldMember
     * @param {GuildMember} newMember
     * @param {Client} client
     */
    async execute(oldMember, newMember, client) {
        try {
            // Obtener roles agregados y eliminados
            const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));

            // ID del servidor
            const guildId = newMember.guild.id;

            // Procesar roles agregados
            if (addedRoles.size > 0) {
                for (const role of addedRoles.values()) {
                    await handleRoleUpdate(role, newMember, guildId);
                }
            }

            // Procesar roles eliminados
            if (removedRoles.size > 0) {
                for (const role of removedRoles.values()) {
                    await handleRoleUpdate(role, newMember, guildId);
                }
            }
        } catch (err) {
            console.error('Error al procesar guildMemberUpdate:', err);
        }
    },
};

/**
 * Manejar la actualización de roles.
 * @param {Role} role - El rol agregado o eliminado.
 * @param {GuildMember} member - El miembro que fue actualizado.
 * @param {string} guildId - El ID del servidor.
 * @param {string} action - La acción ("agregado" o "eliminado").
 */
async function handleRoleUpdate(role, member, guildId) {
    try {
        // Buscar datos del rol en la base de datos
        const roleData = await autoMembers.findOne({ guild: guildId, guildRol: role.id });
        if (!roleData) return;

        // Obtener canal configurado
        const channel = member.guild.channels.cache.get(roleData.guildChannel);
        if (!channel) {
            console.log(`El canal con ID ${roleData.guildChannel} no existe en el servidor.`);
            return;
        }

        // Buscar el último mensaje enviado por el bot en el canal
        const botLastMessage = (await channel.messages.fetch({ limit: 10 }))
            .filter((msg) => msg.author.id === member.client.user.id) // Filtrar mensajes del bot
            .first();

        // Si existe un mensaje previo del bot, eliminarlo
        if (botLastMessage) {
            await botLastMessage.delete();
        }

        // Obtener todos los miembros con el rol
        const membersWithRole = member.guild.members.cache.filter((m) =>
            m.roles.cache.has(role.id)
        );

        // Contar el total de miembros con el rol
        const totalMembers = membersWithRole.size;

        // Crear lista de miembros ordenada alfabéticamente
        const memberList = membersWithRole
            .map((m) => m.user) // Mapeamos al usuario
            .sort((a, b) => a.username.localeCompare(b.username)) // Ordenamos por nombre de usuario
            .map((user) => user.toString()) // Convertimos a menciones
            .join('\n') || 'No tienes empleados.';

        // Enviar mensaje al canal
        await channel.send({
            content: `**Negocio : ** ${role.name}\n\n**Total de miembros:** ${totalMembers}\n\n**Usuarios contratados:**\n${memberList}`,
        });
       
    } catch (err) {
        console.error(`Error al manejar la actualización del rol ${role.name}:`, err);
    }
}
