module.exports = {
    event: "interactionCreate", // Name of the event
    oneTime: false, // If set to true the event will only be fired once until the client is restarted
    run: async (client, interaction) => {
      if (interaction.isCommand()) {
      const commandCheck = interaction.client.commands.get(interaction.commandName);
  
      if (commandCheck) {
        await commandCheck.run(interaction);
      }
      }

      if (interaction.isButton()) {
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'You already have an open ticket!',
          ephemeral: true
        });
      };

      const embed = new client.discord.MessageEmbed()
          .setColor('BLUE')
          .setAuthor({name: 'Reason'})
          .setDescription('Please choose the reason for opening the ticket')
          .setFooter({text: 'Ticket System'})
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Please choose the reason for opening the ticket')
            .addOptions(client.config.ticketOptions),
          );
          let msg = await interaction.reply({
            content: `<@!${interaction.user.id}>`,
            embeds: [embed],
            components: [row],
            ephemeral: true,
            fetchReply: true
          })
            const collector = msg.createMessageComponentCollector({
              componentType: 'SELECT_MENU',
              time: 5000
            });
    
            collector.on('collect', i => {
              if (i.user.id === interaction.user.id) {
                interaction.guild.channels.create(`ticket-${interaction.user.tag}`, {
                  parent: client.config.ticketCategory,
                  topic: interaction.user.id,
                  permissionOverwrites: [{
                      id: interaction.user.id,
                      allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
                    },
                    {
                      id: client.config.roleSupport,
                      allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
                    },
                    {
                      id: interaction.guild.roles.everyone,
                      deny: ['VIEW_CHANNEL'],
                    },
                  ],
                  type: 'text',
                }).then(async c => {
                  interaction.followUp({
                    content: `Your ticket has been created at <#${c.id}>`,
                    ephemeral: true
                  });
                  const embed = new client.discord.MessageEmbed()
                  .setColor('BLUE')
                  .setAuthor({name: 'Ticket'})
                  .setDescription(`${interaction.member} has created a ticket with the reason ${i.values[0]}`)
                  .setFooter({text: 'Ticket System'})
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('close ticket')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
                  
                });
              };
            });
    
            collector.on('end', collected => {
              if (collected.size < 1) {
                interaction.editReply({content:`No reason was selected, cancelling...`, embeds: [], components: [], ephemeral: true})
              };
            });

      
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Ticket close')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('close cancel')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Are you sure you want to close the ticket?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `The ticket has been closed by <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {   
                    chan.send('The channel is being deleted');
        
                    setTimeout(() => {
                      chan.delete();
                    }, 5000);
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Close ticket cancelled!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Ticket closure cancelled!',
            components: []
          });
        };
      });
    };
  };
    },
  };