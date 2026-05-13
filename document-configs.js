// ==================== EXEMPLOS DE USO POR TIPO DE DOCUMENTO ====================

/**
 * CONFIGURAÇÕES RECOMENDADAS PARA DIFERENTES TIPOS
 * Copie e adapte a sua necessidade
 */

// ==================== 1. BOLETO BANCÁRIO ====================

export const BOLETO_CONFIG = {
  name: 'Boleto Bancário',
  
  // Região onde fica o código de barras
  barcodeRegion: {
    x: 100,
    y: 2700,      // Mais para baixo (final do boleto)
    width: 2200,
    height: 200
  },

  // Região do valor
  valueRegion: {
    x: 1800,
    y: 300,
    width: 500,
    height: 80
  },

  // Região da data de vencimento
  dueDateRegion: {
    x: 100,
    y: 350,
    width: 500,
    height: 60
  },

  languages: 'eng,por',
  
  // Nome do arquivo gerado: "BOLETO-XXXXX-timestamp"
  generateFilename: (ocrText) => {
    const match = ocrText.match(/(\d{5})/);
    return match ? `BOLETO-${match[1]}` : 'BOLETO-UNKNOWN';
  },

  // Validar se é realmente um boleto
  validate: (text) => {
    return /\d{5}/.test(text) && text.length > 20;
  }
};


// ==================== 2. CPF / RG ====================

export const CPF_RG_CONFIG = {
  name: 'CPF/RG',
  
  // Número do documento
  numberRegion: {
    x: 150,
    y: 250,
    width: 700,
    height: 100
  },

  // Nome completo
  nameRegion: {
    x: 150,
    y: 400,
    width: 1500,
    height: 80
  },

  // Data de nascimento
  birthDateRegion: {
    x: 150,
    y: 550,
    width: 400,
    height: 60
  },

  languages: 'por',
  
  generateFilename: (text) => {
    // Extrair apenas números
    const numbers = text.replace(/\D/g, '');
    return `CPF-${numbers.substring(0, 11)}`;
  },

  validate: (text) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.length >= 11;
  }
};


// ==================== 3. NOTA FISCAL ====================

export const NOTA_FISCAL_CONFIG = {
  name: 'Nota Fiscal',
  
  // Número da NF (canto superior direito)
  numberRegion: {
    x: 1800,
    y: 100,
    width: 600,
    height: 80
  },

  // CNPJ Emitente
  cnpjRegion: {
    x: 100,
    y: 400,
    width: 600,
    height: 60
  },

  // Valor Total (rodapé)
  totalValueRegion: {
    x: 1800,
    y: 2900,
    width: 500,
    height: 80
  },

  // Data de Emissão
  issueDateRegion: {
    x: 100,
    y: 500,
    width: 500,
    height: 60
  },

  languages: 'por,eng',
  
  generateFilename: (text) => {
    // Extrair número da NF
    const match = text.match(/NF[\\s-]*(\\d+)/i) || text.match(/(\\d{5,})/);
    return match ? `NF-${match[1]}` : 'NF-UNKNOWN';
  },

  validate: (text) => {
    return /NF|NOTA|FISCAL/.test(text.toUpperCase());
  }
};


// ==================== 4. CONTRATO ====================

export const CONTRATO_CONFIG = {
  name: 'Contrato',
  
  // Número do contrato (primeira página, topo)
  numberRegion: {
    x: 100,
    y: 80,
    width: 1000,
    height: 80
  },

  // Partes (quem está assinando)
  partiesRegion: {
    x: 100,
    y: 300,
    width: 2000,
    height: 200
  },

  // Data (rodapé)
  dateRegion: {
    x: 100,
    y: 3300,
    width: 500,
    height: 60
  },

  languages: 'por',
  
  generateFilename: (text) => {
    const match = text.match(/CONTRATO[\\s\\-]*(\\d+)/i) || 
                 text.match(/N[º#]?[\\s]*(\\d+)/);
    return match ? `CONTRATO-${match[1]}` : 'CONTRATO-UNKNOWN';
  },

  validate: (text) => {
    return /CONTRATO|ACORDO|TERMO|ADITIVO/.test(text.toUpperCase());
  }
};


// ==================== 5. REC DOCUMENTO (Genérico) ====================

export const GENERIC_CONFIG = {
  name: 'Documento Genérico',
  
  // Campo padrão para qualquer documento
  defaultRegion: {
    x: 0,
    y: 0,
    width: 2480,
    height: 100
  },

  languages: 'por,eng',
  
  generateFilename: (text) => {
    // Pegar primeiras 30 chars, remover caracteres especiais
    const sanitized = text
      .substring(0, 30)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .toUpperCase();
    return sanitized || 'DOC-UNKNOWN';
  },

  validate: (text) => {
    return text.length > 3;
  }
};


// ==================== USO NO SERVER.JS ====================

/**
 * 
// No server.js, usar assim:

import { BOLETO_CONFIG, CPF_RG_CONFIG, NOTA_FISCAL_CONFIG } from './document-configs.js';

// Ao fazer upload
app.post('/api/documents/upload-process', upload.single('image'), async (req, res) => {
  const { documentType = 'GENERIC' } = req.body;
  
  const config = {
    BOLETO: BOLETO_CONFIG,
    CPF_RG: CPF_RG_CONFIG,
    NOTA_FISCAL: NOTA_FISCAL_CONFIG
  }[documentType] || GENERIC_CONFIG;

  // ... resto do código
  
  const ocrResult = await ocrService.extractField(
    imagePath,
    config.numberRegion || config.defaultRegion
  );

  // Validar
  if (!config.validate(ocrResult.text)) {
    return res.status(400).json({ 
      error: 'Documento inválido',
      details: 'OCR não detectou padrão esperado' 
    });
  }

  // Gerar nome
  const filename = config.generateFilename(ocrResult.text);
  
  // ... resto do fluxo
});

 */


// ==================== CASOS DE USO REAIS ====================

/**
 * 
 * CASO 1: BOLETO BANCÁRIO (Banco)
 * ════════════════════════════════════════════════════════════
 * 
 * Problema: Boletos em formato A4, código de barras sempre na base
 * Solução:
 *   - OCR apenas da base (2700-2900px)
 *   - Validar formato de código de barras
 *   - Salvar com nome: BOLETO-12345 (últimos 5 dígitos)
 * 
 * Fluxo:
 *   1. Scanner automático em ciclo (20 boletos/min)
 *   2. Crop da base do boleto
 *   3. Tesseract (OCR muito rápido pois é apenas números)
 *   4. Nomear automaticamente
 *   5. Enviar por Email para contabilidade
 * 
 * Resultado: Centenas de boletos organizados por número
 *
 */

/**
 * 
 * CASO 2: CPF/RG (Departamento de Recursos Humanos)
 * ════════════════════════════════════════════════════════════
 * 
 * Problema: Documentos variados (CPF, RG, CNH, Passport)
 * Solução:
 *   - Detectar automaticamente o tipo
 *   - OCR específico para cada campo (nome, número, data)
 *   - Validar CPF/CNPJ
 *   - Salvar com nome: CPF-12345678901
 * 
 * Fluxo:
 *   1. RH prepara pilha de documentos
 *   2. Scanner contínuo (100 docs/hora)
 *   3. Detectar tipo do documento
 *   4. Validar número (CPF válido?)
 *   5. Salvar em pastas por tipo
 *   6. Compartilhar com departamentos relevantes
 * 
 * Resultado: Base de dados estruturada de funcionários
 *
 */

/**
 * 
 * CASO 3: NOTA FISCAL (Contabilidade)
 * ════════════════════════════════════════════════════════════
 * 
 * Problema: Notas de múltiplos fornecedores, layouts diferentes
 * Solução:
 *   - OCR do número NF (sempre canto superior direito)
 *   - Extrair CNPJ fornecedor
 *   - Extrair valor total
 *   - Validar data
 * 
 * Fluxo:
 *   1. Recepção de notas fiscais
 *   2. Scanner em batch (50 notas/lote)
 *   3. OCR extrai NF, CNPJ, Valor
 *   4. Envia para sistema ERP via API
 *   5. Armazena cópia em cloud
 * 
 * Resultado: Integração com sistema contábil automática
 *
 */

/**
 * 
 * CASO 4: CONTRATOS (Jurídico)
 * ════════════════════════════════════════════════════════════
 * 
 * Problema: Contratos multi-página com estruturas variadas
 * Solução:
 *   - OCR da primeira página apenas (número, partes)
 *   - Full-text search de todo o documento
 *   - Salvar em pastas por cliente
 * 
 * Fluxo:
 *   1. Departamento jurídico escaneia contratos
 *   2. Scanner automático
 *   3. OCR extrai número e partes
 *   4. Indexação full-text para busca
 *   5. Compartilhar com cliente por WhatsApp/Email
 * 
 * Resultado: Biblioteca de contratos organizada e searchable
 *
 */


// ==================== IMPLEMENTAÇÃO DE EXEMPLO ====================

/**
 * Exemplo real: Processar boleto e enviar por email
 */

async function processarBoleto(filePath) {
  // 1. Fazer upload
  const formData = new FormData();
  formData.append('image', fs.createReadStream(filePath));
  formData.append('documentType', 'BOLETO');
  
  // 2. Enviar para servidor
  const response = await axios.post(
    'http://localhost:3001/api/documents/upload-process',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  
  const { document } = response.data;
  console.log(`✓ Boleto processado: ${document.filename}`);
  console.log(`  OCR: ${document.ocrText}`);
  console.log(`  Confiança: ${Math.round(document.ocrConfidence * 100)}%`);
  
  // 3. Enviar por email para contabilidade
  await axios.post(
    `http://localhost:3001/api/documents/${document._id}/share-email`,
    { email: 'contabilidade@empresa.com' }
  );
  
  console.log(`✓ Email enviado para contabilidade`);
  
  // 4. Arquivar
  console.log(`✓ Salvo em /scans/storage/${document.filename}.jpg`);
}

// Usar:
// await processarBoleto('./boleto-123.jpg');


/**
 * Exemplo: Batch processing de vários documentos
 */

async function processarLote(arquivos, tipoDocumento) {
  console.log(`\n📋 Processando lote de ${arquivos.length} documentos...`);
  
  const resultados = [];
  
  for (let i = 0; i < arquivos.length; i++) {
    try {
      const arquivo = arquivos[i];
      console.log(`[${i+1}/${arquivos.length}] Processando ${arquivo.nome}...`);
      
      const formData = new FormData();
      formData.append('image', fs.createReadStream(arquivo.caminho));
      formData.append('documentType', tipoDocumento);
      
      const response = await axios.post(
        'http://localhost:3001/api/documents/upload-process',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      resultados.push({
        arquivo: arquivo.nome,
        status: 'OK',
        filename: response.data.document.filename,
        ocr: response.data.document.ocrText
      });
      
      // Aguardar um pouco entre requisições
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      resultados.push({
        arquivo: arquivo.nome,
        status: 'ERRO',
        erro: err.message
      });
    }
  }
  
  // Relatório
  console.log('\n✓ Lote processado!');
  console.log(`  ✅ Sucesso: ${resultados.filter(r => r.status === 'OK').length}`);
  console.log(`  ❌ Erros: ${resultados.filter(r => r.status === 'ERRO').length}`);
  
  // Salvar relatório
  fs.writeFileSync(
    'relatorio-lote.json',
    JSON.stringify(resultados, null, 2)
  );
}

// Usar:
// const arquivos = [
//   { nome: 'boleto-001.jpg', caminho: './boletos/001.jpg' },
//   { nome: 'boleto-002.jpg', caminho: './boletos/002.jpg' },
// ];
// await processarLote(arquivos, 'BOLETO');


export { BOLETO_CONFIG, CPF_RG_CONFIG, NOTA_FISCAL_CONFIG, GENERIC_CONFIG };
