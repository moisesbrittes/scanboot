# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install --omit=dev

# ===== PRODUCTION STAGE =====
FROM node:20-alpine

WORKDIR /app

# Instalar Tesseract (necessário para OCR)
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-por \
    tesseract-ocr-data-eng

# Copiar dependências do build
COPY --from=builder /app/node_modules ./node_modules

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p scans/temp scans/storage scans/thumbs

# Expor porta
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Iniciar aplicação
CMD ["npm", "run", "prod"]
