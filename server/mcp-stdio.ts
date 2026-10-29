import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {createMcpServer} from './mcp';

const enabled = (name: string) => process.env[`SHENYING_MCP_${name}`] === '1';
const server = createMcpServer({writes: enabled('ALLOW_WRITES'), external: enabled('ALLOW_EXTERNAL'), render: enabled('ALLOW_RENDER')});
const transport = new StdioServerTransport();
await server.connect(transport);
