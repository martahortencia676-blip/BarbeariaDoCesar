# Como Executar o Projeto Localmente

## Pré-requisitos

Você precisa instalar o **Node.js** em seu computador.

### 1. Instalar Node.js

Acesse: https://nodejs.org/
- Baixe a versão **LTS (Long Term Support)** recomendada
- Execute o instalador e siga as instruções
- Reinicie seu computador após a instalação

### 2. Verificar Instalação

Abra o PowerShell ou Command Prompt e execute:
```bash
node --version
npm --version
```

Você deve ver versões do Node.js e npm.

## Executar o Projeto

### 1. Abra o terminal na pasta do projeto:
```bash
cd c:\Users\agils\BarbeariaDoCesar
```

### 2. Instale as dependências:
```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### 4. O navegador abrirá automaticamente em:
```
http://localhost:5173
```

## Comandos Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria versão otimizada para produção
- `npm run preview` - Visualiza a build de produção localmente

## Tecnologias Utilizadas

- **React 18** - Framework JavaScript
- **Vite** - Bundler e dev server
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones

## Troubleshooting

Se tiver problemas:

1. **"npm not found"** → Node.js não foi instalado corretamente
   - Reinstale o Node.js e reinicie o computador

2. **Porta 5173 já em uso** → A porta padrão está ocupada
   - Edite `vite.config.js` e altere a porta
   - Ou feche a aplicação que está usando a porta 5173

3. **node_modules não criada** → Rode `npm install` novamente
   - Delete `package-lock.json` se tiver
   - Execute `npm install` novamente

---

Após instalar Node.js, execute os comandos acima e a aplicação estará rodando!
