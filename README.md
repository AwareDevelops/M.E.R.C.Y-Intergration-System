# M.E.R.C.Y Integration Development Kit

Create powerful, secure integrations for the M.E.R.C.Y Discord moderation bot system.

## 🚀 Quick Start

1. **Clone this repository**
   ```bash
   git clone https://github.com/mercy-development/integration-dev-kit.git
   cd integration-dev-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize your integration**
   ```bash
   npm run init
   ```

4. **Develop your integration**
   - Edit `src/integration.js` with your integration logic
   - Update `mercy-integration.json` with your integration metadata
   - Test locally using `npm test`

5. **Validate and package**
   ```bash
   npm run validate
   npm run package
   ```

6. **Submit to M.E.R.C.Y**
   - Create a GitHub repository for your integration
   - Submit the repository URL to M.E.R.C.Y administrators
   - Wait for security review and approval

## 📋 Integration Structure

Your integration must follow this structure:

```
my-integration/
├── src/
│   ├── integration.js         # Main integration file
│   ├── commands/             # Discord commands (optional)
│   ├── events/               # Event handlers (optional)
│   └── utils/                # Helper utilities (optional)
├── mercy-integration.json     # Integration metadata
├── README.md                 # Documentation
└── package.json              # Dependencies
```

## 🛡️ Security Guidelines

### ✅ **Allowed**
- Discord.js API usage
- HTTP requests with axios
- Data processing with lodash
- Date manipulation with moment
- UUID generation
- Basic file operations (read-only)

### ❌ **Forbidden**
- Direct process access
- File system writes outside sandbox
- Network access to localhost
- Code evaluation (eval, Function)
- Child process spawning
- Access to environment variables
- Require/import of unlisted modules

## 📊 Resource Limits

- **Execution Time**: 30 seconds maximum
- **Memory Usage**: 100MB maximum
- **File Size**: 1MB maximum per file
- **API Calls**: 100 per minute per server
- **Database Operations**: Read-only access to integration data

## 🔧 API Reference

### Integration Class

Your integration must export a class with these methods:

```javascript
export default class MyIntegration {
    constructor(config) {
        this.config = config;
    }

    async onLoad() {
        // Called when integration is loaded
    }

    async onUnload() {
        // Called when integration is unloaded
    }

    async onMessage(message) {
        // Called for each message (if enabled)
    }

    async onMemberJoin(member) {
        // Called when member joins (if enabled)
    }

    async onModerationAction(action) {
        // Called for moderation actions (if enabled)
    }
}
```

### Available APIs

#### Discord API Access
```javascript
// Access Discord client (read-only)
const guild = this.client.guilds.cache.get(guildId);
const channel = guild.channels.cache.get(channelId);

// Send messages
await channel.send('Hello from integration!');

// Create embeds
const embed = new EmbedBuilder()
    .setTitle('Integration Response')
    .setDescription('This is from an integration');
```

#### Database Access
```javascript
// Read integration settings
const settings = await this.getSettings();

// Update integration settings
await this.updateSettings({ key: 'value' });

// Log events
await this.logEvent('action_taken', { user: userId, details: '...' });
```

#### HTTP Requests
```javascript
// Make HTTP requests
const response = await axios.get('https://api.example.com/data');
const data = response.data;
```

## 📝 Configuration Schema

Your `mercy-integration.json` file must include:

```json
{
  "id": "my-awesome-integration",
  "name": "My Awesome Integration",
  "version": "1.0.0",
  "description": "Does awesome things for your Discord server",
  "category": "utility",
  "developer": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "github": "https://github.com/yourusername"
  },
  "permissions": [
    "SendMessages",
    "EmbedLinks",
    "ViewChannel"
  ],
  "events": [
    "messageCreate",
    "guildMemberAdd"
  ],
  "settings": {
    "welcomeMessage": {
      "type": "string",
      "default": "Welcome to the server!",
      "description": "Message to send to new members"
    },
    "welcomeChannel": {
      "type": "channel",
      "required": true,
      "description": "Channel to send welcome messages"
    }
  },
  "premium": false,
  "experimental": false
}
```

## 🧪 Testing

### Local Testing

```bash
# Run integration tests
npm test

# Validate integration code
npm run validate

# Test with mock Discord data
npm run test:mock
```

### Integration Testing Environment

Use the provided mock Discord client for testing:

```javascript
import { MockClient, MockGuild, MockChannel } from './test/mocks.js';

const client = new MockClient();
const guild = new MockGuild('123456789', 'Test Server');
const channel = new MockChannel('987654321', 'test-channel');
```

## 📦 Packaging & Submission

1. **Package your integration**
   ```bash
   npm run package
   ```

2. **Create GitHub repository**
   - Make your repository public
   - Include all integration files
   - Add comprehensive README
   - Follow semantic versioning

3. **Submit for review**
   - Email: integrations@mercy-bot.com
   - Include: Repository URL, description, testing instructions
   - Review time: 3-7 business days

## 🔍 Review Process

1. **Automated Security Scan**
   - Code analysis for vulnerabilities
   - Dependency security check
   - Resource usage validation

2. **Manual Code Review**
   - Security best practices
   - Code quality assessment
   - Functionality verification

3. **Live Testing**
   - Integration testing with real Discord data
   - Performance benchmarking
   - Edge case validation

4. **Approval & Publication**
   - Integration added to marketplace
   - Developer notification
   - Version tracking enabled

## 🆘 Support

- **Documentation**: https://docs.mercy-bot.com/integrations
- **Discord Server**: https://discord.gg/mercy-dev
- **Email Support**: dev-support@mercy-bot.com
- **GitHub Issues**: https://github.com/mercy-development/integration-dev-kit/issues

## 📄 License

This development kit is provided under the MIT License. Integrations created using this kit must comply with M.E.R.C.Y's integration policies and Discord's Terms of Service.

---

**Happy coding! 🚀**

*Build amazing integrations that make Discord servers safer and more engaging.*