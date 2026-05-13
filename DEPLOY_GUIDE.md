# 🚀 Guia de Deployment - Scanner OCR System

## 📋 Pré-requisitos

- ✅ Projeto pronto em `C:\Users\grf\OneDrive\Documentos\scanboot`
- ✅ Node.js 16+ instalado
- ✅ Conta Supabase configurada
- ✅ Variáveis de ambiente (.env)

---

## 🐳 Opção 1: Docker (Recomendado)

### Build da Imagem
```bash
docker build -t scanboot:latest .
```

### Rodar Localmente
```bash
docker run -p 3002:3002 \
  -e SUPABASE_URL=https://... \
  -e SUPABASE_KEY=eyJhb... \
  -e TWILIO_ACCOUNT_SID=AC... \
  -e TWILIO_AUTH_TOKEN=... \
  -e TWILIO_WHATSAPP_NUMBER=whatsapp:+55... \
  -e SMTP_USER=seu@email.com \
  -e SMTP_PASS=sua_senha \
  scanboot:latest
```

### Ou com docker-compose
```bash
docker-compose up -d
```

---

## ☁️ Opção 2: Railway.app (Mais Fácil)

### 1. Criar Conta
```
https://railway.app
```

### 2. Conectar GitHub
- Fazer push do código para GitHub
- Railway detecta automaticamente

### 3. Configurar Variáveis
No dashboard Railway:
```
SUPABASE_URL = https://...
SUPABASE_KEY = eyJhb...
TWILIO_ACCOUNT_SID = AC...
TWILIO_AUTH_TOKEN = ...
TWILIO_WHATSAPP_NUMBER = whatsapp:+55...
SMTP_USER = seu@email.com
SMTP_PASS = sua_senha
PORT = 3002
NODE_ENV = production
```

### 4. Deploy
```bash
# Railway CLI (opcional)
railway up
```

---

## 🌐 Opção 3: Vercel (Para Frontend)

Se quiser separar frontend e backend:

### 1. Build Frontend
```bash
npm run build:frontend
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Atualizar API Base
Depois que Vercel der uma URL, atualizar `.env`:
```env
REACT_APP_API_BASE=https://seu-backend-url.railway.app
```

---

## 🚀 Opção 4: Heroku (Classic)

### 1. Login
```bash
heroku login
```

### 2. Criar App
```bash
heroku create scanboot-sistema
```

### 3. Configurar Variáveis
```bash
heroku config:set SUPABASE_URL=https://...
heroku config:set SUPABASE_KEY=eyJhb...
heroku config:set TWILIO_ACCOUNT_SID=AC...
# ... etc
```

### 4. Deploy
```bash
git push heroku main
```

---

## 🔑 Checklista de Variáveis de Ambiente

Antes de fazer deploy, certifique-se de ter:

```env
✅ SUPABASE_URL
✅ SUPABASE_KEY
✅ TWILIO_ACCOUNT_SID (opcional, mas necessário para WhatsApp)
✅ TWILIO_AUTH_TOKEN
✅ TWILIO_WHATSAPP_NUMBER
✅ SMTP_USER (Gmail)
✅ SMTP_PASS (App Password)
✅ PORT (padrão: 3002)
✅ NODE_ENV=production
```

---

## 📦 Build para Produção (Local)

### 1. Limpar
```bash
rm -rf node_modules
npm ci --only=production
```

### 2. Rodar em Produção
```bash
npm run prod
```

### 3. Verificar
```bash
curl http://localhost:3002/api/health
```

---

## 🔒 Segurança em Produção

### 1. HTTPS Obrigatório
- Railway: automático ✅
- Vercel: automático ✅
- Heroku: automático ✅

### 2. Rate Limiting
Adicionar em `server.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### 3. CORS Restritivo
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

### 4. Variáveis Sensíveis
- ❌ Nunca commit `.env`
- ✅ Use `.env.example` como template
- ✅ Configure variáveis no platform (Railway, Vercel, etc)

---

## 📊 Monitoramento

### Health Check
```bash
curl https://seu-url.app/api/health
```

### Logs
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Docker
docker logs scanboot-api
```

---

## 🆘 Troubleshooting

### "Port already in use"
```bash
lsof -i :3002
kill -9 <PID>
```

### "Cannot find Tesseract"
- Docker: instalado automaticamente
- VPS: `apt install tesseract-ocr`
- Mac: `brew install tesseract`

### "Supabase connection failed"
- Verificar SUPABASE_URL
- Verificar SUPABASE_KEY
- Verificar internet connection

### "Email não envia"
- Verificar SMTP_USER e SMTP_PASS
- Usar App Password (não senha comum)
- Gmail: https://myaccount.google.com/apppasswords

---

## 📈 Performance

### Otimizações Implementadas
✅ Compressão de imagens (Sharp)
✅ Thumbnails automáticas
✅ Índices no banco de dados
✅ CORS habilitado
✅ Multer com limite de upload
✅ WebSocket para real-time

### Cache
```javascript
app.use(express.static('public', {
  maxAge: '1d'
}));
```

---

## 🔄 Atualizações

### Deploy Nova Versão
```bash
# 1. Fazer push para GitHub
git add .
git commit -m "versão 1.1.0"
git push origin main

# 2. Railway fará deploy automático
# 3. Ou execute manualmente:
docker push seu-registro/scanboot:latest
```

---

## 📞 Suporte de Platforms

| Platform | Custo | Facilidade | Recomendado |
|----------|-------|-----------|-------------|
| **Railway** | $5-50/mês | ⭐⭐⭐⭐⭐ | ✅ SIM |
| **Vercel** | Grátis+ | ⭐⭐⭐⭐⭐ | Para Frontend |
| **Heroku** | $7+/mês | ⭐⭐⭐⭐ | Clássico |
| **Docker** | Seu servidor | ⭐⭐⭐ | Flexível |
| **AWS** | Variável | ⭐⭐ | Complexo |

---

## ✅ Checklist Final

Antes de publicar:

- [ ] `.env.production` configurado
- [ ] Testes passando
- [ ] Health check respondendo
- [ ] Supabase conectado
- [ ] Credenciais Twilio (se usar)
- [ ] Credenciais Gmail (se usar)
- [ ] HTTPS habilitado
- [ ] Rate limiting configurado
- [ ] Logs funcionando
- [ ] Backup do banco configurado

---

## 🎯 URL de Produção

Após deploy, sua API estará em:

```
https://seu-app.railway.app
https://seu-app.vercel.app
https://seu-app.herokuapp.com
```

**Atualizar** `.env` com:
```env
REACT_APP_API_BASE=https://seu-app.railway.app
```

---

**Sistema pronto para produção! 🚀**
