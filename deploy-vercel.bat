@echo off
title Deploy ScreenMate AI to Vercel
echo ========================================================
echo   Deploying ScreenMate AI (Frontend + Backend) to Vercel
echo ========================================================
echo.
echo If this is your first time, it will open your browser to login.
echo Press Enter on all prompts to use default settings.
echo.
npx vercel --prod
echo.
pause
