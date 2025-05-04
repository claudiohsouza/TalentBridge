@echo off
echo ************************************************************************
echo *          REINICIANDO TALENTBRIDGE EM MODO DEBUG                     *
echo ************************************************************************

echo Parando processos existentes...
taskkill /F /IM node.exe >nul 2>&1

echo Limpando o cache...
rmdir /s /q frontend\node_modules\.cache 2>nul

echo Verificando o banco de dados...
set PGPASSWORD=1234
psql -U postgres -c "SELECT 'Conexão com PostgreSQL OK' AS status;" -d Data1

echo Criando arquivo .env temporário com as configurações corretas...
(
echo FRONTEND_URL=http://localhost:3000
echo DB_USER=postgres
echo DB_PASSWORD=1234
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=Data1
echo JWT_SECRET=sua_chave_secreta
echo NODE_ENV=development
) > backend\.env.temp

echo Iniciando backend em modo DEBUG...
start cmd /k "cd backend && set DEBUG=* && set FRONTEND_URL=http://localhost:3000 && set DB_USER=postgres && set DB_PASSWORD=1234 && set DB_HOST=localhost && set DB_PORT=5432 && set DB_NAME=Data1 && set JWT_SECRET=sua_chave_secreta && npm start"

echo Aguardando 5 segundos para o backend iniciar...
timeout /t 5 /nobreak >nul

echo Iniciando frontend em modo DEBUG...
start cmd /k "cd frontend && set REACT_APP_API_URL=http://localhost:5000 && set REACT_APP_DEBUG=true && npm start"

echo.
echo ************************************************************************
echo *         APLICAÇÃO INICIADA EM MODO DEBUG                            *
echo *                                                                      *
echo * Backend: http://localhost:5000                                       *
echo * Frontend: http://localhost:3000                                      *
echo *                                                                      *
echo * Credenciais de teste:                                                *
echo * Email: univ.federal@exemplo.com                                      *
echo * Senha: senha123                                                      *
echo ************************************************************************
echo.
pause 