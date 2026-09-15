import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { mcpTools } from './tools';
import { mcpResourceTemplates, readMCPResource } from './resources';
import { logger } from '../utils/logger';

export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'supplyguard-ai-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // 1. List all 10 MCP tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('[MCP] ListTools requested');
    return {
      tools: mcpTools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    };
  });

  // 2. Call an MCP tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.info(`[MCP] CallTool requested: ${name}`);

    const tool = mcpTools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`MCP Tool not found: ${name}`);
    }

    try {
      const result = await tool.handler(args || {});
      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      logger.error(`[MCP] Error executing tool ${name}:`, error);
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Tool Execution Error: ${error.message}`,
          },
        ],
      };
    }
  });

  // 3. List MCP Resource templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    logger.info('[MCP] ListResourceTemplates requested');
    return {
      resourceTemplates: mcpResourceTemplates,
    };
  });

  // 4. List Static Resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.info('[MCP] ListResources requested');
    return {
      resources: mcpResourceTemplates.map((r) => ({
        uri: r.uriTemplate,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType,
      })),
    };
  });

  // 5. Read an MCP Resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    logger.info(`[MCP] ReadResource requested: ${uri}`);

    try {
      const resourceData = await readMCPResource(uri);
      return {
        contents: [
          {
            uri,
            mimeType: resourceData.mimeType,
            text: resourceData.text,
          },
        ],
      };
    } catch (err: any) {
      logger.error(`[MCP] Error reading resource ${uri}:`, err);
      throw err;
    }
  });

  return server;
}
