import { EmbedBuilder } from 'discord.js';

/**
 * M.E.R.C.Y Integration Template
 * 
 * This is the base template for creating M.E.R.C.Y integrations.
 * Replace this template with your integration logic.
 * 
 * IMPORTANT: Do not modify the export structure or class name.
 */

export default class IntegrationTemplate {
    constructor(config) {
        this.config = config;
        this.client = null; // Will be injected by M.E.R.C.Y
        this.guild = null; // Will be injected by M.E.R.C.Y
        this.settings = new Map(); // Integration-specific settings
        this.version = '1.0.0';
    }

    /**
     * Called when integration is loaded and activated
     * Use this method for initialization logic
     */
    async onLoad() {
        console.log(`[${this.config.name}] Integration loaded successfully`);
        
        // Initialize integration settings
        await this.loadSettings();
        
        // Perform any setup tasks
        await this.initialize();
        
        return true;
    }

    /**
     * Called when integration is unloaded or disabled
     * Use this method for cleanup tasks
     */
    async onUnload() {
        console.log(`[${this.config.name}] Integration unloaded`);
        
        // Clean up resources
        await this.cleanup();
        
        return true;
    }

    /**
     * Initialize the integration
     * Override this method with your initialization logic
     */
    async initialize() {
        // Example initialization
        this.startTime = Date.now();
        this.commandCount = 0;
        this.eventCount = 0;
    }

    /**
     * Clean up resources
     * Override this method with your cleanup logic
     */
    async cleanup() {
        // Example cleanup
        this.commandCount = 0;
        this.eventCount = 0;
    }

    /**
     * Load integration settings from database
     */
    async loadSettings() {
        try {
            const savedSettings = await this.getStoredSettings();
            if (savedSettings) {
                this.settings = new Map(Object.entries(savedSettings));
            } else {
                // Load default settings from config
                this.settings = new Map(Object.entries(this.config.defaultSettings || {}));
            }
        } catch (error) {
            console.error(`[${this.config.name}] Failed to load settings:`, error);
            this.settings = new Map();
        }
    }

    /**
     * Save integration settings to database
     */
    async saveSettings() {
        try {
            const settingsObject = Object.fromEntries(this.settings);
            await this.updateStoredSettings(settingsObject);
        } catch (error) {
            console.error(`[${this.config.name}] Failed to save settings:`, error);
        }
    }

    /**
     * Handle Discord message events
     * Override this method to process messages
     */
    async onMessage(message) {
        // Example message handling
        this.eventCount++;
        
        // Don't process bot messages
        if (message.author.bot) return;
        
        // Example: respond to mentions
        if (message.mentions.has(this.client.user)) {
            await this.handleMention(message);
        }
    }

    /**
     * Handle member join events
     * Override this method to process new members
     */
    async onMemberJoin(member) {
        this.eventCount++;
        
        // Example member join handling
        const welcomeChannel = this.settings.get('welcomeChannel');
        const welcomeMessage = this.settings.get('welcomeMessage') || 'Welcome to the server!';
        
        if (welcomeChannel) {
            const channel = this.guild.channels.cache.get(welcomeChannel);
            if (channel) {
                await channel.send({
                    content: welcomeMessage.replace('{user}', member.toString()),
                    embeds: [this.createWelcomeEmbed(member)]
                });
            }
        }
    }

    /**
     * Handle member leave events
     * Override this method to process member departures
     */
    async onMemberLeave(member) {
        this.eventCount++;
        
        // Example member leave handling
        console.log(`[${this.config.name}] Member left: ${member.user.tag}`);
    }

    /**
     * Handle moderation actions
     * Override this method to process moderation events
     */
    async onModerationAction(action) {
        this.eventCount++;
        
        // Example moderation action handling
        console.log(`[${this.config.name}] Moderation action: ${action.type} by ${action.moderator.tag} on ${action.target.tag}`);
    }

    /**
     * Handle Discord interactions (slash commands, buttons, etc.)
     * Override this method to process interactions
     */
    async onInteraction(interaction) {
        this.commandCount++;
        
        if (interaction.isChatInputCommand()) {
            await this.handleSlashCommand(interaction);
        } else if (interaction.isButton()) {
            await this.handleButton(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await this.handleSelectMenu(interaction);
        }
    }

    /**
     * Handle slash commands
     * Override this method to implement custom commands
     */
    async handleSlashCommand(interaction) {
        // Example command handling
        if (interaction.commandName === 'integration-stats') {
            await this.sendStats(interaction);
        }
    }

    /**
     * Handle button interactions
     * Override this method to implement button responses
     */
    async handleButton(interaction) {
        // Example button handling
        console.log(`[${this.config.name}] Button pressed: ${interaction.customId}`);
        await interaction.reply({ content: 'Button handled!', ephemeral: true });
    }

    /**
     * Handle select menu interactions
     * Override this method to implement select menu responses
     */
    async handleSelectMenu(interaction) {
        // Example select menu handling
        console.log(`[${this.config.name}] Select menu: ${interaction.customId}, values: ${interaction.values}`);
        await interaction.reply({ content: 'Selection processed!', ephemeral: true });
    }

    /**
     * Handle mention responses
     */
    async handleMention(message) {
        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle(`${this.config.name} Integration`)
            .setDescription('This is an example response from a M.E.R.C.Y integration!')
            .addFields(
                { name: 'Version', value: this.version, inline: true },
                { name: 'Uptime', value: this.getUptime(), inline: true },
                { name: 'Events Processed', value: this.eventCount.toString(), inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    /**
     * Send integration statistics
     */
    async sendStats(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#10b981')
            .setTitle(`📊 ${this.config.name} Statistics`)
            .addFields(
                { name: 'Commands Executed', value: this.commandCount.toString(), inline: true },
                { name: 'Events Processed', value: this.eventCount.toString(), inline: true },
                { name: 'Uptime', value: this.getUptime(), inline: true }
            )
            .setFooter({ text: 'M.E.R.C.Y Integration Statistics' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    /**
     * Create welcome embed for new members
     */
    createWelcomeEmbed(member) {
        return new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Welcome!')
            .setDescription(`Welcome to ${this.guild.name}, ${member.user.tag}!`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Member #', value: this.guild.memberCount.toString(), inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp();
    }

    /**
     * Get integration uptime
     */
    getUptime() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    /**
     * Get setting value
     */
    getSetting(key, defaultValue = null) {
        return this.settings.get(key) || defaultValue;
    }

    /**
     * Set setting value
     */
    async setSetting(key, value) {
        this.settings.set(key, value);
        await this.saveSettings();
    }

    /**
     * Log integration event
     */
    async logEvent(event, data = {}) {
        try {
            await this.createLogEntry({
                integration: this.config.name,
                event,
                data,
                timestamp: new Date(),
                guild: this.guild.id
            });
        } catch (error) {
            console.error(`[${this.config.name}] Failed to log event:`, error);
        }
    }

    // ========================================
    // M.E.R.C.Y API METHODS
    // These methods are injected by the M.E.R.C.Y system
    // Do not implement these - they will be overridden
    // ========================================

    /**
     * Get stored settings from M.E.R.C.Y database
     */
    async getStoredSettings() {
        // Implemented by M.E.R.C.Y
        throw new Error('Method must be implemented by M.E.R.C.Y system');
    }

    /**
     * Update stored settings in M.E.R.C.Y database
     */
    async updateStoredSettings(settings) {
        // Implemented by M.E.R.C.Y
        throw new Error('Method must be implemented by M.E.R.C.Y system');
    }

    /**
     * Create log entry in M.E.R.C.Y system
     */
    async createLogEntry(entry) {
        // Implemented by M.E.R.C.Y
        throw new Error('Method must be implemented by M.E.R.C.Y system');
    }

    /**
     * Send webhook notification
     */
    async sendWebhook(webhookUrl, data) {
        // Implemented by M.E.R.C.Y
        throw new Error('Method must be implemented by M.E.R.C.Y system');
    }

    /**
     * Get server configuration
     */
    async getServerConfig() {
        // Implemented by M.E.R.C.Y
        throw new Error('Method must be implemented by M.E.R.C.Y system');
    }

    /**
     * Check user permissions
     */
    async checkPermissions(userId, permissions) {
        // Implemented by M.E.R.C.Y
        throw new Error('Method must be implemented by M.E.R.C.Y system');
    }
}