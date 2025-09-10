require("dotenv").config(); // lê variáveis do .env ou do ambiente do Render
console.log("oi, eu li o token, ok?", process.env.TOKEN)
// =======================================
// BOT DISCORD PROFISSIONAL - EUPHORIA
// =======================================

const { 
  Client, 
  GatewayIntentBits, 
  Partials,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  REST,
  Routes
} = require("discord.js");

require("./server.js"); // importa o keep-alive

// ---------------- CONFIGURAÇÕES ----------------
const CLIENT_ID = "1414699980177936487";
const GUILD_ID = "1386939396523032639";

// Canais
const LOG_CHANNEL_ID = "1414707221585199257";
const WELCOME_CHANNEL_ID = "1386939913710076055";
const PUNICOES_CHANNEL_ID = "1399286007521874013";
const VAGAS_CHANNEL_ID = "1414712166937923595";
const ATENDIMENTO_CHANNEL_ID = "1386939995008270336";

// Cargos staff
const STAFF_ROLE_ID = [
  "1386939815215235094",
  "1389814375631683799",
  "1386939816465399839"
];

// Variáveis globais
let ticketCounter = 1;
let sorteios = []; 

// ---------------- GIFS/BANNERS ----------------
const GIFS = {
  punir: "https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUyaXlubno5ejUwaXpiOG5rb2JzOGVhaXhleGY0bDFrb25ob3BuczkxaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TEFdTCTYmWXUE8oWj4/giphy.gif",
  atendimento: "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUycGlhM2JvaW5hNnNyemd0cGNlbDFwcHFidm1lMnAwNGdvNng5dzA1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9L3rYFHe6TtPBVHDV0/giphy.gif",
  painelVagas: "https://media3.giphy.com/media/v1.Y2lkPTZjMDliOTUyOW9sZmxhbTN5enNhNTE1Z2x0eXMydmFjeXNwdHd4MnV3b3NuenVndSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PRHlyU9I9klv4z58QR/giphy.gif",
  boasVindas: "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyN3VwY3lzYW9kYnVuOTYzeDcybGRqNWptemh3a3M4c3hha2VvdmlpYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/i0a1jnUf9XKXtJd1NU/giphy.gif",
  abraço: "https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyemhmd2R6NjQwc25uczV3aWpleWJvd2Fjdjgwb3VnNmk4ZXRzM29tMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YlYJ1q15qdoz7sL0Ni/giphy.gif",
  beijar: "https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyZ2tsdnFyd3J0NzhjNGxvcDY0N3M3MGNrZnRhaGhwYXR1Nm53bW5hMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L2x6xosmHuY8Rtm4DZ/giphy.gif",
  darPresente: "https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyYnZ6dmZhcnpkeDhpaHV6MDVnOWUxZXgyM3kzZGRpajJtMWMwNGx2NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W3C2a5udI6rc2q6x3n/giphy.gif"
};

// ---------------- CLIENTE ----------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ---------------- FUNÇÕES AUXILIARES ----------------
function isStaff(member) {
  return STAFF_ROLE_ID.some(roleId => member.roles.cache.has(roleId));
}

function createEmbed({ title, description, image, fields, color = "#8000FF" }) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp();
  if (description) embed.setDescription(description);
  if (image) embed.setImage(image);
  if (fields) embed.addFields(fields);
  return embed;
}

// ---------------- COMANDOS SLASH ----------------
const SOCIAL_COMMANDS = ["abraço", "beijar", "dar-presente"];
const commands = [
  new SlashCommandBuilder()
    .setName("punir")
    .setDescription("Aplicar punição a um usuário")
    .addUserOption(opt => opt.setName("usuário").setDescription("Usuário a punir").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Tranca o canal atual")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("unlockdown")
    .setDescription("Destranca o canal atual")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("atendimento")
    .setDescription("Exibe painel de atendimento"),

  new SlashCommandBuilder()
    .setName("painel_vagas")
    .setDescription("Exibe painel de vagas")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName("sorteio")
    .setDescription("Criar sorteio")
    .addStringOption(opt => opt.setName("premio").setDescription("Prêmio do sorteio").setRequired(true))
    .addStringOption(opt => opt.setName("quando").setDescription("Quando será realizado?").setRequired(true))
]
.concat(
  SOCIAL_COMMANDS.map(name =>
    new SlashCommandBuilder()
      .setName(name)
      .setDescription(`Interaja com alguém usando ${name}`)
      .addUserOption(opt => opt.setName("usuário").setDescription("Pessoa alvo").setRequired(true))
  )
)
.map(cmd => cmd.toJSON());

// ---------------- REGISTRO DE COMANDOS ----------------
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log("🔄 Registrando comandos...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos registrados!");
  } catch (err) { 
    console.error(err); 
  }
})();

// ---------------- EVENTOS ----------------

// Ready
client.once("ready", () => {
  console.log(`✅ Logado como ${client.user.tag}`);
});

// Boas-vindas
client.on("guildMemberAdd", async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const embed = createEmbed({
    title: `🎉 Bem-vindo(a), ${member.user.username}!`,
    description: `Olá, <@${member.id}>! Estamos felizes por ter você aqui.\n\n` +
                 `📌 Leia as regras\n📌 Confira os anúncios\n📌 Interaja e divirta-se!`,
    image: GIFS.boasVindas
  });

  channel.send({ embeds: [embed] });
});

// Log de mensagens apagadas
client.on("messageDelete", async message => {
  if (!message.guild) return;

  const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  const authorTag = message.author ? message.author.tag : "Autor desconhecido";

  const embed = createEmbed({
    title: "🗑️ Mensagem deletada",
    description: `**Autor:** ${authorTag}\n**Canal:** ${message.channel}\n**Conteúdo:** ${message.content || "Mensagem vazia"}`
  });

  logChannel.send({ embeds: [embed] });
});

// ---------------- INTERAÇÕES ----------------
client.on("interactionCreate", async interaction => {
  // === COMANDOS SOCIAIS ===
  if (interaction.isChatInputCommand() && SOCIAL_COMMANDS.includes(interaction.commandName)) {
    const target = interaction.options.getUser("usuário");
    const embed = createEmbed({
      title: `${interaction.user.username} ${interaction.commandName} ${target.username}!`,
      image: GIFS[interaction.commandName]
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`retribuir_${interaction.commandName}_${interaction.user.id}_${target.id}`)
        .setLabel("Retribuir")
        .setStyle(ButtonStyle.Primary)
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  // === BOTÃO RETRIBUIR ===
  if (interaction.isButton() && interaction.customId.startsWith("retribuir_")) {
    const [ , cmd, origUserId, targetId ] = interaction.customId.split("_");
    if (interaction.user.id !== targetId) {
      return interaction.reply({ content: "❌ Apenas a pessoa alvo pode retribuir.", ephemeral: true });
    }

    const embed = createEmbed({
      title: `${interaction.user.username} retribuiu o ${cmd}!`,
      image: GIFS[cmd]
    });

    return interaction.update({ embeds: [embed], components: [] });
  }

  // === /LOCKDOWN ===
  if (interaction.isChatInputCommand() && interaction.commandName === "lockdown") {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: "❌ Você não tem permissão.", ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    const embed = createEmbed({ 
      title: "🔒 Canal trancado", 
      description: `O canal ${interaction.channel} foi trancado por <@${interaction.user.id}>.` 
    });
    return interaction.reply({ embeds: [embed] });
  }

  // === /UNLOCKDOWN ===
  if (interaction.isChatInputCommand() && interaction.commandName === "unlockdown") {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: "❌ Você não tem permissão.", ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    const embed = createEmbed({
      title: "🔓 Canal destrancado",
      description: `O canal ${interaction.channel} foi destrancado por <@${interaction.user.id}>.`
    });
    return interaction.reply({ embeds: [embed] });
  }

  // === /PUNIR ===
  if (interaction.isChatInputCommand() && interaction.commandName === "punir") {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: "❌ Apenas staff pode usar este comando.", ephemeral: true });
    }

    const user = interaction.options.getUser("usuário");
    const select = new StringSelectMenuBuilder()
  .setCustomId(`punir_select_${user.id}`)
  .setPlaceholder("Selecione o motivo da punição")
  .addOptions([
    // 1️⃣ Comportamento e respeito
    { label: "Desrespeito ao staff", value: "desrespeito_staff" },            // Expulsão
    { label: "Desrespeito a um membro", value: "desrespeito_membro" },        // Expulsão
    { label: "Ofensas ou xingamentos", value: "ofensas_xingamentos" },        // Advertência
    { label: "Discriminação ou preconceito", value: "discriminacao" },        // Banimento
    { label: "Assédio ou bullying", value: "assedio_bullying" },              // Banimento
    { label: "Discussões tóxicas contínuas", value: "discussoes_toxicas" },   // Advertência
    { label: "Spam de mensagens tóxicas ou provocativas", value: "spam_toxico" }, // Advertência Extrema

    // 2️⃣ Conteúdo impróprio
    { label: "Conteúdo pornográfico/NSFW", value: "conteudo_nsfw" },         // Expulsão
    { label: "Conteúdo NSFL", value: "conteudo_nsfl" },                       // Banimento
    { label: "Links maliciosos", value: "links_maliciosos" },                 // Banimento
    { label: "Doxxing", value: "doxxing" },                                   // Banimento
    { label: "Conteúdo polêmico proibido", value: "conteudo_polemico" },     // Advertência
    { label: "Fake news/golpes", value: "fake_news" },                        // Advertência Extrema

    // 3️⃣ Spam e flood
    { label: "Flood de mensagens", value: "flood_mensagens" },                // Advertência
    { label: "Flood de emojis/reactions", value: "flood_emojis" },            // Advertência
    { label: "Flood de menções", value: "flood_mencoes" },                    // Advertência Extrema
    { label: "Flood de links/imagens", value: "flood_links" },                // Advertência Extrema
    { label: "Repetição excessiva de mensagens", value: "repeticao_mensagens" }, // Advertência

    // 4️⃣ Automação e bots
    { label: "Uso indevido de bots", value: "uso_bots" },                     // Expulsão
    { label: "Auto-roles/scripts proibidos", value: "autoroles" },            // Banimento
    { label: "Auto-spam por bots", value: "autospam_bots" },                  // Expulsão
    { label: "Exploração de falhas de bots", value: "exploracao_bots" },      // Banimento

    // 5️⃣ Regras de canais
    { label: "Conteúdo fora do canal", value: "fora_canal" },                 // Advertência
    { label: "Ignorar regras de suporte", value: "ignorar_suporte" },         // Advertência
    { label: "Quebra de regras de chats de voz", value: "chat_voz" }          // Advertência Extrema
  ]);

    const row = new ActionRowBuilder().addComponents(select);
    return interaction.reply({ content: `Selecione o motivo da punição para ${user.tag}:`, components: [row], ephemeral: true });
  }

  // === SELECT MENU PUNIR ===
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith("punir_select_")) {
    const targetId = interaction.customId.split("_")[2];
    const member = await interaction.guild.members.fetch(targetId);
    const motivoSelecionado = interaction.values[0];

    let punicao = "";
switch (motivoSelecionado) {
  case "desrespeito_staff":
  case "desrespeito_membro":
  case "uso_bots":
  case "autospam_bots":
    punicao = "Expulsão";
    break;

  case "ofensas_xingamentos":
  case "discussoes_toxicas":
  case "conteudo_polemico":
  case "flood_mensagens":
  case "flood_emojis":
  case "repeticao_mensagens":
  case "fora_canal":
  case "ignorar_suporte":
    punicao = "Advertência";
    break;

  case "discriminacao":
  case "assedio_bullying":
  case "conteudo_nsfl":
  case "links_maliciosos":
  case "doxxing":
  case "autoroles":
  case "exploracao_bots":
    punicao = "Banimento";
    break;

  case "spam_toxico":
  case "fake_news":
  case "flood_mencoes":
  case "flood_links":
  case "chat_voz":
    punicao = "Advertência Extrema";
    break;
}

    const embed = createEmbed({
      title: "USUÁRIO PUNIDO! 🔨",
      fields: [
        { name: "👤 | Usuário", value: `<@${member.id}>` },
        { name: "👮‍♂️ | Staff Responsável", value: `<@${interaction.user.id}>` },
        { name: "❓ | Motivo", value: motivoSelecionado },
        { name: "📋 | Punição", value: punicao }
      ],
      image: GIFS.punir
    });

    const canalPunicoes = interaction.guild.channels.cache.get(PUNICOES_CHANNEL_ID);
    if (canalPunicoes) canalPunicoes.send({ embeds: [embed] });
    try { await member.send({ embeds: [embed] }); } catch (err) {}

    return interaction.update({ content: `✅ ${member.user.tag} foi punido!`, components: [] });
  }

  // === /ATENDIMENTO ===
  if (interaction.isChatInputCommand() && interaction.commandName === "atendimento") {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ content: "❌ Apenas staff pode enviar o painel.", ephemeral: true });
    }

    const embed = createEmbed({
      title: "🛎️ Painel de Atendimento",
      description: `Seja bem-vindo(a) ao nosso sistema de atendimento!\n\n` +
                   `Clique no botão abaixo para abrir seu chamado.`,
      image: GIFS.atendimento
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("abrir_ticket")
        .setLabel("Abrir chamado")
        .setStyle(ButtonStyle.Primary)
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  // === ABRIR TICKET ===
  if (interaction.isButton() && interaction.customId === "abrir_ticket") {
    const modal = new ModalBuilder()
      .setCustomId(`ticket_modal_${interaction.user.id}`)
      .setTitle("Formulário de Atendimento");

    const motivoInput = new TextInputBuilder()
      .setCustomId("motivo")
      .setLabel("Motivo do atendimento")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const detalhesInput = new TextInputBuilder()
      .setCustomId("detalhes")
      .setLabel("Detalhes do atendimento")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(motivoInput),
      new ActionRowBuilder().addComponents(detalhesInput)
    );

    await interaction.showModal(modal);
  }

  // === SUBMIT TICKET ===
  if (interaction.isModalSubmit() && interaction.customId.startsWith("ticket_modal_")) {
    const motivo = interaction.fields.getTextInputValue("motivo");
    const detalhes = interaction.fields.getTextInputValue("detalhes");

    const canal = await interaction.guild.channels.create({
      name: `atendimento-${ticketCounter++}`,
      type: 0, 
      permissionOverwrites: [
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ...STAFF_ROLE_ID.map(roleId => ({
          id: roleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        })),
        { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] }
      ]
    });

    const embed = createEmbed({
      title: `ATENDIMENTO #${ticketCounter - 1}`,
      fields: [
        { name: "👤 | Usuário", value: `<@${interaction.user.id}>` },
        { name: "👮‍♂️ | Staff Responsável", value: "Ainda não reivindicado" },
        { name: "❓ | Motivo", value: motivo },
        { name: "📋 | Detalhes", value: detalhes }
      ],
      image: GIFS.atendimento
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reivindicar_ticket")
        .setLabel("Reivindicar atendimento")
        .setStyle(ButtonStyle.Primary)
    );

    await canal.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
    return interaction.reply({ content: `✅ Seu ticket foi criado: ${canal}`, ephemeral: true });
  }

  // === REIVINDICAR TICKET ===
  if (interaction.isButton() && interaction.customId === "reivindicar_ticket") {
    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    embed.spliceFields(1, 1, { name: "👮‍♂️ | Staff Responsável", value: `<@${interaction.user.id}>` });
    return interaction.update({ embeds: [embed], components: [] });
  }

  // === /PAINEL_VAGAS ===
  if (interaction.isChatInputCommand() && interaction.commandName === "painel_vagas") {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ content: "❌ Apenas staff pode enviar o painel.", ephemeral: true });
    }

    const embed = createEmbed({
      title: "💼 Painel de Vagas",
      description: `Aqui você pode se inscrever para a staff. Clique no botão abaixo.`,
      image: GIFS.painelVagas
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("vagas_form")
        .setLabel("Enviar formulário de vagas")
        .setStyle(ButtonStyle.Primary)
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  // === FORMULÁRIO VAGAS ===
  if (interaction.isButton() && interaction.customId === "vagas_form") {
    const modal = new ModalBuilder()
      .setCustomId(`modal_vagas_${interaction.user.id}`)
      .setTitle("Formulário de Vagas");

    const userInput = new TextInputBuilder()
      .setCustomId("usuario")
      .setLabel("Qual seu usuário?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const idadeInput = new TextInputBuilder()
      .setCustomId("idade")
      .setLabel("Qual sua idade?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const motivoInput = new TextInputBuilder()
      .setCustomId("motivo")
      .setLabel("Por que deseja entrar para staff?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const plataformaInput = new TextInputBuilder()
      .setCustomId("plataforma")
      .setLabel("Quais plataformas você domina?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(userInput),
      new ActionRowBuilder().addComponents(idadeInput),
      new ActionRowBuilder().addComponents(motivoInput),
      new ActionRowBuilder().addComponents(plataformaInput)
    );

    await interaction.showModal(modal);
  }

  // === SUBMIT FORMULÁRIO VAGAS ===
  if (interaction.isModalSubmit() && interaction.customId.startsWith("modal_vagas_")) {
    const usuario = interaction.fields.getTextInputValue("usuario");
    const idade = interaction.fields.getTextInputValue("idade");
    const motivo = interaction.fields.getTextInputValue("motivo");
    const plataformas = interaction.fields.getTextInputValue("plataforma");

    const embed = createEmbed({
      title: "📌 Nova manifestação de Vagas",
      fields: [
        { name: "👤 Usuário", value: usuario },
        { name: "🎂 Idade", value: idade },
        { name: "❓ Motivo", value: motivo },
        { name: "💻 Plataformas", value: plataformas }
      ]
    });

    const canal = interaction.guild.channels.cache.get(VAGAS_CHANNEL_ID);
    if (canal) canal.send({ embeds: [embed] });

    return interaction.reply({ content: "✅ Seu formulário foi enviado com sucesso!", ephemeral: true });
  }
});

// ---------------- LOGIN ----------------
client.login(process.env.TOKEN);
