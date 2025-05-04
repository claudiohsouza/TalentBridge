@echo off
echo ====================================================
echo            INICIANDO TALENTBRIDGE
echo ====================================================

echo Parando processos existentes...
taskkill /F /IM node.exe >nul 2>&1

echo Limpando o cache...
rmdir /s /q frontend\node_modules\.cache 2>nul

echo Verificando conexão com PostgreSQL...
set PGPASSWORD=1234
psql -U postgres -h localhost -p 5432 -c "SELECT 'Conexão com PostgreSQL OK' AS status;" 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ERRO: Não foi possível conectar ao PostgreSQL!
  echo Verifique se o PostgreSQL está rodando e se as credenciais estão corretas.
  echo.
  echo Pressione qualquer tecla para sair...
  pause > nul
  exit /b 1
)

echo Checando se o banco de dados Data1 existe...
psql -U postgres -h localhost -p 5432 -c "SELECT 'Banco de dados Data1 existe' FROM pg_database WHERE datname='Data1';" 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo AVISO: Criando banco de dados Data1...
  psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE Data1;" 2>nul
)

echo Iniciando backend...
start cmd /k "cd backend && npm start"

echo Aguardando 5 segundos para o backend iniciar...
timeout /t 5 /nobreak >nul

echo Iniciando frontend...
start cmd /k "cd frontend && npm start"

echo ====================================================
echo           APLICAÇÃO INICIADA
echo
echo * Backend:  http://localhost:5000
echo * Frontend: http://localhost:3000
echo
echo * Credenciais de teste:
echo * Email: univ.federal@exemplo.com
echo * Senha: senha123
echo ====================================================

pause 