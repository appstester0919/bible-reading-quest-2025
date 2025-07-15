@echo off
echo Setting up MCP Tools for RovoDev...

REM Create directories
echo Creating directories...
if not exist "D:\AI\RovoDev\mcp-tools" mkdir "D:\AI\RovoDev\mcp-tools"
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

REM Copy files to correct locations
echo Copying MCP tool files...
copy "mcp-tools\*" "D:\AI\RovoDev\mcp-tools\"
copy "mcp_servers.json" "%APPDATA%\Claude\mcp_servers.json"

REM Install global MCP server packages
echo Installing global MCP server packages...
call npm install -g @modelcontextprotocol/server-filesystem
call npm install -g @modelcontextprotocol/server-git
call npm install -g @modelcontextprotocol/server-github
call npm install -g @modelcontextprotocol/server-docker
call npm install -g @modelcontextprotocol/server-playwright
call npm install -g @modelcontextprotocol/server-brave-search

REM Install dependencies for custom tools
echo Installing dependencies for custom MCP tools...
cd "D:\AI\RovoDev\mcp-tools"
call npm install

REM Install Playwright browsers
echo Installing Playwright browsers...
call npx playwright install

echo.
echo ========================================
echo MCP Tools Setup Complete!
echo ========================================
echo.
echo Configuration file created at: %APPDATA%\Claude\mcp_servers.json
echo Custom tools installed at: D:\AI\RovoDev\mcp-tools\
echo.
echo Next steps:
echo 1. Add your API keys to environment variables:
echo    - GITHUB_PERSONAL_ACCESS_TOKEN
echo    - BRAVE_API_KEY  
echo    - VERCEL_TOKEN
echo.
echo 2. Restart Claude Desktop to load the new configuration
echo.
echo 3. Test with commands like:
echo    - "List files in my RovoDev directory"
echo    - "Show me the git status"
echo    - "Deploy my project to Vercel"
echo.
pause