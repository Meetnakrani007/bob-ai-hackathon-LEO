import { Request, Response } from 'express';
import { mcpTools } from '../mcp/tools';
import { mcpResourceTemplates, readMCPResource } from '../mcp/resources';

export async function listTools(_req: Request, res: Response): Promise<void> {
  res.json({
    data: {
      count: mcpTools.length,
      tools: mcpTools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    },
  });
}

export async function callTool(req: Request, res: Response): Promise<void> {
  const { name } = req.params;
  const args = req.body || {};

  const tool = mcpTools.find((t) => t.name === name);
  if (!tool) {
    res.status(404).json({
      error: { code: 'TOOL_NOT_FOUND', message: `MCP Tool "${name}" does not exist` },
    });
    return;
  }

  try {
    const result = await tool.handler(args);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'TOOL_EXECUTION_ERROR', message: err.message },
    });
  }
}

export async function listResources(_req: Request, res: Response): Promise<void> {
  res.json({
    data: {
      count: mcpResourceTemplates.length,
      resourceTemplates: mcpResourceTemplates,
    },
  });
}

export async function readResource(req: Request, res: Response): Promise<void> {
  const uri = req.query.uri as string;
  if (!uri) {
    res.status(400).json({
      error: { code: 'MISSING_URI', message: 'Query parameter "uri" is required' },
    });
    return;
  }

  try {
    const resourceData = await readMCPResource(uri);
    res.json({ data: JSON.parse(resourceData.text) });
  } catch (err: any) {
    res.status(404).json({
      error: { code: 'RESOURCE_READ_ERROR', message: err.message },
    });
  }
}
