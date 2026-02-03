#!/usr/bin/env node

/**
 * M.E.R.C.Y Integration Validation Script
 * Validates integration code for security and compliance
 */

import fs from 'fs/promises';
import path from 'path';

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

async function validateIntegration() {
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

validateIntegration();