#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class VercelMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vercel-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'vercel_deploy',
          description: 'Deploy current project to Vercel',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to the project to deploy',
              },
              production: {
                type: 'boolean',
                description: 'Deploy to production (default: false)',
                default: false,
              },
            },
            required: ['projectPath'],
          },
        },
        {
          name: 'vercel_list_projects',
          description: 'List all Vercel projects',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'vercel_project_info',
          description: 'Get information about a specific Vercel project',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the Vercel project',
              },
            },
            required: ['projectName'],
          },
        },
        {
          name: 'vercel_env_list',
          description: 'List environment variables for a Vercel project',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the Vercel project',
              },
            },
            required: ['projectName'],
          },
        },
        {
          name: 'vercel_logs',
          description: 'Get deployment logs for a Vercel project',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the Vercel project',
              },
              limit: {
                type: 'number',
                description: 'Number of log entries to retrieve (default: 100)',
                default: 100,
              },
            },
            required: ['projectName'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'vercel_deploy':
            return await this.deployProject(args.projectPath, args.production);
          case 'vercel_list_projects':
            return await this.listProjects();
          case 'vercel_project_info':
            return await this.getProjectInfo(args.projectName);
          case 'vercel_env_list':
            return await this.listEnvironmentVariables(args.projectName);
          case 'vercel_logs':
            return await this.getDeploymentLogs(args.projectName, args.limit);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async deployProject(projectPath, production = false) {
    const deployCommand = production ? 'vercel --prod' : 'vercel';
    const { stdout, stderr } = await execAsync(deployCommand, { cwd: projectPath });
    
    return {
      content: [
        {
          type: 'text',
          text: `Deployment ${production ? '(Production)' : '(Preview)'} completed:\n${stdout}${stderr ? `\nErrors: ${stderr}` : ''}`,
        },
      ],
    };
  }

  async listProjects() {
    const { stdout } = await execAsync('vercel ls');
    return {
      content: [
        {
          type: 'text',
          text: `Vercel Projects:\n${stdout}`,
        },
      ],
    };
  }

  async getProjectInfo(projectName) {
    const { stdout } = await execAsync(`vercel inspect ${projectName}`);
    return {
      content: [
        {
          type: 'text',
          text: `Project Info for ${projectName}:\n${stdout}`,
        },
      ],
    };
  }

  async listEnvironmentVariables(projectName) {
    const { stdout } = await execAsync(`vercel env ls --scope ${projectName}`);
    return {
      content: [
        {
          type: 'text',
          text: `Environment Variables for ${projectName}:\n${stdout}`,
        },
      ],
    };
  }

  async getDeploymentLogs(projectName, limit = 100) {
    const { stdout } = await execAsync(`vercel logs ${projectName} --limit ${limit}`);
    return {
      content: [
        {
          type: 'text',
          text: `Deployment Logs for ${projectName} (last ${limit} entries):\n${stdout}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vercel MCP server running on stdio');
  }
}

const server = new VercelMCPServer();
server.run().catch(console.error);