# Sistema de Escaneamento com OCR - Scanner Kodak i1120

## 📋 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICAÇÃO FRONTEND (React)                │
│         - Consulta de documentos                              │
│         - Visualização de imagens                             │
│         - Envio WhatsApp/Email                                │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────────────────┐
│                  API BACKEND (Node.js)                       │
│         - Gerenciar scans                                     │
│         - Controlar OCR em tempo real                        │
│         - Salvar documentos                                   │
│         - Enviar WhatsApp/Email                              │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
┌───▼───┐   ┌────▼────┐  ┌───▼────┐  ┌─────▼──────┐
│Scanner│   │  OCR    │  │Database│  │ Integrações│
│Kodak  │   │Tesseract│  │SQLite/ │  │ WhatsApp   │
│i1120  │   │ou Google│  │MongoDB │  │ Email (SMTP)
└───────┘   │ Vision  │  └────────┘  │ ngrok      │
            │ API     │              └────────────┘
            └─────────┘
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js + Express** - API REST
- **node-twain** ou **scansnap** - Integração scanner
- **tesseract.js** - OCR local (rápido)
- **sharp** - Processamento de imagens
- **mongoose/sqlite** - Banco de dados
- **twilio** - WhatsApp
- **nodemailer** - Email

### Frontend
- **React** - Interface
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Query** - Cache e sincronização
- **Tailwind CSS** - Styling

## 📦 Instalação

### 1. Backend Setup

```bash
mkdir scanner-ocr-system
cd scanner-ocr-system
npm init -y

# Dependências principais
npm install express cors axios multer sharp tesseract.js mongoose dotenv
npm install twilio nodemailer
npm install --save-dev nodemon

# Para scanner Kodak (Windows/macOS)
npm install node-twain  # ou scansnap-sdk-js
```

### 2. Variáveis de Ambiente (.env)

```env
# Scanner
SCANNER_DEVICE_ID=kodak-i1120
SCANNER_DPI=300
SCANNER_COLOR_MODE=24bit

# OCR
OCR_LANGUAGE=por,eng
OCR_FIELD_REGION=top-left:100x50:500x150

# Banco de dados
DB_URI=mongodb://localhost/scanner-docs
# ou para SQLite: DB_PATH=./docs.db

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=+55xxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+55xxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# API
PORT=3001
NODE_ENV=development
```

## 🔧 Fluxo de Processamento

1. **Scan** → Imagem TIF/PDF do scanner
2. **Pre-processar** → Ajustar contraste, rotação, crop
3. **OCR Campo** → Ler apenas região pré-definida
4. **Nomear arquivo** → Usar texto OCR como nome
5. **Salvar** → Storage local + BD com metadados
6. **Indexar** → Disponibilizar para consulta
7. **Compartilhar** → WhatsApp/Email sob demanda

## 📊 Modelo de Dados

```javascript
{
  _id: ObjectId,
  filename: "DOC-123456-2024",  // gerado do OCR
  originalName: "scan_001.tif",
  scanDate: 2024-05-12T10:30:00Z,
  ocrText: "DOC-123456",
  ocrConfidence: 0.98,
  ocrRegion: {
    x: 100,
    y: 50,
    width: 500,
    height: 150
  },
  imagePath: "/scans/storage/DOC-123456-2024.jpg",
  fileSize: 524288,
  dpi: 300,
  colorMode: "24bit",
  status: "completed", // scanning, processing, completed, error
  errorMsg: null,
  sharedWith: [
    { type: "email", recipient: "user@example.com", sharedAt: ... },
    { type: "whatsapp", recipient: "+5511999...", sharedAt: ... }
  ]
}
```

## 🚀 Próximas Seções

- Backend Server Setup
- Frontend React Setup
- Integração Scanner
- Processamento OCR
- Consulta e Compartilhamento
- Deploy
