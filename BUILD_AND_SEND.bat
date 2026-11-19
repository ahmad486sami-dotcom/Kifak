@echo off
REM Builds Kifak for iPhone on EAS and sends it to TestFlight.
cd /d "%~dp0"
call npx eas-cli build -p ios --profile production --auto-submit
pause
