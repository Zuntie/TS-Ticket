const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildBans, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ], 
    partials: ['CHANNEL', 'MESSAGE'] 
});
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const Config = require('./config.json');
const Keys = require('./keys.json')
const r = '\x1b[0m';
const StaffRole = Config.roles.Administrator || Config.roles.Staff || Config.roles.FullAccess

// Ticket System \\
async function ticketSystem() {
    const channel = client.channels.cache.get(Config.ticket_channel);
    try {
        channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message2 => {
                setTimeout(() => {
                    if (message2.author.id == client.user.id) {
                        message2.delete()
                    } else {
                    }
                }, 100)
            });
        }).catch(console.error);
    } catch (err) {
        log(`Fejl ved sletning af besked.\n\n**${err.name}**: ${err.message}`, 'red');
    }

    const embed = new EmbedBuilder()
        .setTitle('Support')
        .setColor(Config.defaultColor)
        .setDescription(
            'Velkommen til TS Hosting Support gennemgang.\n' +
            ' - Vi ønsker dig en rigtig god oplevelse med vores support.\n' +
            '\n' +
            'Vi ønsker rigtig gerne du læser vores support info, inden brug af support.\n' +
            'Vi har nogle ting som skal følges alt det kan du finde i regler.'
        )
        .setFooter({ text: 'TS - Hosting', iconURL: Config.serverLogo })

    const btn = new ButtonBuilder()
        .setCustomId("opretTicket")
        .setEmoji("✉️")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Opret Ticket");

    const row = new ActionRowBuilder()
        .addComponents(btn);
    setTimeout(async () => {
        const message = await channel.send({
            embeds: [embed],
            components: [row]
        })
    
        const filter = ( button ) => button.customId === 'opretTicket';
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });
    
        collector.on('collect', async (button) => {
            if (button.customId === 'opretTicket') {
                const ticketOwner = button.user.username;
                const ticketOwnerUser = button.user;
                const subChannel = await channel.guild.channels.create({
                    name: `${ticketOwner}`,
                    type: ChannelType.GuildText,
                    parent: Config.ticket_category,
                    permissionOverwrites: [
                        {
                            id: button.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: button.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                })

                const embed = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setColor(Config.defaultColor)
                    .setDescription('Du oprettede en ticket <#'+ subChannel.id +'>.')
                    .setFooter({ text: 'TS - Hosting', iconURL: Config.serverLogo })

                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })

                const subEmbed = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setColor(Config.defaultColor)
                    .setDescription(
                        '**Velkommen til TS Hosting Support.**\n' +
                        'Du bedes lade vær med at tagge staff teamet, det skal vi nok stå for, hvis det er en nødvendighed.' +
                        ' Husk at lukke din ticket, så snart du føler du har modtaget din support.'  
                    )
                    .setTimestamp()
                    .setFooter({ text: 'TS - Hosting', iconURL: Config.serverLogo })

                const btn = new ButtonBuilder()
                    .setCustomId("lukTicket")
                    .setEmoji(`✖️`)
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Luk Ticket')

                const row = new ActionRowBuilder()
                    .addComponents(btn);

                const subMessage = await subChannel.send({
                    content: `<@${button.user.id}>`,
                    embeds: [subEmbed],
                    components: [row]
                })

                const filter = ( button ) => button.clicker;
                const collector = subMessage.createMessageComponentCollector(filter, { time: 120000 });

                collector.on('collect', async (button) => {
                    if (button.customId === 'lukTicket') {
                        const embed = new EmbedBuilder()
                            .setTitle('TS - Hosting')
                            .setColor(Config.defaultColor)
                            .setDescription('Er du sikker på, du vil lukke ticketten?')
                            .setTimestamp()
                            .setFooter({ text: 'TS - Hosting', iconURL: Config.serverLogo })

                        const btn = new ButtonBuilder()
                            .setCustomId("luk")
                            .setEmoji(`✔️`)
                            .setStyle(ButtonStyle.Success)
                            .setLabel('Luk')

                        const btn2 = new ButtonBuilder()
                            .setCustomId("genåben")
                            .setEmoji(`✖️`)
                            .setStyle(ButtonStyle.Danger)
                            .setLabel('Genåben')
        
                        const row = new ActionRowBuilder()
                            .addComponents(btn, btn2); 

                        const lukMessage = await subChannel.send({
                            embeds: [embed],
                            components: [row]
                        })

                        const filter = ( button ) => button.clicker;
                        const collector = lukMessage.createMessageComponentCollector(filter, { time: 120000 });

                        collector.on('collect', async (button) => {
                            if (button.customId === 'luk') {
                                subChannel.permissionOverwrites.set([
                                    {
                                        id: ticketOwnerUser.id,
                                        deny: [PermissionsBitField.Flags.ViewChannel],
                                    },
                                ])

                                const embed = new EmbedBuilder()
                                    .setTitle('TS - Hosting')
                                    .setColor(Config.defaultColor)
                                    .setDescription(`<@${button.user.id}> lukkede ticketten.`)
                                    .setTimestamp()
                                    .setFooter({ text: 'TS - Hosting', iconURL: Config.serverLogo })

                                button.channel.messages.fetch({ limit: 1 }).then(messages => {
                                    messages.forEach(message2 => {
                                        setTimeout(() => {
                                            message2.delete()
                                        }, 100)
                                    });
                                }).catch(console.error);

                                setTimeout(async () => {
                                    await subChannel.send({
                                        embeds: [embed]
                                    })

                                    const transcriptChannel = client.channels.cache.get(Config.ticket_transcript)
                                    const attachment = await discordTranscripts.createTranscript(subChannel);

                                    const closeEmbed = new EmbedBuilder()
                                        .setTitle('TS - Hosting')
                                        .setColor(Config.defaultColor)
                                        .addFields(
                                            { name: 'Ticket Ejer', value: `<@${ticketOwnerUser.id}>`, inline: true },
                                            { name: 'Ticket Navn', value: `${subChannel.name}`, inline: true },
                                            { name: 'Transcript', value: `${attachment.name}`, inline: true },
                                        )
                                        .setTimestamp()
                                        .setFooter({ text: 'TS - Hosting', iconURL: Config.serverLogo })

                                    await transcriptChannel.send({
                                        files: [attachment],
                                        embeds: [closeEmbed]
                                    });

                                    setTimeout(async () => {
                                        try {
                                            await subChannel.delete();
                                        } catch (err) {
                                            return;
                                        }
                                    }, 5000)
                                }, 1000)

                            }
                            if (button.customId == 'genåben') {
                                const embed = new EmbedBuilder()
                                    .setTitle('TS - Hosting')
                                    .setColor(Config.defaultColor)
                                    .setDescription(`<@${button.user.id}> genåbnede ticketten.`)
                                    .setTimestamp()
                                    .setFooter({ text: 'TS - Hosting', iconURL: Config.serverLogo })

                                button.channel.messages.fetch({ limit: 1 }).then(messages => {
                                    messages.forEach(message2 => {
                                        setTimeout(() => {
                                            message2.delete()
                                        }, 100)
                                    });
                                }).catch(console.error);

                                setTimeout(async () => {
                                    await subChannel.send({
                                        embeds: [embed]
                                    })
                                }, 1000)
                            }
                        })
                    }
                })
            }
        })
    }, 1000)
}

// Commands \\
client.on('interactionCreate', async interaction => {
    const { commandName } = interaction;
    if (!interaction.isCommand()) return;

    if (commandName == 'ping') {
        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(`> Latency er **${Date.now() - interaction.createdTimestamp}**ms\n> API Latency er **${Math.round(client.ws.ping)}**ms\n\n[Discord Status](https://discordstatus.com)`)
            .setColor(Config.defaultColor)
            .setFooter({ text: 'TS - Hosting Ping', iconURL: Config.serverLogo })

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }

    if (commandName == 'ticketadd') {
        if (interaction.member.roles.cache.has(StaffRole)) {
        if (interaction.channel.parentId == Config.ticket_category) {
            const input = interaction.options.getUser('user').toJSON();
            if (input.bot) {
                const embed = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setDescription(`Du kan ikke tilføje en bot, til en ticket.`)
                    .setColor(Config.defaultColor)
                    .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})
                    .setTimestamp()

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            } else {
                const channel = interaction.channel
                channel.permissionOverwrites.edit(input.id, 
                    { 
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true,
                    }    
                );
                const embed = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setDescription(`<@${interaction.user.id}> tilføjede <@${input.id}> til ticketten.`)
                    .setColor(Config.defaultColor)
                    .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})
                    .setTimestamp()

                const embed2 = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setDescription(`Du tilføjede <@${input.id}> til ticketten.`)
                    .setColor(Config.defaultColor)
                    .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})
                    .setTimestamp()
                
                await interaction.reply({
                    embeds: [embed2],
                    ephemeral: true
                })

                await channel.send({
                    embeds: [embed]
                })
            }
        }
    }
    }

    if (commandName == 'ticketremove') {
        if (interaction.member.roles.cache.has(StaffRole)) {
        if (interaction.channel.parentId == Config.ticket_category) {
            const input = interaction.options.getUser('user').toJSON();
            if (input.bot) {
                const embed = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setDescription(`Du kan ikke fjerne en bot, fra en ticket.`)
                    .setColor(Config.defaultColor)
                    .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            } else {
                const channel = interaction.channel
                channel.permissionOverwrites.edit(input.id, 
                    { 
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false,
                    }    
                );
                const embed = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setDescription(`<@${interaction.user.id}> fjernede <@${input.id}> fra ticketten.`)
                    .setColor(Config.defaultColor)
                    .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})
                    .setTimestamp()

                const embed2 = new EmbedBuilder()
                    .setTitle('TS - Hosting')
                    .setDescription(`Du fjernede <@${input.id}> fra ticketten.`)
                    .setColor(Config.defaultColor)
                    .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})
                    .setTimestamp()
                
                await interaction.reply({
                    embeds: [embed2],
                    ephemeral: true
                })

                await channel.send({
                    embeds: [embed]
                })
            }
        }
    }
    }

    if (commandName == 'forceclose') {
        if (interaction.member.roles.cache.has(StaffRole)) {
        if (interaction.channel.parentId == Config.ticket_category) {
            const embed = new EmbedBuilder()
                .setTitle('TS - Hosting')
                .setDescription(`<@${interaction.user.id}> lukkede ticketten.`)
                .setColor(Config.defaultColor)
                .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})
                .setTimestamp()

            const replyEmbed = new EmbedBuilder()
                .setTitle('TS - Hosting')
                .setDescription(`Du force lukkede ticketten.`)
                .setColor(Config.defaultColor)
                .setFooter({text:'TS - Hosting', iconURL: Config.serverLogo})
                .setTimestamp()

            await interaction.reply({
                embeds: [replyEmbed],
                ephemeral: true
            })

            await interaction.channel.send({
                embeds: [embed]
            })

            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (err) {
                    return;
                }
            }, 5000)
        }
    }
    }
})

// Startup \\
client.on('ready', () => {
    console.log(`\x1b[1m[✅] \x1b[37mLogget ind som \x1b[0m\x1b[34m${client.user.tag}${r}`);

    const guild = client.guilds.cache.get(Config.mainGuild);
    let commands
        
    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'ping',
        description: 'Ping Command ⚙️.',
    })

    commands?.create({
        name: 'forceclose',
        description: 'Force en ticket til at lukke.',
    })

    commands?.create({
        name: 'ticketadd',
        description: 'Tilføjer en person til ticketten.',
        options: [
            {
                name: 'user',
                description: 'Personen der skal tilføjes.',
                type: 6,
                required: true,
            }
        ]
    })

    commands?.create({
        name: 'ticketremove',
        description: 'Fjerner en person fra ticketten.',
        options: [
            {
                name: 'user',
                description: 'Personen der skal fjernes.',
                type: 6,
                required: true,
            }
        ]
    })

    ticketSystem()
})

// Login \\
client.login(Keys.token)