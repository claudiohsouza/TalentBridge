@echo off
echo Inicializando banco de dados PostgreSQL para TalentBridge...

REM Substitua estes valores se necessário
set PGUSER=postgres
set PGPASSWORD=1234

REM Cria o banco de dados Data1 se não existir
echo Criando banco de dados...
psql -c "CREATE DATABASE Data1;" -U %PGUSER%

REM Executa o script SQL de inicialização
echo Executando script de inicialização...
psql -d Data1 -U %PGUSER% -f backend/db/init.sql

echo Banco de dados inicializado com sucesso!
echo.
echo Agora você pode iniciar o backend com o comando start-backend.bat
echo e o frontend com o comando start-frontend.bat
echo.
pause 