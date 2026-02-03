#!/usr/bin/env node

/**
 * M.E.R.C.Y Integration Initialization Script
 * Creates a new integration project structure
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function initIntegration() {
    console.log('🚀 M.E.R.C.Y Integration Creator');
    console.log('='.repeat(35));
    console.log('');

    try {
        // Get integration details
        const name = await ask('Integration Name: ');
        const id = await ask(`Integration ID [${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}]: `) || 
                   name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const description = await ask('Description: ');
        const category = await ask('Category (moderation/utility/entertainment/automation/analytics/security): ');
        const developerName = await ask('Your Name: ');
        const developerEmail = await ask('Your Email: ');
        const githubUrl = await ask('Your GitHub URL (optional): ');

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
                validate: 'node ../scripts/validate-integration.js',
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

        // Copy integration template
        const templatePath = path.join(__dirname, '..', 'src', 'integration-template.js');
        const integrationPath = path.join(integrationDir, 'src', 'integration.js');
        
        let template = await fs.readFile(templatePath, 'utf8');
        template = template.replace(/IntegrationTemplate/g, toPascalCase(name));
        template = template.replace(/this\.config\.name/g, `"${name}"`);
        
        await fs.writeFile(integrationPath, template);

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

function toPascalCase(str) {
    return str
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

// Run the script
initIntegration();