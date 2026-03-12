#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerScaffoldProject } from './tools/scaffold-project.js'
import { registerCreateFeature } from './tools/create-feature.js'
import { registerCreateComponent } from './tools/create-component.js'
import { registerSetupProviders } from './tools/setup-providers.js'
import { registerCreateStyle } from './tools/create-style.js'
import { registerProjectInfo } from './tools/project-info.js'

const server = new McpServer({
  name: 'frontforge',
  version: '0.1.0',
})

// Register all tools
registerScaffoldProject(server)
registerCreateFeature(server)
registerCreateComponent(server)
registerSetupProviders(server)
registerCreateStyle(server)
registerProjectInfo(server)

async function main(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error: unknown) => {
  console.error('FrontForge MCP server error:', error)
  process.exit(1)
})
