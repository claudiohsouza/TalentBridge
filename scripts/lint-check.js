/**
 * Script para verificação de linting e padrões de código
 * 
 * Este script ajuda a identificar problemas comuns de qualidade de código
 * e inconsistências no projeto TalentBridge.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Configurações
const config = {
  backendDir: path.join(__dirname, '..', 'backend'),
  frontendDir: path.join(__dirname, '..', 'frontend'),
  ignoreDirs: ['node_modules', '.vercel', 'build', 'dist', '.git'],
  fileExtensions: {
    backend: ['.js'],
    frontend: ['.tsx', '.ts', '.js', '.jsx']
  }
};

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Função para percorrer diretórios recursivamente
 */
function walkDir(dir, callback, ignoreDirs = []) {
  if (ignoreDirs.some(ignoreDir => dir.includes(ignoreDir))) {
    return;
  }

  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    
    if (isDirectory) {
      walkDir(dirPath, callback, ignoreDirs);
    } else {
      callback(path.join(dir, f));
    }
  });
}

/**
 * Verificar erros comuns em arquivos
 */
function checkFileForErrors(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    patterns.forEach(pattern => {
      if (pattern.regex.test(content)) {
        issues.push({
          type: pattern.type,
          message: pattern.message,
          severity: pattern.severity
        });
      }
    });

    return issues;
  } catch (error) {
    return [{
      type: 'error',
      message: `Erro ao ler arquivo: ${error.message}`,
      severity: 'high'
    }];
  }
}

/**
 * Padrões de problemas a serem verificados
 */
const errorPatterns = {
  backend: [
    {
      regex: /console\.log\(/g,
      type: 'logging',
      message: 'Use logger em vez de console.log',
      severity: 'medium'
    },
    {
      regex: /throw new \w+Error\([^)]*\);(?!\s*next)/g,
      type: 'error-handling',
      message: 'Use next(error) em vez de throw em rotas Express',
      severity: 'high'
    },
    {
      regex: /app\.use\(\s*\([^)]*\)\s*=>\s*{[^}]*res\.status\(\d+\)\.send/g,
      type: 'error-handling',
      message: 'Use middleware de erro centralizado',
      severity: 'medium'
    },
    {
      regex: /req\.body\.\w+(?!\s*=)/g,
      type: 'validation',
      message: 'Considere validar req.body antes de usar',
      severity: 'medium'
    },
    {
      regex: /db\.query\([^,]*,[^)]*\)/g,
      type: 'security',
      message: 'Verifique queries SQL para evitar injeção',
      severity: 'high'
    }
  ],
  frontend: [
    {
      regex: /useState\(<[^>]*>\)/g,
      type: 'typescript',
      message: 'Defina tipo explícito para useState',
      severity: 'low'
    },
    {
      regex: /any(?!\s*=>)/g,
      type: 'typescript',
      message: 'Evite usar tipo any',
      severity: 'medium'
    },
    {
      regex: /console\.log\(/g,
      type: 'development',
      message: 'Remova console.log em código de produção',
      severity: 'low'
    },
    {
      regex: /useEffect\([^,]*,\s*\[\s*\]\)/g,
      type: 'react',
      message: 'Verifique efeitos com array de dependências vazio',
      severity: 'medium'
    },
    {
      regex: /fetch\(/g,
      type: 'architecture',
      message: 'Use serviços centralizados para chamadas API',
      severity: 'low'
    },
    {
      regex: /\btry\s*{[^}]*}\s*catch\s*\([^)]*\)\s*{[^}]*}/g,
      type: 'error-handling',
      message: 'Verifique tratamento de erros',
      severity: 'medium'
    }
  ]
};

/**
 * Função principal
 */
async function main() {
  console.log(`${colors.cyan}======================================`);
  console.log(`TalentBridge - Verificação de Código`);
  console.log(`======================================${colors.reset}\n`);

  // Resultados
  const results = {
    backend: { total: 0, issues: [] },
    frontend: { total: 0, issues: [] }
  };

  // Verificar Backend
  console.log(`${colors.magenta}Verificando código Backend...${colors.reset}`);
  walkDir(
    config.backendDir,
    (filePath) => {
      const ext = path.extname(filePath);
      if (config.fileExtensions.backend.includes(ext)) {
        results.backend.total++;
        
        const issues = checkFileForErrors(filePath, errorPatterns.backend);
        if (issues.length > 0) {
          const relativePath = path.relative(config.backendDir, filePath);
          results.backend.issues.push({
            file: relativePath,
            issues: issues
          });
        }
      }
    },
    config.ignoreDirs
  );

  // Verificar Frontend
  console.log(`${colors.magenta}Verificando código Frontend...${colors.reset}`);
  walkDir(
    config.frontendDir,
    (filePath) => {
      const ext = path.extname(filePath);
      if (config.fileExtensions.frontend.includes(ext)) {
        results.frontend.total++;
        
        const issues = checkFileForErrors(filePath, errorPatterns.frontend);
        if (issues.length > 0) {
          const relativePath = path.relative(config.frontendDir, filePath);
          results.frontend.issues.push({
            file: relativePath,
            issues: issues
          });
        }
      }
    },
    config.ignoreDirs
  );

  // Relatório
  console.log(`\n${colors.cyan}======================================`);
  console.log(`Relatório de Verificação`);
  console.log(`======================================${colors.reset}\n`);

  // Backend
  console.log(`${colors.blue}Backend${colors.reset}`);
  console.log(`- Arquivos verificados: ${results.backend.total}`);
  console.log(`- Arquivos com problemas: ${results.backend.issues.length}`);
  
  if (results.backend.issues.length > 0) {
    results.backend.issues.forEach(file => {
      console.log(`\n${colors.yellow}${file.file}${colors.reset}`);
      file.issues.forEach(issue => {
        const color = issue.severity === 'high' ? colors.red : 
                    (issue.severity === 'medium' ? colors.yellow : colors.white);
        console.log(`  ${color}[${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}${colors.reset}`);
      });
    });
  } else {
    console.log(`${colors.green}Nenhum problema encontrado!${colors.reset}`);
  }

  // Frontend
  console.log(`\n${colors.blue}Frontend${colors.reset}`);
  console.log(`- Arquivos verificados: ${results.frontend.total}`);
  console.log(`- Arquivos com problemas: ${results.frontend.issues.length}`);
  
  if (results.frontend.issues.length > 0) {
    results.frontend.issues.forEach(file => {
      console.log(`\n${colors.yellow}${file.file}${colors.reset}`);
      file.issues.forEach(issue => {
        const color = issue.severity === 'high' ? colors.red : 
                    (issue.severity === 'medium' ? colors.yellow : colors.white);
        console.log(`  ${color}[${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}${colors.reset}`);
      });
    });
  } else {
    console.log(`${colors.green}Nenhum problema encontrado!${colors.reset}`);
  }

  // Resumo
  const totalIssues = results.backend.issues.length + results.frontend.issues.length;
  console.log(`\n${colors.cyan}======================================`);
  console.log(`Resumo:`);
  console.log(`- Total de arquivos: ${results.backend.total + results.frontend.total}`);
  console.log(`- Total de arquivos com problemas: ${totalIssues}`);
  console.log(`======================================${colors.reset}\n`);

  if (totalIssues > 0) {
    console.log(`${colors.yellow}Execute as correções recomendadas para melhorar a qualidade do código.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}Parabéns! Nenhum problema crítico encontrado no código.${colors.reset}\n`);
  }
}

// Executar script
main().catch(error => {
  console.error(`${colors.red}Erro ao executar script:${colors.reset}`, error);
  process.exit(1);
}); 