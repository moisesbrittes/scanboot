# 🖨️ Scanner OCR System

**Sistema completo de escaneamento e reconhecimento óptico de caracteres (OCR)**

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-darkgreen)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Sobre

Sistema de digitalização de documentos com OCR automático, integrado com:
- 🗄️ **Banco de Dados**: Supabase PostgreSQL
- 🖼️ **Storage**: Supabase Cloud Storage
- 🧠 **OCR**: Tesseract.js (local) + Google Vision (opcional)
- 💬 **Comunicação**: WhatsApp (Twilio) + Email (Gmail SMTP)
- ⚡ **Real-time**: WebSocket nativo

---

## ✨ Funcionalidades

### 📤 Upload & OCR
- Upload de imagens (JPG, PNG, TIFF, PDF)
- OCR automático em português e inglês
- Detecção automática de confiança
- Compressão e thumbnails automáticas

### 📋 Gerenciamento
- Lista de documentos com busca
- Grid responsivo com preview
- Paginação automática
- Filtros por confiança OCR

### 👁️ Visualização
- Imagem em tamanho completo
- Texto OCR completo
- Metadados (DPI, tamanho, data, confiança)
- Histórico de compartilhamentos

### 📧 Compartilhamento
- Envio por email
- Compartilhamento via WhatsApp
- Histórico de envios
- Status de entrega

### 🔄 Real-time
- WebSocket para atualizações ao vivo
- Notificações de processamento
- Status do scanner

---

## 🚀 Quick Start

### 1. Clonar/Baixar
```bash
git clone https://github.com/seu-usuario/scanboot.git
cd scanboot
```

### 2. Instalar
```bash
npm install
```

### 3. Configurar
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 4. Rodar
```bash
npm run dev
```

Acesse: **http://localhost:3002**

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=eyJhbGc...

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=ACxx...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+55...

# Gmail SMTP
SMTP_USER=seu@gmail.com
SMTP_PASS=seu_app_password

# Server
PORT=3002
NODE_ENV=development
```

### Obter Credenciais

**Supabase:**
1. https://app.supabase.com
2. Criar projeto
3. Copiar URL e chave anon

**Twilio:**
1. https://www.twilio.com
2. Messaging → WhatsApp
3. Copiar SID, Token, Número

**Gmail:**
1. https://myaccount.google.com/security
2. App passwords (2FA necessário)
3. Gerar senha para Gmail

---

## 📁 Estrutura

```
scanboot/
├── server.js                 # Backend Express
├── App.jsx                  # Frontend React
├── App.css                  # Estilos
├── index.html               # Página de teste
├── package.json             # Dependências
├── .env                     # Variáveis (não commitar)
├── .env.example             # Exemplo
├── Dockerfile               # Para Docker
├── docker-compose.yml       # Compose
├── DEPLOY_GUIDE.md          # Guia de deployment
├── MIGRATION_SUPABASE.md    # Histórico migração
└── scans/                   # Armazenamento local
    ├── temp/                # Uploads temporários
    ├── storage/             # Imagens processadas
    └── thumbs/              # Miniaturas
```

---

## 🔌 API Endpoints

### Documentos
```bash
GET    /api/documents              # Listar com filtros
GET    /api/documents/:id          # Detalhes
POST   /api/documents/upload-process  # Upload + OCR
DELETE /api/documents/:id          # Deletar
```

### Scanner
```bash
POST   /api/scan/start             # Iniciar escaneamento
POST   /api/scan/stop              # Parar
GET    /api/scan/status            # Status
```

### Compartilhamento
```bash
POST   /api/documents/:id/share-email    # Email
POST   /api/documents/:id/share-whatsapp # WhatsApp
```

### Health
```bash
GET    /api/health                 # Status do servidor
```

---

## 🧪 Testes

### Via cURL
```bash
# Listar documentos
curl http://localhost:3002/api/documents

# Upload + OCR
curl -X POST http://localhost:3002/api/documents/upload-process \
  -F "file=@imagem.jpg" \
  -F "dpi=300"

# Compartilhar por email
curl -X POST http://localhost:3002/api/documents/DOC_ID/share-email \
  -H "Content-Type: application/json" \
  -d '{"recipient":"user@example.com"}'
```

### Via Interface Web
```
http://localhost:3002/index.html
```

---

## 🐳 Docker

### Build
```bash
docker build -t scanboot:latest .
```

### Run
```bash
docker run -p 3002:3002 \
  -e SUPABASE_URL=... \
  -e SUPABASE_KEY=... \
  scanboot:latest
```

### Docker Compose
```bash
docker-compose up -d
```

---

## 📦 Deployment

### Railway (Recomendado)
```bash
# 1. Push para GitHub
git push origin main

# 2. Conectar em railway.app
# 3. Configurar variáveis
# Deploy automático ✅
```

### Vercel (Frontend)
```bash
vercel --prod
```

### Heroku
```bash
heroku create scanboot-app
git push heroku main
```

Ver: [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)

---

## 🔒 Segurança

✅ **Implementado:**
- HTTPS em produção (automático em plataformas)
- CORS configurado
- Rate limiting disponível
- Validação de arquivo
- Variáveis de ambiente seguras

⚠️ **Recomendado:**
- Ativar autenticação de usuários
- Adicionar RLS (Row Level Security)
- Configurar backup automático
- Monitorar logs
- Usar HTTPS obrigatório

---

## 📊 Tecnologias

### Backend
- **Node.js** 20 - Runtime
- **Express.js** - Web framework
- **Supabase** - Database + Storage
- **Tesseract.js** - OCR local
- **Sharp** - Image processing
- **Twilio** - SMS/WhatsApp
- **Nodemailer** - Email
- **WebSocket** - Real-time

### Frontend
- **React** 18 - UI Framework
- **CSS3** - Estilos
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerização
- **Railway** - Cloud deployment
- **Vercel** - Frontend hosting

---

## 📈 Performance

| Operação | Tempo |
|----------|-------|
| Upload | ~2s |
| OCR (Tesseract) | ~3s |
| Compressão | ~1s |
| Salvamento BD | ~0.5s |
| Busca | <200ms |
| **Total** | **~6-10s** |

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
```bash
# Verificar credenciais
echo $SUPABASE_URL
echo $SUPABASE_KEY

# Testar conexão
curl https://seu-projeto.supabase.co
```

### "Tesseract not found"
```bash
# Windows: npm install tesseract.js
# Mac: brew install tesseract
# Linux: apt install tesseract-ocr
```

### "Port 3002 in use"
```bash
# Windows
netstat -ano | find "3002"
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3002
kill -9 <PID>
```

---

## 📝 Licença

MIT License - veja [LICENSE](LICENSE)

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

- 📖 Documentação: [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)
- 🐛 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions

---

## 🎯 Roadmap

- [ ] Autenticação de usuários
- [ ] Multi-idioma
- [ ] Dark mode
- [ ] Exportar PDF/Excel
- [ ] Integração com Google Drive
- [ ] Análise de documentos
- [ ] Machine Learning para classificação

---

## 🙏 Agradecimentos

- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [Supabase](https://supabase.com)
- [Express.js](https://expressjs.com)
- [React](https://react.dev)

---

**Sistema pronto para produção! 🚀**

Últimas atualizações: 13/05/2026
