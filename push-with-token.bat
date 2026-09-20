@echo off
title Push ScreenMate AI to GitHub
echo ========================================================
echo   Push ScreenMate AI to GitHub
echo   Account: ashutoshmishra31004-cell
echo   Repository: screenmate-ai
echo ========================================================
echo.
set /p TOKEN="Paste your GitHub Token (ghp_...): "
if "%TOKEN%"=="" (
    echo No token entered.
    pause
    exit /b
)

echo Pushing code to GitHub...
"C:\Users\ASUS\AppData\Local\Programs\Git\cmd\git.exe" remote set-url origin https://%TOKEN%@github.com/ashutoshmishra31004-cell/screenmate-ai.git
"C:\Users\ASUS\AppData\Local\Programs\Git\cmd\git.exe" push -u origin main
"C:\Users\ASUS\AppData\Local\Programs\Git\cmd\git.exe" remote set-url origin https://github.com/ashutoshmishra31004-cell/screenmate-ai.git

echo.
echo ========================================================
echo   SUCCESS! Repository is live at:
echo   https://github.com/ashutoshmishra31004-cell/screenmate-ai
echo ========================================================
echo.
pause
