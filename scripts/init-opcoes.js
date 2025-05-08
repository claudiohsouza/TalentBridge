import nodeFetch from 'node-fetch';
const fetch = nodeFetch.default || nodeFetch;
import dotenv from 'dotenv';
import { createInterface } from 'readline';

// Carregar variáveis de ambiente
dotenv.config();

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para perguntar ao usuário
const question = (query) => new Promise((resolve) => readline.question(query, resolve));

// URL base da API
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Função principal
async function main() {
  try {
    console.log('=== Inicialização da tabela de opções do sistema ===');
    
    // Solicitar credenciais de administrador
    const email = await question('Email de administrador: ');
    const senha = await question('Senha: ');
    
    // Login para obter token
    console.log('\nAutenticando...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Falha na autenticação: ${error.message || 'Credenciais inválidas'}`);
    }
    
    const { token } = await loginResponse.json();
    console.log('Autenticação bem-sucedida!\n');
    
    // Perguntar sobre limpar dados existentes
    const limpar = await question('Limpar dados existentes? (s/N): ');
    const shouldClear = limpar.toLowerCase() === 's';
    
    // Inicializar opções
    console.log(`\nInicializando opções do sistema${shouldClear ? ' (limpando dados existentes)' : ''}...`);
    const initResponse = await fetch(`${BASE_URL}/api/opcoes/init`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ limpar: shouldClear })
    });
    
    if (!initResponse.ok) {
      const error = await initResponse.json();
      throw new Error(`Falha na inicialização: ${error.message || 'Erro desconhecido'}`);
    }
    
    const result = await initResponse.json();
    console.log(`\nSucesso! ${result.count} opções foram configuradas no sistema.`);
    console.log(`\nMensagem: ${result.message}`);
    
  } catch (error) {
    console.error(`\nErro: ${error.message}`);
  } finally {
    readline.close();
  }
}

// Executar script
main(); 