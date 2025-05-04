@echo off
echo Reiniciando o TalentBridge (backend e frontend)...

echo Parando processos existentes...
taskkill /F /IM node.exe >nul 2>&1

echo Reiniciando backend...
start cmd /k "cd backend && npm install && npm start"

echo Reiniciando frontend...
start cmd /k "cd frontend && npm install && npm start"

echo.
echo Aplicação reiniciada! Por favor aguarde alguns segundos para que os serviços iniciem completamente.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause 