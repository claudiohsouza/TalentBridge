@echo off
setlocal EnableDelayedExpansion

echo ====================================================
echo            INICIANDO TALENTBRIDGE
echo ====================================================

REM Definir cores para o terminal
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%Verificando dependências...%RESET%

REM Verificar se o Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo %RED%ERRO: Node.js não encontrado!%RESET%
  echo Instale o Node.js de https://nodejs.org/ e tente novamente.
  echo.
  goto :error
)

REM Verificar se o PostgreSQL está instalado
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo %RED%ERRO: PostgreSQL não encontrado!%RESET%
  echo Instale o PostgreSQL de https://www.postgresql.org/ e tente novamente.
  echo.
  goto :error
)

echo %YELLOW%Parando processos existentes...%RESET%
taskkill /F /IM node.exe >nul 2>&1

echo %YELLOW%Limpando o cache...%RESET%
if exist frontend\node_modules\.cache (
  rmdir /s /q frontend\node_modules\.cache 2>nul
)

REM Verificar se as dependências do projeto estão instaladas
if not exist frontend\node_modules (
  echo %YELLOW%Instalando dependências do frontend...%RESET%
  cd frontend
  call npm install
  cd ..
)

if not exist backend\node_modules (
  echo %YELLOW%Instalando dependências do backend...%RESET%
  cd backend
  call npm install
  cd ..
)

echo %BLUE%Verificando conexão com PostgreSQL...%RESET%
set PGPASSWORD=1234
psql -U postgres -h localhost -p 5432 -c "SELECT 'Conexão com PostgreSQL OK' AS status;" 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo %RED%ERRO: Não foi possível conectar ao PostgreSQL!%RESET%
  echo Verifique se o PostgreSQL está rodando e se as credenciais estão corretas.
  echo.
  goto :error
)

echo %BLUE%Checando se o banco de dados Data1 existe...%RESET%
psql -U postgres -h localhost -p 5432 -c "SELECT datname FROM pg_database WHERE datname='Data1';" | findstr "Data1" >nul
if %ERRORLEVEL% NEQ 0 (
  echo %YELLOW%AVISO: Criando banco de dados Data1...%RESET%
  psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE \"Data1\";" 2>nul
  if %ERRORLEVEL% NEQ 0 (
    echo %RED%ERRO: Falha ao criar o banco de dados Data1!%RESET%
    goto :error
  )
)

echo %GREEN%Iniciando backend...%RESET%
start cmd /k "title TalentBridge - Backend & cd backend & color 0B & echo Iniciando servidor backend... & npm start"

echo %YELLOW%Aguardando o backend iniciar...%RESET%
timeout /t 5 /nobreak >nul

REM Verificar se o backend está online
curl http://localhost:5000/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo %YELLOW%AVISO: Backend ainda não está pronto. Aguardando mais 5 segundos...%RESET%
  timeout /t 5 /nobreak >nul
)

echo %GREEN%Iniciando frontend...%RESET%
start cmd /k "title TalentBridge - Frontend & cd frontend & color 09 & echo Iniciando aplicação frontend... & npm start"

echo.
echo %GREEN%====================================================
echo           APLICAÇÃO INICIADA
echo ====================================================%RESET%
echo.
echo * Backend:  %BLUE%http://localhost:5000%RESET%
echo * Frontend: %BLUE%http://localhost:3000%RESET%
echo.
echo * %YELLOW%Credenciais de teste:%RESET%
echo * Email: univ.federal@exemplo.com
echo * Senha: senha123
echo.
echo %GREEN%====================================================%RESET%
echo Pressione qualquer tecla para encerrar os processos...
pause > nul

echo %YELLOW%Encerrando aplicação...%RESET%
taskkill /F /IM node.exe >nul 2>&1
echo %GREEN%Aplicação encerrada com sucesso!%RESET%
goto :eof

:error
echo.
echo %RED%Inicialização interrompida devido a erro(s).%RESET%
echo Pressione qualquer tecla para sair...
pause > nul
exit /b 1 