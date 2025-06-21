#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

/**
 * Script to convert REGULAR_PROMPT.txt to base64 and update .env.local
 * Usage: node update-prompt-base64.js
 */

const PROMPT_FILE = 'REGULAR_PROMPT.txt';
const ENV_FILE = '.env.local';
const ENV_VAR_NAME = 'OPENING_PROMPT_BASE64';

function main() {
  try {
    // Check if files exist
    if (!fs.existsSync(PROMPT_FILE)) {
      console.error(`❌ Error: ${PROMPT_FILE} not found`);
      process.exit(1);
    }

    if (!fs.existsSync(ENV_FILE)) {
      console.error(`❌ Error: ${ENV_FILE} not found`);
      process.exit(1);
    }

    // Read the prompt file
    console.log(`📖 Reading ${PROMPT_FILE}...`);
    const promptContent = fs.readFileSync(PROMPT_FILE, 'utf8');

    // Convert to base64
    console.log('🔄 Converting to base64...');
    const base64Content = Buffer.from(promptContent, 'utf8').toString('base64');

    // Read the .env.local file
    console.log(`📖 Reading ${ENV_FILE}...`);
    const envContent = fs.readFileSync(ENV_FILE, 'utf8');

    // Find and replace the OPENING_PROMPT_BASE64 line
    const envVarPattern = new RegExp(`^${ENV_VAR_NAME}=.*$`, 'm');
    const newEnvLine = `${ENV_VAR_NAME}="${base64Content}"`;

    let updatedEnvContent;
    if (envVarPattern.test(envContent)) {
      // Replace existing line
      console.log(`🔄 Updating existing ${ENV_VAR_NAME} variable...`);
      updatedEnvContent = envContent.replace(envVarPattern, newEnvLine);
    } else {
      // Add new line at the end
      console.log(`➕ Adding new ${ENV_VAR_NAME} variable...`);
      updatedEnvContent = `${envContent.trim()}\n${newEnvLine}\n`;
    }

    // Write back to .env.local
    console.log(`💾 Writing updated content to ${ENV_FILE}...`);
    fs.writeFileSync(ENV_FILE, updatedEnvContent, 'utf8');

    console.log('✅ Successfully updated OPENING_PROMPT_BASE64 in .env.local');
    console.log(`📏 Base64 length: ${base64Content.length} characters`);
    console.log(
      `📄 Original content length: ${promptContent.length} characters`,
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
