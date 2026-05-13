# 🚀 GUIA DE INSTALAÇÃO - Sistema de Escaneamento OCR

## 📋 Requisitos

- **Node.js** v16+ (https://nodejs.org/)
- **MongoDB** (local ou Atlas) (https://www.mongodb.com/)
- **Windows 10+** ou **macOS** (para driver Kodak)
- **Git** (opcional, para versionamento)

## 1️⃣ SETUP BACKEND

### Passo 1.1: Criar pasta do projeto

```bash
mkdir scanner-ocr-system
cd scanner-ocr-system
```

### Passo 1.2: Inicializar Node.js

```bash
npm init -y
```

### Passo 1.3: Instalar dependências

```bash
npm install express cors axios multer sharp tesseract.js mongoose dotenv
npm install twilio nodemailer ws
npm install --save-dev nodemon
```

### Passo 1.4: Criar estrutura de pastas

```bash
mkdir scans
mkdir scans/temp
mkdir scans/storage
mkdir scans/thumbs
mkdir config
mkdir services
mkdir routes
mkdir models
```

### Passo 1.5: Arquivos principais

Copiar os seguintes arquivos para a pasta raiz:
- `server.js` (código do backend)
- `.env.example` → renomear para `.env`
- `package.json` (já fornecido)

### Passo 1.6: Configurar .env

```bash
cp .env.example .env
```

Editar `.env` com suas credenciais:

```env
# MongoDB
DB_URI=mongodb://localhost:27017/scanner-docs

# Twilio (obter em https://www.twilio.com)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+55xxxx

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_google

# Servidor
PORT=3001
NODE_ENV=development
```

### Passo 1.7: Testar backend

```bash
npm run dev
```

Você deve ver:
```
╔════════════════════════════════════════╗
║   Scanner OCR System Backend Started    ║
║   🖨️  Port: 3001                         ║
║   📊 WebSocket: ws://localhost:3001    ║
╚════════════════════════════════════════╝
```

---

## 2️⃣ SETUP FRONTEND

### Passo 2.1: Criar projeto React com Vite

```bash
cd ..
npm create vite@latest scanner-ocr-frontend -- --template react
cd scanner-ocr-frontend
npm install
```

### Passo 2.2: Instalar axios

```bash
npm install axios
```

### Passo 2.3: Copiar arquivos React

1. Copiar `App.jsx` para `src/App.jsx`
2. Copiar `App.css` para `src/App.css`
3. Atualizar `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Passo 2.4: Copiar vite.config.js

```bash
# Copiar vite.config.js para a raiz do frontend
```

### Passo 2.5: Criar .env

```bash
echo "REACT_APP_API_BASE=http://localhost:3001" > .env
```

### Passo 2.6: Testar frontend

```bash
npm run dev
```

Abrir `http://localhost:3000`

---

## 3️⃣ CONFIGURAR SCANNER KODAK i1120

### Windows

#### 3.1: Instalar SDK Kodak

1. Baixar de: https://www.kodak.com/en/en/consumer/support/
2. Executar instalador WinSCAN
3. Conectar scanner via USB

#### 3.2: Usar node-twain (Windows)

```bash
npm install node-twain
```

Código no `server.js` (já incluído):
```javascript
const twain = require('node-twain');
await twain.selectSource('Kodak i1120');
```

### macOS

#### 3.1: Usar Image Capture nativo ou...

#### 3.2: Instalar SANE

```bash
brew install sane-backends
```

### Alternativa: Usar Google Vision API (Cloud)

Para máxima compatibilidade, considere usar Google Vision API:

```bash
npm install @google-cloud/vision
```

```javascript
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient({
  keyFilename: './google-credentials.json'
});

const result = await client.documentTextDetection(imagePath);
```

---

## 4️⃣ CONFIGURAR TWILIO (WhatsApp)

### 4.1: Criar conta Twilio

1. Acesse https://www.twilio.com/
2. Crie uma conta gratuita
3. Vá para "Messaging" → "WhatsApp Sandbox"
4. Segue as instruções para ativar

### 4.2: Obter credenciais

No console Twilio:
- Account SID: copiar
- Auth Token: copiar
- Número WhatsApp: anotar

### 4.3: Atualizar .env

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999
```

### 4.4: Testar

```bash
curl -X POST http://localhost:3001/api/documents/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+5511999999999"}'
```

---

## 5️⃣ CONFIGURAR EMAIL (Gmail)

### 5.1: Habilitar App Password no Gmail

1. Acesse https://myaccount.google.com/security
2. Ative "2-Step Verification"
3. Vá para "App passwords"
4. Selecione "Mail" e "Windows Computer"
5. Copie a senha gerada

### 5.2: Atualizar .env

```env
SMTP_USER=seu_email@gmail.com
SMTP_PASS=senha_gerada_pelo_google
```

### 5.3: Testar

```bash
curl -X POST http://localhost:3001/api/documents/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "seu_email@gmail.com"}'
```

---

## 6️⃣ CONFIGURAR MONGODB

### Opção A: Local (desenvolvimento)

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows
# Baixe de: https://www.mongodb.com/try/download/community
# Instale e execute mongod.exe

# Verificar
mongo --version
```

### Opção B: MongoDB Atlas (produção)

1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta
3. Crie um cluster
4. Copie a string de conexão
5. Atualize `.env`:

```env
DB_URI=mongodb+srv://username:password@cluster0.mongodb.net/scanner-docs
```

---

## 7️⃣ TESTE COMPLETO

### Passo 1: Iniciar MongoDB

```bash
# Terminal 1
mongod
```

### Passo 2: Iniciar Backend

```bash
# Terminal 2
cd scanner-ocr-system
npm run dev
```

### Passo 3: Iniciar Frontend

```bash
# Terminal 3
cd scanner-ocr-frontend
npm run dev
```

### Passo 4: Testar com Upload

1. Abrir http://localhost:3000
2. Na seção "Upload Test", selecionar uma imagem JPG
3. Clicar "Fazer Upload + OCR"
4. Verificar resultado

---

## 8️⃣ DEPLOY

### Deploy Backend (Heroku, Railway, Replit)

#### Railway (recomendado)

```bash
# 1. Criar conta em railway.app
# 2. Conectar GitHub

# 3. Configurar env vars no dashboard
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SMTP_USER=...
SMTP_PASS=...
DB_URI=mongodb+srv://...

# 4. Deploy automático via GitHub
```

#### Vercel/Netlify (Frontend)

```bash
npm run build
# Fazer upload da pasta 'dist' para Vercel/Netlify
```

---

## 🐛 TROUBLESHOOTING

### Erro: "MongoDB connection failed"

```bash
# Verificar se MongoDB está rodando
mongod --version

# macOS: reinicar
brew services restart mongodb-community
```

### Erro: "Scanner not found"

```bash
# Verificar se scanner está conectado
# Windows: Dispositivos → Impressoras → Seu scanner

# Instalar drivers mais recentes
# Kodak: https://www.kodak.com/en/consumer/support/
```

### Erro: "Tesseract not found"

```bash
# Windows: npm install tesseract.js-core
# macOS: brew install tesseract
```

### Erro: "Twilio credentials invalid"

- Verificar se TWILIO_ACCOUNT_SID está correto
- Testar em https://www.twilio.com/console
- WhatsApp apenas funciona no Sandbox ou com número verificado

### Erro: "CORS error"

```javascript
// server.js já tem CORS habilitado, mas se precisar:
app.use(cors({
  origin: ['http://localhost:3000', 'https://seu-dominio.com']
}));
```

---

## 📱 USANDO O SISTEMA

### 1. Escanear Documentos

1. Conectar scanner Kodak i1120
2. Na página, clique em "▶️ Iniciar Scan"
3. Documentos serão lidos automaticamente
4. OCR será processado em campo pré-definido
5. Arquivo será nomeado automaticamente baseado no OCR

### 2. Consultar Documentos

1. Na lista, documentos aparecem com thumbnail
2. Buscar por OCR usando a barra de pesquisa
3. Clicar para ver documento em tamanho completo

### 3. Compartilhar

1. Abrir documento
2. Digitar email ou WhatsApp
3. Clique em "Enviar"
4. Documento será compartilhado automaticamente

---

## 🔐 SEGURANÇA

Para produção:

```env
# .env
NODE_ENV=production
API_KEY=sua_chave_secreta_aleatoria

# Adicionar autenticação
# npm install jsonwebtoken express-jwt

# Usar HTTPS
# npm install helmet

# Rate limiting
# npm install express-rate-limit
```

---

## 📊 ENDPOINTS API

```
GET    /api/documents              → Listar documentos
GET    /api/documents/:id          → Obter documento
POST   /api/documents/upload-process → Upload + OCR
POST   /api/documents/:id/share-email → Enviar por email
POST   /api/documents/:id/share-whatsapp → Enviar por WhatsApp
DELETE /api/documents/:id          → Deletar documento

POST   /api/scan/start             → Iniciar scan
POST   /api/scan/stop              → Parar scan
GET    /api/scan/status            → Status do scan

WS     ws://localhost:3001         → WebSocket tempo real
```

---

## 🎉 Sucesso!

Sistema completo e pronto para produção!

Para suporte, documentação oficial:
- Kodak i1120: https://www.kodak.com
- Tesseract: https://github.com/naptha/tesseract.js
- Twilio: https://www.twilio.com/docs
- MongoDB: https://docs.mongodb.com
