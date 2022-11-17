const { Client, Intents, Collection } = require('discord.js')
const fs = require('fs');

const client = new Client({ intents: Object.keys(Intents.FLAGS) });
client.commands = new Collection()
client.config = require('./config.json')
client.discord = require('discord.js')
const events = fs
  .readdirSync('./events')
  .filter(file => file.endsWith('.js'))

events.forEach(event => {
  const eventFile = require(`./events/${event}`)
  if (eventFile.oneTime) {
    client.once(eventFile.event, (...args) => eventFile.run(client, ...args))
  } else {
    client.on(eventFile.event, (...args) => eventFile.run(client, ...args))
  }
})

client.login(client.config.token)
