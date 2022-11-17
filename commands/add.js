const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a user")
    .addUserOption(option =>
      option.setName('target')
      .setDescription('Add a user to the ticket')
      .setRequired(true)),
  run: async (interaction) => {
    const chan = client.channels.cache.get(interaction.channelId);
    const user = interaction.options.getUser('target');

    if (chan.name.includes('ticket')) {
      chan.edit({
        permissionOverwrites: [{
          id: user,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
      ],
      }).then(async () => {
        interaction.reply({
          content: `<@${user.id}> has ben added!`
        });
      });
    } else {
      interaction.reply({
        content: 'you dont have a ticket!',
        ephemeral: true
      });
    };
  },
};