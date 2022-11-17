const fs = require('fs');

module.exports = {
    event: "ready", // Name of the event
    oneTime: true, // If set to true the event will only be fired once until the client is restarted
    run: async (client) => {
      const commandFiles = fs
        .readdirSync("./commands")
        .filter((file) => file.endsWith(".js"));
  
      let commandsArray = [];
      commandFiles.forEach((file) => {
        const command = require(`../commands/${file}`);
        client.commands.set(command.data.name, command);
  
        commandsArray.push(command);
      });
  
      const slashCommands = commandsArray.map((e) => e.data.toJSON());
      client.application.commands.set(slashCommands)

      console.log(`Started as ${client.user.tag}`)

      const ticketPanelChannel = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('BLUE')
        .setAuthor({name: 'Ticket System', iconURL: client.user.avatarURL()})
        .setDescription('1️⃣ - You cannot have more than 1 ticket open at the same time.\n2️⃣ - Do not create tickets without reason.\n3️⃣ - Do not ping employees.\n4️⃣ - You need your rolls back, send proof of payment.\n5️⃣ - Do not spam, it does not change the response time.\n\n**Click the button below to create a ticket**')
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Create a Ticket')
          .setEmoji('🔒')
          .setStyle('SUCCESS'),
        );

      ticketPanelChannel.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`Channel not found.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(ticketPanelChannel, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
    },
  };