@echo off
echo Setting up API Keys for MCP Tools...
echo.
echo This script will help you set up environment variables for your API keys.
echo You'll need to get these keys from the respective services:
echo.
echo 1. GitHub Personal Access Token: https://github.com/settings/tokens
echo 2. Brave Search API Key: https://api.search.brave.com/
echo 3. Vercel Token: https://vercel.com/account/tokens
echo.

set /p github_token="Enter your GitHub Personal Access Token (or press Enter to skip): "
if not "%github_token%"=="" (
    setx GITHUB_PERSONAL_ACCESS_TOKEN "%github_token%"
    echo GitHub token set successfully!
)

set /p brave_key="Enter your Brave Search API Key (or press Enter to skip): "
if not "%brave_key%"=="" (
    setx BRAVE_API_KEY "%brave_key%"
    echo Brave API key set successfully!
)

set /p vercel_token="Enter your Vercel Token (or press Enter to skip): "
if not "%vercel_token%"=="" (
    setx VERCEL_TOKEN "%vercel_token%"
    echo Vercel token set successfully!
)

echo.
echo ========================================
echo API Keys Setup Complete!
echo ========================================
echo.
echo Environment variables have been set. You may need to restart your terminal
echo or Claude Desktop for the changes to take effect.
echo.
echo To verify your setup, you can check the environment variables:
echo - echo %%GITHUB_PERSONAL_ACCESS_TOKEN%%
echo - echo %%BRAVE_API_KEY%%
echo - echo %%VERCEL_TOKEN%%
echo.
pause