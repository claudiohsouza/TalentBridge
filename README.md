# TalentBridge

TalentBridge é uma aplicação web full-stack que conecta estudantes, instituições de ensino e empresas em um único ecossistema.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (v14 ou superior)

## Configuração do Banco de Dados

1. Instale o PostgreSQL no seu computador
2. Crie um banco de dados chamado `Data1`
3. Use as seguintes credenciais padrão (ou altere no arquivo backend/server.js):
   - Usuário: postgres
   - Senha: 1234
   - Host: localhost
   - Porta: 5432
   - Nome do banco: Data1

4. Para criar o esquema do banco de dados, execute o script SQL localizado em `backend/db/init.sql`

## Como Executar o Projeto

### Iniciando o Backend

**Windows:**
```
start-backend.bat
```

**Linux/Mac:**
```bash
cd backend
npm install
npm start
```

O servidor backend estará disponível em http://localhost:5000

### Iniciando o Frontend

**Windows:**
```
start-frontend.bat
```

**Linux/Mac:**
```bash
cd frontend
npm install
npm start
```

O aplicativo frontend estará disponível em http://localhost:3000

## Solução de Problemas

### Erro com bcrypt

Se você encontrar problemas com o módulo bcrypt, tente reinstalá-lo:

```bash
cd backend
npm uninstall bcrypt
npm install bcrypt
```

### Problema de Conexão com o Banco de Dados

Verifique se:
1. O PostgreSQL está instalado e em execução
2. As credenciais correspondem às usadas no servidor
3. O banco de dados 'Data1' existe

## Estrutura do Projeto

- **backend/**: Servidor Node.js com Express
  - **routes/**: Definições de rotas da API
  - **middleware/**: Middlewares (erro, autenticação, etc.)
  - **db/**: Scripts de banco de dados

- **frontend/**: Aplicação React com TypeScript
  - **src/components/**: Componentes React reutilizáveis
  - **src/pages/**: Páginas da aplicação
  - **src/services/**: Serviços de API e utilitários
  - **src/contexts/**: Contextos React para gerenciamento de estado

## Stack Tecnológica

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT

## Funcionalidades

- Autenticação JWT segura com controle de acesso baseado em papéis
- Dashboards separados para instituições e empresas
- Gerenciamento de perfis de estudantes com destaque para habilidades
- Design responsivo para todos os dispositivos
- Tratamento abrangente de erros e validação

## Esquema do Banco de Dados

A aplicação utiliza as seguintes tabelas principais:
- `usuarios`: Armazena contas de usuários (instituições e empresas)
- `estudantes`: Armazena perfis de estudantes criados pelas instituições

### Dados de Exemplo

O sistema vem com dados pré-carregados para facilitar os testes:

#### Usuários de Exemplo
- **Instituições**:
  - Email: univ.federal@exemplo.com, Senha: senha123
  - Email: faculdade.tech@exemplo.com, Senha: senha123
- **Empresas**:
  - Email: empresa.tecnologia@exemplo.com, Senha: senha123
  - Email: consultoria.dev@exemplo.com, Senha: senha123

#### Estudantes de Exemplo
Já existem diversos perfis de estudantes cadastrados com diferentes características:
- Estudantes com habilidades em tecnologias variadas (Java, Python, JavaScript, React, Flutter, etc.)
- Diferentes níveis de média acadêmica
- Perfis com diferentes níveis de estabilidade/estresse
- Planos futuros e objetivos profissionais diversos

## Rotas da API

### Autenticação
- `POST /api/auth/login`: Login de usuário
- `POST /api/auth/registro`: Registro de usuário
- `GET /api/auth/verify`: Verificar token de autenticação

### Usuários
- `GET /api/usuario/me`: Obter perfil do usuário atual
- `PUT /api/usuario/me`: Atualizar perfil do usuário

### Estudantes
- `GET /api/estudantes`: Listar estudantes
- `GET /api/estudantes/:id`: Obter um estudante específico
- `POST /api/estudantes`: Adicionar um novo estudante
- `PUT /api/estudantes/:id`: Atualizar um estudante
- `DELETE /api/estudantes/:id`: Excluir um estudante

## Implantação

A aplicação inclui um Dockerfile e docker-compose.yml para fácil implantação em vários ambientes. Para implantação em produção, certifique-se de:

1. Atualizar variáveis de ambiente com valores de produção
2. Configurar cabeçalhos de segurança apropriados
3. Configurar certificados SSL para HTTPS

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

## Licença

Este projeto está licenciado sob a Licença MIT. 