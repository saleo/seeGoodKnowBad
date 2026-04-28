# Toggle gh-proxy prefix for GitHub URLs
# Usage:
#   .\toggle-github-proxy.ps1 on   # Enable proxy
#   .\toggle-github-proxy.ps1 off  # Disable proxy

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('on', 'off')]
    [string]$Action
)

$proxyUrl = "http://gh-proxy.com/https://github.com/"
$gitConfig = "$env:USERPROFILE\.gitconfig"

if ($Action -eq 'on') {
    # Add proxy config
    git config --global url."$proxyUrl".insteadOf "https://github.com/"
    git config --global credential."https://gh-proxy.com".provider generic
    Write-Host "gh-proxy prefix ENABLED" -ForegroundColor Green
} else {
    # Remove proxy config
    git config --global url."http://gh-proxy.com/https://github.com/".insteadOf --unset
    git config --global credential."https://gh-proxy.com".provider --unset
    Write-Host "gh-proxy prefix DISABLED" -ForegroundColor Yellow
}