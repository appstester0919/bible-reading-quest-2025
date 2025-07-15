@echo off
echo Testing MCP Tools Setup...
echo.

REM Check if configuration file exists
if exist "%APPDATA%\Claude\mcp_servers.json" (
    echo ✓ MCP configuration file found
) else (
    echo ✗ MCP configuration file not found
    echo   Expected location: %APPDATA%\Claude\mcp_servers.json
)

REM Check if custom tools directory exists
if exist "D:\AI\RovoDev\mcp-tools" (
    echo ✓ Custom MCP tools directory found
) else (
    echo ✗ Custom MCP tools directory not found
    echo   Expected location: D:\AI\RovoDev\mcp-tools
)

REM Check if custom tool files exist
if exist "D:\AI\RovoDev\mcp-tools\vercel-server.js" (
    echo ✓ Vercel MCP server found
) else (
    echo ✗ Vercel MCP server not found
)

if exist "D:\AI\RovoDev\mcp-tools\bible-api-server.js" (
    echo ✓ Bible API MCP server found
) else (
    echo ✗ Bible API MCP server not found
)

if exist "D:\AI\RovoDev\mcp-tools\package.json" (
    echo ✓ Package.json found
) else (
    echo ✗ Package.json not found
)

echo.
echo Checking global MCP packages...
call npm list -g @modelcontextprotocol/server-filesystem >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Filesystem MCP server installed
) else (
    echo ✗ Filesystem MCP server not installed
)

call npm list -g @modelcontextprotocol/server-git >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Git MCP server installed
) else (
    echo ✗ Git MCP server not installed
)

call npm list -g @modelcontextprotocol/server-github >nul 2>&1
if %errorlevel%==0 (
    echo ✓ GitHub MCP server installed
) else (
    echo ✗ GitHub MCP server not installed
)

echo.
echo Checking environment variables...
if defined GITHUB_PERSONAL_ACCESS_TOKEN (
    echo ✓ GitHub token is set
) else (
    echo ✗ GitHub token not set
)

if defined BRAVE_API_KEY (
    echo ✓ Brave API key is set
) else (
    echo ✗ Brave API key not set
)

if defined VERCEL_TOKEN (
    echo ✓ Vercel token is set
) else (
    echo ✗ Vercel token not set
)

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If you see any ✗ marks above, please run the setup scripts again
echo or manually install the missing components.
echo.
pause