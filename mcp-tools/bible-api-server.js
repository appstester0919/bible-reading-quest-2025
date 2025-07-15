#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const https = require('https');

class BibleAPIMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'bible-api-mcp-server',
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
          name: 'get_bible_verse',
          description: 'Get Bible verse text by reference',
          inputSchema: {
            type: 'object',
            properties: {
              reference: {
                type: 'string',
                description: 'Bible reference (e.g., "John 3:16", "Genesis 1:1-3")',
              },
              version: {
                type: 'string',
                description: 'Bible version (default: ESV)',
                default: 'ESV',
              },
            },
            required: ['reference'],
          },
        },
        {
          name: 'get_bible_chapter',
          description: 'Get entire Bible chapter',
          inputSchema: {
            type: 'object',
            properties: {
              book: {
                type: 'string',
                description: 'Bible book name (e.g., "Genesis", "Matthew")',
              },
              chapter: {
                type: 'number',
                description: 'Chapter number',
              },
              version: {
                type: 'string',
                description: 'Bible version (default: ESV)',
                default: 'ESV',
              },
            },
            required: ['book', 'chapter'],
          },
        },
        {
          name: 'validate_bible_reference',
          description: 'Validate if a Bible reference is valid',
          inputSchema: {
            type: 'object',
            properties: {
              reference: {
                type: 'string',
                description: 'Bible reference to validate',
              },
            },
            required: ['reference'],
          },
        },
        {
          name: 'get_reading_plan_progress',
          description: 'Calculate reading plan progress for Bible reading quest',
          inputSchema: {
            type: 'object',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date of reading plan (YYYY-MM-DD)',
              },
              dailyChapters: {
                type: 'number',
                description: 'Number of chapters to read per day',
                default: 3,
              },
              currentDate: {
                type: 'string',
                description: 'Current date (YYYY-MM-DD, defaults to today)',
              },
            },
            required: ['startDate'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_bible_verse':
            return await this.getBibleVerse(args.reference, args.version);
          case 'get_bible_chapter':
            return await this.getBibleChapter(args.book, args.chapter, args.version);
          case 'validate_bible_reference':
            return await this.validateBibleReference(args.reference);
          case 'get_reading_plan_progress':
            return await this.getReadingPlanProgress(args.startDate, args.dailyChapters, args.currentDate);
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

  async makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      }).on('error', reject);
    });
  }

  async getBibleVerse(reference, version = 'ESV') {
    try {
      // Using Bible API (you may need to replace with actual API)
      const encodedRef = encodeURIComponent(reference);
      const url = `https://bible-api.com/${encodedRef}`;
      const data = await this.makeHttpRequest(url);
      
      return {
        content: [
          {
            type: 'text',
            text: `${reference} (${version}):\n\n${data.text || data.verses?.[0]?.text || 'Verse not found'}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching verse: ${error.message}`,
          },
        ],
      };
    }
  }

  async getBibleChapter(book, chapter, version = 'ESV') {
    try {
      const reference = `${book} ${chapter}`;
      const encodedRef = encodeURIComponent(reference);
      const url = `https://bible-api.com/${encodedRef}`;
      const data = await this.makeHttpRequest(url);
      
      return {
        content: [
          {
            type: 'text',
            text: `${book} ${chapter} (${version}):\n\n${data.text || 'Chapter not found'}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching chapter: ${error.message}`,
          },
        ],
      };
    }
  }

  async validateBibleReference(reference) {
    // Basic validation logic for Bible references
    const bibleBooks = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
      '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
      'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
      'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
      'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
      'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
      '1 John', '2 John', '3 John', 'Jude', 'Revelation'
    ];

    const referencePattern = /^((?:1|2|3)?\s*\w+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;
    const match = reference.match(referencePattern);

    if (!match) {
      return {
        content: [
          {
            type: 'text',
            text: `Invalid reference format: ${reference}`,
          },
        ],
      };
    }

    const [, book, chapter, startVerse, endVerse] = match;
    const bookFound = bibleBooks.some(b => b.toLowerCase() === book.toLowerCase());

    return {
      content: [
        {
          type: 'text',
          text: `Reference validation for "${reference}":\n` +
                `Book: ${book} ${bookFound ? '✓' : '✗'}\n` +
                `Chapter: ${chapter}\n` +
                `Verse: ${startVerse || 'N/A'}${endVerse ? `-${endVerse}` : ''}\n` +
                `Valid: ${bookFound ? 'Yes' : 'No'}`,
        },
      ],
    };
  }

  async getReadingPlanProgress(startDate, dailyChapters = 3, currentDate) {
    const start = new Date(startDate);
    const current = currentDate ? new Date(currentDate) : new Date();
    const daysDiff = Math.floor((current - start) / (1000 * 60 * 60 * 24));
    
    const totalBibleChapters = 1189; // Total chapters in the Bible
    const expectedChapters = Math.max(0, daysDiff * dailyChapters);
    const progressPercentage = Math.min(100, (expectedChapters / totalBibleChapters) * 100);
    const estimatedCompletionDays = Math.ceil(totalBibleChapters / dailyChapters);
    const estimatedCompletionDate = new Date(start);
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedCompletionDays);

    return {
      content: [
        {
          type: 'text',
          text: `Reading Plan Progress:\n\n` +
                `Start Date: ${startDate}\n` +
                `Current Date: ${current.toISOString().split('T')[0]}\n` +
                `Days Elapsed: ${daysDiff}\n` +
                `Daily Chapters: ${dailyChapters}\n` +
                `Expected Chapters Read: ${expectedChapters}\n` +
                `Total Bible Chapters: ${totalBibleChapters}\n` +
                `Progress: ${progressPercentage.toFixed(1)}%\n` +
                `Estimated Completion: ${estimatedCompletionDate.toISOString().split('T')[0]}\n` +
                `Chapters Remaining: ${Math.max(0, totalBibleChapters - expectedChapters)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Bible API MCP server running on stdio');
  }
}

const server = new BibleAPIMCPServer();
server.run().catch(console.error);