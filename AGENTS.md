# 🤖 AI Agent Guidelines for Scanner OCR System

## Language & Communication Style

### Primary Language: Portuguese + English Hybrid

This project uses **Portuguese for documentation and code comments**, but **English for technical terms and code structure**. Follow these patterns:

#### ✅ Do's:
- **Code comments**: Write in Portuguese with emoji section headers
  ```javascript
  // ==================== OCR PROCESSAMENTO ====================
  // Processa a imagem e extrai texto
  const text = await Tesseract.recognize(image);
  ```
- **Variable/function names**: Use **English** for technical/universal terms, **Portuguese** for domain logic
  ```javascript
  const UPLOAD_DIR = path.join(__dirname, 'scans', 'temp');
  const nomeDocumento = extractDocumentName(ocrText);
  ```
- **Configuration keys**: Use **PascalCase** (e.g., `BOLETO_CONFIG`, `CPF_RG_CONFIG`)
- **API/technical terms**: Keep in English (Express, MongoDB, WebSocket, API)
- **Markdown documentation**: Write in Portuguese; use English only for code snippets

#### ❌ Don'ts:
- Don't mix languages within single identifiers (`escanNumeroDEBoleto` is bad; use `nomeDocumento` instead)
- Don't translate framework/library names (never `Expressão` for Express)
- Don't write code comments in Spanish or mixed-language

### Documentation Style

All markdown files use consistent formatting:
- **Emojis for section headers** (🎯, 📊, 🖨️, ✅, 📋, 🔑, etc.)
- **Tables for file organization**
- **Code blocks with explicit language**
- **Section dividers** with horizontal rules (`---`)

See: [ARQUITECTURA_EXECUTIVA.md](ARQUITECTURA_EXECUTIVA.md), [README.md](README.md), [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## Project Structure & Key Conventions

### 🏗️ Architecture
- **Backend**: Node.js + Express + MongoDB (see [ARQUITECTURA_EXECUTIVA.md](ARQUITECTURA_EXECUTIVA.md#-arquitetura))
- **Frontend**: React + Vite
- **OCR Pipeline**: Tesseract.js (primary) + Google Vision API (optional)
- **Real-time**: WebSocket for scanner monitoring
- **Communications**: Twilio (WhatsApp), Nodemailer (Email)

### 📁 Key Files & Patterns
| File | Purpose | Language Pattern |
|------|---------|------------------|
| `server.js` | Express server + all routes | Portuguese comments, English for API |
| `App.jsx` | React components (Scanner, List, Viewer) | Portuguese state names, English component names |
| `ocr-config.js` | OCR regions for document types | Configuration objects with descriptive properties |
| `document-configs.js` | Document-specific configs (BOLETO, CPF_RG) | Export named constants, Portuguese descriptions |

### 🔄 Code Style Conventions

**Section Headers in Code**:
```javascript
// ==================== SECTION NAME ====================
// Brief description in Portuguese
```

**Configuration Pattern**:
```javascript
export const DOCUMENT_TYPE_CONFIG = {
  name: 'Portuguese Name',
  regions: {
    FIELD_NAME: {
      x: 150,
      y: 250,
      width: 600,
      height: 80,
      description: 'Portuguese description'
    }
  },
  languages: 'eng,por',
  generateFilename: (ocrText) => { /* ... */ },
  validate: (text) => { /* ... */ }
};
```

**Variable Naming**:
- **Technical/infra**: `UPLOAD_DIR`, `API_BASE`, `DB_URI` (English, UPPER_SNAKE_CASE)
- **Domain logic**: `nomeDocumento`, `textoExtraido`, `regiãoOCR` (Portuguese, camelCase)
- **Constants**: `BOLETO`, `CPF_RG`, `OCR_REGIONS` (English, uppercase)

---

## Development Workflow

### ▶️ Quick Start Commands
```bash
npm install          # Install dependencies
npm run dev          # Start backend with nodemon (development mode)
npm start            # Start backend (production)
npm test             # Run tests (not yet configured)
```

**Frontend**: Separate Vite project (requires separate terminal/setup)

### 📊 Port Configuration
- Backend: `3001` (Express + WebSocket)
- Frontend: `3000` (Vite dev server)
- API Base: `http://localhost:3001` (from frontend)

### 🗂️ Directory Structure
```
scans/
  ├── temp/      # Temporary uploads
  ├── storage/   # Final processed images
  └── thumbs/    # Thumbnails
```

---

## Common Tasks & Patterns

### When Adding a New Document Type:
1. Define configuration in `document-configs.js` or `ocr-config.js`
2. Use export pattern: `export const DOCUMENT_TYPE_CONFIG = { ... }`
3. Include: `name` (Portuguese), `regions`, `languages`, `generateFilename()`, `validate()`
4. Write comments in Portuguese with emoji headers
5. Reference in [ARQUITECTURA_EXECUTIVA.md](ARQUITECTURA_EXECUTIVA.md) if architectural change

### When Modifying Backend Routes:
1. Keep route logic in `server.js` (no separate routes folder yet)
2. Use Express `.post()`, `.get()` patterns
3. Add error handling with try/catch
4. Document API response format in comments
5. Add WebSocket events for real-time features

### When Adding Frontend Components:
1. Use React hooks (useState, useEffect, useRef)
2. State names in Portuguese (e.g., `const [estadoEscaneamento, setEstadoEscaneamento]`)
3. Component names in English (ScannerMonitor, DocumentViewer)
4. Style with `App.css` (responsive, modern design)
5. Connect to API via `axios` with `API_BASE` constant

### When Modifying Documentation:
1. Write in Portuguese
2. Use emoji section headers consistently
3. Add to appropriate file: SETUP_GUIDE.md (setup), ARQUITECTURA_EXECUTIVA.md (technical), README.md (overview)
4. Include code examples with language specified (```javascript, ```bash, etc.)

---

## Important Notes for AI Agents

### Environment Setup
- **Required**: `.env` file with `DB_URI`, `TWILIO_*`, `SMTP_*`, `PORT`, `NODE_ENV`
- **Database**: MongoDB (local or Atlas)
- **API Keys**: Twilio (WhatsApp), Google Vision (optional), Gmail SMTP
- See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed configuration

### Error Scenarios
- **No test suite**: Tests not yet configured (`npm test` will fail)
- **Frontend separate**: Frontend is separate project with own dependencies
- **Scanner hardware**: Requires Kodak i1120 driver for actual scanning (fallback to image upload)

### Language Processing
- **OCR Languages**: `'eng,por'` (English + Portuguese) for Tesseract
- **Text validation**: Must handle Portuguese characters and formats (boletos, CPF, RG)
- **Filename generation**: Follow pattern: `DOCUMENT_TYPE-IDENTIFIER-timestamp`

---

## Additional Documentation

For detailed information, refer to:
- **Architecture & Components**: [ARQUITECTURA_EXECUTIVA.md](ARQUITECTURA_EXECUTIVA.md)
- **Setup & Installation**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Project Overview**: [README.md](README.md)
