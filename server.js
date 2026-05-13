// ==================== SERVER BACKEND WITH SUPABASE ====================
// arquivo: server.js - Migrado de MongoDB para Supabase

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const axios = require('axios');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const http = require('http');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ==================== SUPABASE CLIENT ====================

const supabaseUrl = process.env.SUPABASE_URL || 'https://elgkzvhsvgadefwvwyol.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ2t6dmhzdmdhZGVmd3Z3eW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTY3MDYsImV4cCI6MjA5NDIzMjcwNn0.gtbrbWrQeCInTNFPYIXCTGK_GrbRkoSyejorc3Z8Q-E';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket
  }
});

// ==================== CONFIGURAÇÕES ====================

const UPLOAD_DIR = path.join(__dirname, 'scans', 'temp');
const STORAGE_BUCKET = 'scans';

// Criar diretórios locais
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir interface React PRIMEIRO
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

// Depois servir arquivos estáticos
app.use(express.static('./'));

// Multer para upload temporário
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// ==================== SERVIÇOS ====================

class ScannerService {
  constructor() {
    this.isScanning = false;
    this.clients = new Set();
  }

  broadcastStatus(type, data) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  }

  async startScanning(config = {}) {
    this.isScanning = true;
    this.broadcastStatus('scanning_started', { timestamp: new Date() });
    // Integração com scanner Kodak viria aqui
  }

  async stopScanning() {
    this.isScanning = false;
    this.broadcastStatus('scanning_stopped', { timestamp: new Date() });
  }
}

class OCRService {
  async processImage(imagePath) {
    try {
      const { data } = await Tesseract.recognize(imagePath, process.env.OCR_LANGUAGE || 'por,eng');
      return {
        text: data.text,
        confidence: data.confidence
      };
    } catch (err) {
      console.error('OCR Error:', err);
      throw new Error('Erro ao processar OCR: ' + err.message);
    }
  }
}

class ShareService {
  constructor() {
    this.twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
    this.transporter = process.env.SMTP_USER ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }) : null;
  }

  async shareViaEmail(documentUrl, recipient, filename) {
    try {
      if (!this.transporter) throw new Error('Email não configurado');
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipient,
        subject: `Documento compartilhado: ${filename}`,
        html: `<p>Você recebeu um documento compartilhado.</p><p><a href="${documentUrl}">Baixar documento</a></p>`
      });
      return true;
    } catch (err) {
      console.error('Email Error:', err);
      throw err;
    }
  }

  async shareViaWhatsApp(message, phoneNumber) {
    try {
      if (!this.twilioClient) throw new Error('WhatsApp não configurado');
      await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`
      });
      return true;
    } catch (err) {
      console.error('WhatsApp Error:', err);
      throw err;
    }
  }
}

const scannerService = new ScannerService();
const ocrService = new OCRService();
const shareService = new ShareService();

// ==================== CONEXÃO SUPABASE ====================

async function connectSupabase() {
  try {
    const { data, error } = await supabase.from('documents').select('count');
    if (error) throw error;
    console.log('✓ Supabase conectado');
  } catch (err) {
    console.error('✗ Erro Supabase:', err);
    process.exit(1);
  }
}

// ==================== ROTAS API ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// GET: Listar documentos
app.get('/api/documents', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('documents').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('ocr_text', `%${search}%`);
    }

    const { data, count, error } = await query
      .order('scan_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      documents: data,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Detalhe documento
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Documento não encontrado' });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Upload + OCR
app.post('/api/documents/upload-process', upload.single('file'), async (req, res) => {
  const processingId = `proc-${Date.now()}`;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    scannerService.broadcastStatus('processing_start', { id: processingId });

    const imagePath = req.file.path;
    const filename = `doc-${Date.now()}`;
    const ext = path.extname(req.file.originalname);

    // 1. Processar OCR
    const ocrResult = await ocrService.processImage(imagePath);

    // 2. Processar imagem (compactar, criar thumbnail)
    const processedImage = await sharp(imagePath)
      .rotate()
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const thumbImage = await sharp(imagePath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();

    // 3. Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`documents/${filename}${ext}`, processedImage, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: thumbData, error: thumbError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`thumbnails/${filename}-thumb.jpg`, thumbImage, {
        contentType: 'image/jpeg',
        upsert: false
      });

    // 4. Salvar no BD
    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert([{
        filename,
        original_name: req.file.originalname,
        ocr_text: ocrResult.text,
        ocr_confidence: ocrResult.confidence,
        file_path: `/storage/v1/object/public/${STORAGE_BUCKET}/documents/${filename}${ext}`,
        file_size: processedImage.length,
        dpi: parseInt(req.body.dpi) || 300,
        color_mode: req.body.colorMode || 'color',
        status: 'completed',
        tags: req.body.tags ? req.body.tags.split(',') : []
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // 5. Limpar arquivo temporário
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Erro ao deletar temp:', err);
    });

    // Broadcast: concluído
    scannerService.broadcastStatus('document_processed', {
      id: processingId,
      filename,
      ocrText: ocrResult.text,
      documentId: doc.id
    });

    res.json({
      success: true,
      document: doc,
      ocrResult: {
        text: ocrResult.text,
        confidence: ocrResult.confidence
      }
    });

  } catch (err) {
    console.error('Upload Error:', err);
    scannerService.broadcastStatus('processing_error', {
      id: processingId,
      error: err.message
    });
    res.status(500).json({ error: err.message });
  }
});

// POST: Scanner start
app.post('/api/scan/start', async (req, res) => {
  try {
    await scannerService.startScanning(req.body);
    res.json({ success: true, message: 'Escaneamento iniciado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Scanner stop
app.post('/api/scan/stop', async (req, res) => {
  try {
    await scannerService.stopScanning();
    res.json({ success: true, message: 'Escaneamento parado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Scanner status
app.get('/api/scan/status', (req, res) => {
  res.json({ isScanning: scannerService.isScanning });
});

// POST: Share via email
app.post('/api/documents/:id/share-email', async (req, res) => {
  try {
    const { recipient } = req.body;
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const documentUrl = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}${doc.file_path.split(STORAGE_BUCKET)[1]}`;
    await shareService.shareViaEmail(documentUrl, recipient, doc.filename);

    // Registrar no histórico
    await supabase.from('sharing_history').insert([{
      document_id: doc.id,
      recipient,
      method: 'email',
      status: 'sent'
    }]);

    res.json({ success: true, message: 'Documento compartilhado por email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Share via WhatsApp
app.post('/api/documents/:id/share-whatsapp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const message = `Você recebeu um documento: ${doc.filename}\nOCR: ${doc.ocr_text.substring(0, 100)}...`;
    await shareService.shareViaWhatsApp(message, phoneNumber);

    // Registrar no histórico
    await supabase.from('sharing_history').insert([{
      document_id: doc.id,
      recipient: phoneNumber,
      method: 'whatsapp',
      status: 'sent'
    }]);

    res.json({ success: true, message: 'Documento compartilhado por WhatsApp' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Deletar documento
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Deletar do storage
    const filename = doc.file_path.split('/').pop();
    await Promise.all([
      supabase.storage.from(STORAGE_BUCKET).remove([`documents/${filename}`]),
      supabase.storage.from(STORAGE_BUCKET).remove([`thumbnails/${doc.filename}-thumb.jpg`])
    ]);

    // Deletar do BD
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Documento deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== WEBSOCKET ====================

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  ws.send(JSON.stringify({
    type: 'connected',
    isScanning: scannerService.isScanning
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (err) {
      console.error('WebSocket error:', err);
    }
  });

  ws.on('close', () => console.log('Cliente desconectado'));
});

// ==================== INICIALIZAR ====================

async function start() {
  await connectSupabase();

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Scanner OCR System Backend Started    ║
║   🖨️  Port: ${PORT}                         ║
║   📊 WebSocket: ws://localhost:${PORT}    ║
║   📁 Storage: Supabase (${STORAGE_BUCKET})         ║
║   🗄️  Database: Supabase PostgreSQL     ║
╚════════════════════════════════════════╝
    `);
  });
}

start().catch(console.error);

module.exports = { app, scannerService, ocrService, shareService };
