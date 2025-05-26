# TalentBridge

TalentBridge é uma plataforma dedicada a conectar jovens talentos com oportunidades de emprego, estágio e capacitação. O sistema oferece uma interface integrada para instituições de ensino, empresas e instituições contratantes colaborarem no desenvolvimento profissional de jovens.

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js com Express
- PostgreSQL
- JWT para autenticação
- Winston para logging
- Joi para validação de dados

### Frontend
- React com TypeScript
- React Router para navegação
- Context API para gerenciamento de estado
- TailwindCSS para estilização
- Axios para requisições HTTP

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- PostgreSQL 14.x ou superior
- npm 8.x ou superior

## 🔧 Instalação e Configuração

### Banco de Dados
1. Instale o PostgreSQL e crie um banco de dados chamado `Data1`

### Backend
1. Navegue até o diretório `backend`:
   ```
   cd backend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configuração do ambiente:
   O projeto já contém um arquivo `.env` para desenvolvimento. Para produção, você deve criar seu próprio arquivo com configurações seguras:
   ```
   # Configurações do Banco de Dados
   DB_USER=postgres
   DB_PASSWORD=suasenhasegura
   DB_HOST=localhost
   DB_NAME=Data1
   DB_PORT=5432

   # Configurações do Servidor
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://seu-dominio.com

   # Configurações de Segurança
   JWT_SECRET=sua_chave_secreta_de_producao_deve_ser_longa_e_aleatoria

   # Configurações de Taxa de Limite (Rate Limiting)
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
   RATE_LIMIT_MAX=100

   # Configurações de Log
   LOG_LEVEL=info
   ```

4. Inicie o servidor:
   ```
   npm start
   ```
   Para desenvolvimento com reload automático:
   ```
   npm run dev
   ```

5. Depois que o servidor estiver rodando, inicialize o banco de dados com as opções padrão:
   ```
   npm run init-opcoes
   ```
   Nota: É importante que o servidor esteja em execução antes de executar este script, pois ele se comunica com a API do servidor.

### Frontend
1. Navegue até o diretório `frontend`:
   ```
   cd frontend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```
   npm start
   ```

### Inicialização Rápida (Windows)
Use o script `start-dev.ps1` no diretório `scripts` para iniciar tanto o backend quanto o frontend em uma única etapa:
```
.\scripts\start-dev.ps1
```

## 📦 Estrutura do Projeto

### Backend
- `server.js`: Ponto de entrada da aplicação
- `routes/`: Rotas da API
- `middleware/`: Middlewares Express
- `controllers/`: Lógica de negócios
- `models/`: Modelos de dados
- `db/`: Configurações de banco de dados

### Frontend
- `src/components/`: Componentes React reutilizáveis
- `src/pages/`: Páginas da aplicação
- `src/contexts/`: Contextos para gerenciamento de estado (AuthContext, etc.)
- `src/services/`: Serviços para chamadas de API
- `src/types/`: Definições de tipos TypeScript
- `src/utils/`: Funções utilitárias

## 🎨 Sistema de Design

O frontend utiliza um sistema de design consistente baseado em TailwindCSS:

- Classes de botões: `btn-primary`, `btn-secondary`
- Classes de entrada: `input-field`
- Classes de cartão: `card`
- Animações: `animate-fade-in`, `animate-slide-up`, `animate-slide-down`
- Loading spinner: `loading-spinner`

## 👥 Papéis e Permissões

O sistema possui quatro tipos principais de usuários:

1. **Instituição de Ensino**: Gerencia jovens e visualiza oportunidades
2. **Chefe de Empresa**: Administra jovens dentro da empresa
3. **Instituição Contratante**: Cria e gerencia oportunidades

## 🔐 Autenticação e Segurança

O sistema utiliza:
- JWT (JSON Web Tokens) para autenticação
- Senhas criptografadas com bcrypt
- Rate limiting para prevenção de ataques
- Proteção contra ataques comuns usando helmet

## 📫 Contribuição

1. Faça um fork do projeto
2. Crie sua branch de feature: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📚 Scripts Utilitários

### Scripts de Inicialização
- `init-opcoes.js`: Inicializa as opções do sistema com valores padrão (requer servidor em execução)
- `import-database.js`: Importa dados para o banco de dados

### Verificação de Código
Execute o script de verificação para identificar problemas comuns:
```
node scripts/lint-check.js
``` 