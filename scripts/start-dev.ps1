Write-Host "Iniciando TalentBridge em modo desenvolvimento..." -ForegroundColor Green

# Cria tarefa em segundo plano para o backend
$jobBackend = Start-Job -ScriptBlock {
    Set-Location $using:PWD/backend
    npm start
}

# Aguarda um pouco para garantir que o backend iniciou primeiro
Start-Sleep -Seconds 3

# Cria tarefa em segundo plano para o frontend 
$jobFrontend = Start-Job -ScriptBlock {
    Set-Location $using:PWD/frontend
    npm start
}

Write-Host "Servidores iniciados em segundo plano!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Pressione CTRL+C para parar os servidores..." -ForegroundColor Yellow

# Monitora os jobs
try {
    while ($true) {
        Receive-Job -Job $jobBackend
        Receive-Job -Job $jobFrontend
        Start-Sleep -Seconds 1
    }
} 
finally {
    # Limpa os jobs quando o script é interrompido
    Stop-Job -Job $jobBackend, $jobFrontend
    Remove-Job -Job $jobBackend, $jobFrontend -Force
    Write-Host "Servidores parados." -ForegroundColor Red
} 