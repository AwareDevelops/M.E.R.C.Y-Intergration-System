#!/usr/bin/env node

/**
 * M.E.R.C.Y Integration System - Consolidated Module
 * 
 * This file combines all M.E.R.C.Y integration functionality:
 * - Integration initialization
 * - Integration validation
 * - Integration template class
 * 
 * Usage:
 *   Import as module: import { initIntegration, validateIntegration, IntegrationTemplate } from './mercy.js'
 *   Run as CLI: node mercy.js init|validate
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy load discord.js only when needed (for IntegrationTemplate usage)
let EmbedBuilder;
async function loadDiscordJS() {
    if (!EmbedBuilder) {
        const discord = await import('discord.js');
        EmbedBuilder = discord.EmbedBuilder;
    }
    return EmbedBuilder;
}

// ============================================================================
// PART 1: INTEGRATION TEMPLATE CLASS
// ============================================================================

/**
 * M.E.R.C.Y Integration Template
 * 
 * This is the base template for creating M.E.R.C.Y integrations.
 * Replace this template with your integration logic.
 * 
 * IMPORTANT: Do not modify the export structure or class name.
 */
export class IntegrationTemplate {
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
                    embeds: [await this.createWelcomeEmbed(member)]
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
        const EmbedBuilder = await loadDiscordJS();
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
        const EmbedBuilder = await loadDiscordJS();
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
    async createWelcomeEmbed(member) {
        const EmbedBuilder = await loadDiscordJS();
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

// ============================================================================
// PART 2: INTEGRATION INITIALIZATION
// ============================================================================

/**
 * Helper function for readline questions
 */
function ask(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
    return str
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

/**
 * Initialize a new M.E.R.C.Y integration project
 */
export async function initIntegration() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('🚀 M.E.R.C.Y Integration Creator');
    console.log('='.repeat(35));
    console.log('');

    try {
        // Get integration details
        const name = await ask(rl, 'Integration Name: ');
        const id = await ask(rl, `Integration ID [${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}]: `) || 
                   name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const description = await ask(rl, 'Description: ');
        const category = await ask(rl, 'Category (moderation/utility/entertainment/automation/analytics/security): ');
        const developerName = await ask(rl, 'Your Name: ');
        const developerEmail = await ask(rl, 'Your Email: ');
        const githubUrl = await ask(rl, 'Your GitHub URL (optional): ');

        console.log('\n📝 Creating integration structure...');

        // Create integration directory
        const integrationDir = path.resolve(process.cwd(), id);
        await fs.mkdir(integrationDir, { recursive: true });

        // Create subdirectories
        await fs.mkdir(path.join(integrationDir, 'src'), { recursive: true });
        await fs.mkdir(path.join(integrationDir, 'src/commands'), { recursive: true });
        await fs.mkdir(path.join(integrationDir, 'src/events'), { recursive: true });
        await fs.mkdir(path.join(integrationDir, 'src/utils'), { recursive: true });
        await fs.mkdir(path.join(integrationDir, 'test'), { recursive: true });

        // Create package.json
        const packageJson = {
            name: id,
            version: '1.0.0',
            description,
            main: 'src/integration.js',
            type: 'module',
            scripts: {
                test: 'node test/test-integration.js',
                validate: 'node ../mercy.js validate',
                package: 'node ../scripts/package-integration.js'
            },
            dependencies: {
                'discord.js': '^14.14.1',
                'axios': '^1.6.0',
                'lodash': '^4.17.21',
                'moment': '^2.29.4',
                'uuid': '^9.0.1'
            },
            author: `${developerName} <${developerEmail}>`,
            license: 'MIT',
            mercy: {
                integrationId: id,
                version: '1.0.0'
            }
        };

        await fs.writeFile(
            path.join(integrationDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Create mercy-integration.json
        const integrationConfig = {
            id,
            name,
            version: '1.0.0',
            description,
            category: category || 'utility',
            developer: {
                name: developerName,
                email: developerEmail,
                ...(githubUrl && { github: githubUrl })
            },
            repository: {
                url: '',
                branch: 'main'
            },
            permissions: [
                'ViewChannel',
                'SendMessages',
                'EmbedLinks'
            ],
            events: [
                'messageCreate',
                'interactionCreate'
            ],
            settings: {
                enabled: {
                    type: 'boolean',
                    default: true,
                    description: 'Enable/disable the integration'
                },
                prefix: {
                    type: 'string',
                    default: '!',
                    description: 'Command prefix for this integration'
                }
            },
            flags: {
                premium: false,
                experimental: false,
                beta: false
            }
        };

        await fs.writeFile(
            path.join(integrationDir, 'mercy-integration.json'),
            JSON.stringify(integrationConfig, null, 2)
        );

        // Create integration file from template
        const integrationCode = `import { IntegrationTemplate } from '../mercy.js';

/**
 * ${name} Integration
 * ${description}
 */
export default class ${toPascalCase(name)} extends IntegrationTemplate {
    constructor(config) {
        super(config);
    }

    async initialize() {
        await super.initialize();
        
        // Add your initialization logic here
        console.log('[${name}] Initialized successfully');
    }

    async onMessage(message) {
        await super.onMessage(message);
        
        // Add your message handling logic here
    }

    async onMemberJoin(member) {
        await super.onMemberJoin(member);
        
        // Add your member join logic here
    }

    // Override other methods as needed
}
`;
        
        await fs.writeFile(path.join(integrationDir, 'src', 'integration.js'), integrationCode);

        // Create README.md
        const readme = `# ${name}

${description}

## Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Test your integration:
   \`\`\`bash
   npm test
   \`\`\`

3. Validate integration:
   \`\`\`bash
   npm run validate
   \`\`\`

## Configuration

This integration supports the following settings:

- **enabled**: Enable/disable the integration
- **prefix**: Command prefix for this integration

## Commands

(Add your commands here)

## Events

This integration responds to the following Discord events:

- \`messageCreate\`: Processes new messages
- \`interactionCreate\`: Handles slash commands and interactions

## Development

### Testing

Run tests with:
\`\`\`bash
npm test
\`\`\`

### Validation

Validate your integration code:
\`\`\`bash
npm run validate
\`\`\`

### Packaging

Package for submission:
\`\`\`bash
npm run package
\`\`\`

## Support

- **Developer**: ${developerName}
- **Email**: ${developerEmail}
${githubUrl ? `- **GitHub**: ${githubUrl}` : ''}

## License

MIT License - see LICENSE file for details.
`;

        await fs.writeFile(path.join(integrationDir, 'README.md'), readme);

        // Create basic test file
        const testFile = `import ${toPascalCase(name)} from '../src/integration.js';

// Basic integration test
async function testIntegration() {
    console.log('🧪 Testing ${name} integration...');
    
    try {
        const config = {
            name: '${name}',
            version: '1.0.0'
        };
        
        const integration = new ${toPascalCase(name)}(config);
        
        // Test initialization
        await integration.initialize();
        console.log('✅ Initialization test passed');
        
        // Test basic functionality
        const uptime = integration.getUptime();
        console.log(\`✅ Uptime method works: \${uptime}\`);
        
        console.log('🎉 All tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testIntegration();
`;

        await fs.writeFile(path.join(integrationDir, 'test', 'test-integration.js'), testFile);

        // Create LICENSE file
        const license = `MIT License

Copyright (c) ${new Date().getFullYear()} ${developerName}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

        await fs.writeFile(path.join(integrationDir, 'LICENSE'), license);

        console.log('✅ Integration created successfully!');
        console.log('');
        console.log('📁 Project structure:');
        console.log(`   ${integrationDir}/`);
        console.log('   ├── src/');
        console.log('   │   ├── integration.js');
        console.log('   │   ├── commands/');
        console.log('   │   ├── events/');
        console.log('   │   └── utils/');
        console.log('   ├── test/');
        console.log('   │   └── test-integration.js');
        console.log('   ├── mercy-integration.json');
        console.log('   ├── package.json');
        console.log('   ├── README.md');
        console.log('   └── LICENSE');
        console.log('');
        console.log('🚀 Next steps:');
        console.log(`   1. cd ${id}`);
        console.log('   2. npm install');
        console.log('   3. Edit src/integration.js with your logic');
        console.log('   4. npm test');
        console.log('   5. npm run validate');
        console.log('');
        console.log('📚 Documentation: https://docs.mercy-bot.com/integrations');

    } catch (error) {
        console.error('❌ Error creating integration:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// ============================================================================
// PART 3: INTEGRATION VALIDATION
// ============================================================================

const SECURITY_PATTERNS = [
    { pattern: /require\s*\(\s*['"`]child_process['"`]\s*\)/g, severity: 'critical', message: 'Child process access forbidden' },
    { pattern: /import\s+.*\s+from\s+['"`]child_process['"`]/g, severity: 'critical', message: 'Child process import forbidden' },
    { pattern: /process\.env/g, severity: 'critical', message: 'Environment variable access forbidden' },
    { pattern: /eval\s*\(/g, severity: 'critical', message: 'Code evaluation forbidden' },
    { pattern: /new\s+Function\s*\(/g, severity: 'critical', message: 'Function constructor forbidden' },
    { pattern: /\.exec\s*\(/g, severity: 'high', message: 'Process execution forbidden' },
    { pattern: /\.spawn\s*\(/g, severity: 'high', message: 'Process spawning forbidden' },
    { pattern: /fs\.writeFile/g, severity: 'high', message: 'File writing forbidden (use provided APIs)' },
    { pattern: /fs\.unlink/g, severity: 'high', message: 'File deletion forbidden' },
    { pattern: /fs\.rmdir/g, severity: 'high', message: 'Directory deletion forbidden' },
    { pattern: /require\s*\(\s*['"`]fs['"`]\s*\)/g, severity: 'medium', message: 'Direct filesystem access discouraged' },
    { pattern: /setTimeout\s*\(\s*['"`][^'"`]*['"`]\s*,/g, severity: 'medium', message: 'String-based setTimeout forbidden' },
    { pattern: /setInterval\s*\(\s*['"`][^'"`]*['"`]\s*,/g, severity: 'medium', message: 'String-based setInterval forbidden' },
    { pattern: /while\s*\(\s*true\s*\)/g, severity: 'medium', message: 'Infinite loops detected' },
    { pattern: /for\s*\(\s*;;\s*\)/g, severity: 'medium', message: 'Infinite loops detected' }
];

const REQUIRED_FILES = [
    'mercy-integration.json',
    'package.json',
    'src/integration.js',
    'README.md'
];

const REQUIRED_CONFIG_FIELDS = [
    'id', 'name', 'version', 'description', 'category', 'developer'
];

/**
 * Validate a M.E.R.C.Y integration
 */
export async function validateIntegration() {
    console.log('🔍 M.E.R.C.Y Integration Validator');
    console.log('='.repeat(35));
    console.log('');

    const results = {
        errors: [],
        warnings: [],
        score: 100,
        isValid: true
    };

    try {
        // Check if we're in an integration directory
        const currentDir = process.cwd();
        console.log(`📁 Validating: ${path.basename(currentDir)}`);
        console.log('');

        // Validate file structure
        console.log('📋 Checking file structure...');
        for (const file of REQUIRED_FILES) {
            try {
                await fs.access(file);
                console.log(`  ✅ ${file}`);
            } catch {
                results.errors.push(`Missing required file: ${file}`);
                console.log(`  ❌ ${file} (missing)`);
                results.score -= 20;
            }
        }
        console.log('');

        // Validate configuration
        if (results.errors.length === 0 || results.errors.every(e => !e.includes('mercy-integration.json'))) {
            console.log('⚙️  Validating configuration...');
            try {
                const configData = await fs.readFile('mercy-integration.json', 'utf8');
                const config = JSON.parse(configData);

                for (const field of REQUIRED_CONFIG_FIELDS) {
                    if (!config[field]) {
                        results.errors.push(`Missing required config field: ${field}`);
                        console.log(`  ❌ Missing field: ${field}`);
                        results.score -= 10;
                    } else {
                        console.log(`  ✅ ${field}: ${typeof config[field] === 'object' ? JSON.stringify(config[field]) : config[field]}`);
                    }
                }

                // Validate version format
                if (config.version && !/^\d+\.\d+\.\d+$/.test(config.version)) {
                    results.warnings.push('Invalid version format, use semantic versioning (x.y.z)');
                    results.score -= 5;
                }

                // Validate ID format
                if (config.id && !/^[a-z0-9-_]+$/.test(config.id)) {
                    results.errors.push('Invalid ID format, use lowercase letters, numbers, hyphens, and underscores only');
                    results.score -= 15;
                }

                // Check category
                const validCategories = ['moderation', 'utility', 'entertainment', 'automation', 'analytics', 'security'];
                if (config.category && !validCategories.includes(config.category)) {
                    results.warnings.push(`Invalid category: ${config.category}. Use one of: ${validCategories.join(', ')}`);
                    results.score -= 5;
                }

            } catch (error) {
                results.errors.push(`Invalid mercy-integration.json: ${error.message}`);
                results.score -= 25;
            }
            console.log('');
        }

        // Validate package.json
        if (results.errors.length === 0 || results.errors.every(e => !e.includes('package.json'))) {
            console.log('📦 Validating package.json...');
            try {
                const packageData = await fs.readFile('package.json', 'utf8');
                const pkg = JSON.parse(packageData);

                // Check required fields
                if (!pkg.name) {
                    results.warnings.push('Missing package name');
                    results.score -= 5;
                }
                if (!pkg.version) {
                    results.warnings.push('Missing package version');
                    results.score -= 5;
                }
                if (pkg.type !== 'module') {
                    results.warnings.push('Package should use ES modules (type: "module")');
                    results.score -= 5;
                }

                // Check dependencies
                if (pkg.dependencies) {
                    const allowedDeps = ['discord.js', 'axios', 'lodash', 'moment', 'uuid'];
                    for (const dep of Object.keys(pkg.dependencies)) {
                        if (!allowedDeps.includes(dep)) {
                            results.errors.push(`Unauthorized dependency: ${dep}`);
                            results.score -= 15;
                        }
                    }
                }

                console.log('  ✅ Package configuration valid');
            } catch (error) {
                results.errors.push(`Invalid package.json: ${error.message}`);
                results.score -= 20;
            }
            console.log('');
        }

        // Validate integration code
        if (results.errors.length === 0 || results.errors.every(e => !e.includes('src/integration.js'))) {
            console.log('🔒 Performing security analysis...');
            try {
                const codeData = await fs.readFile('src/integration.js', 'utf8');
                
                // Check for security violations
                let violationsFound = false;
                for (const { pattern, severity, message } of SECURITY_PATTERNS) {
                    const matches = codeData.match(pattern);
                    if (matches) {
                        violationsFound = true;
                        if (severity === 'critical') {
                            results.errors.push(`CRITICAL: ${message} (${matches.length} instances)`);
                            results.score -= 30;
                            console.log(`  ❌ CRITICAL: ${message}`);
                        } else if (severity === 'high') {
                            results.errors.push(`HIGH: ${message} (${matches.length} instances)`);
                            results.score -= 20;
                            console.log(`  ⚠️  HIGH: ${message}`);
                        } else {
                            results.warnings.push(`${severity.toUpperCase()}: ${message} (${matches.length} instances)`);
                            results.score -= 10;
                            console.log(`  ⚠️  ${severity.toUpperCase()}: ${message}`);
                        }
                    }
                }

                if (!violationsFound) {
                    console.log('  ✅ No security violations detected');
                }

                // Check code structure
                if (!codeData.includes('export default class')) {
                    results.errors.push('Integration must export a default class');
                    results.score -= 25;
                }

                if (!codeData.includes('async onLoad()')) {
                    results.warnings.push('Integration should implement onLoad() method');
                    results.score -= 5;
                }

                // Calculate complexity
                const lines = codeData.split('\n').length;
                const functions = (codeData.match(/function|=>/g) || []).length;
                const complexity = lines + (functions * 2);

                if (complexity > 1000) {
                    results.warnings.push(`High code complexity: ${complexity} (consider simplifying)`);
                    results.score -= 10;
                } else {
                    console.log(`  ✅ Code complexity: ${complexity} (acceptable)`);
                }

            } catch (error) {
                results.errors.push(`Cannot read integration code: ${error.message}`);
                results.score -= 30;
            }
            console.log('');
        }

        // Additional validations
        console.log('📝 Additional checks...');
        
        // Check README
        try {
            const readme = await fs.readFile('README.md', 'utf8');
            if (readme.length < 100) {
                results.warnings.push('README.md is very short, consider adding more documentation');
                results.score -= 5;
            }
            console.log('  ✅ README.md exists and has content');
        } catch {
            console.log('  ⚠️  README.md missing or unreadable');
        }

        // Check for test files
        try {
            await fs.access('test');
            console.log('  ✅ Test directory found');
        } catch {
            results.warnings.push('No test directory found, consider adding tests');
            results.score -= 5;
        }

        console.log('');

        // Final validation
        results.isValid = results.errors.length === 0 && results.score >= 70;

        // Display results
        console.log('📊 Validation Results');
        console.log('='.repeat(20));
        
        if (results.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            results.errors.forEach(error => console.log(`  • ${error}`));
        }

        if (results.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            results.warnings.forEach(warning => console.log(`  • ${warning}`));
        }

        console.log(`\n📈 Security Score: ${results.score}/100`);
        
        if (results.isValid) {
            console.log('\n🎉 Integration validation passed!');
            console.log('✅ Ready for submission to M.E.R.C.Y marketplace');
        } else {
            console.log('\n❌ Integration validation failed');
            console.log('Please fix all errors before submitting');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Validation error:', error.message);
        process.exit(1);
    }
}

// ============================================================================
// CLI HANDLER
// ============================================================================

/**
 * CLI handler for running as a command-line tool
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];

    if (command === 'init') {
        initIntegration();
    } else if (command === 'validate') {
        validateIntegration();
    } else {
        console.log('M.E.R.C.Y Integration System');
        console.log('');
        console.log('Usage:');
        console.log('  node mercy.js init      - Initialize a new integration');
        console.log('  node mercy.js validate  - Validate an integration');
        console.log('');
        console.log('Or import as module:');
        console.log('  import { initIntegration, validateIntegration, IntegrationTemplate } from "./mercy.js"');
    }
}

// Export as default for convenient imports
export default IntegrationTemplate;
