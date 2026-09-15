import dotenv from 'dotenv';
import path from 'path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './server';
import { connectDB } from '../db';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  logger.info('🚀 Starting SupplyGuard AI MCP Server...');

  // Connect to DB for live resource reading
  try {
    await connectDB();
  } catch (err) {
    logger.warn('MCP Server started without persistent MongoDB connection');
  }

  const server = createMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  logger.info('✅ SupplyGuard AI MCP Server connected via Stdio transport');
}

if (require.main === module) {
  main().catch((err) => {
    logger.error('Fatal MCP Server error:', err);
    process.exit(1);
  });
}
