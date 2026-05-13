// ==================== GOOGLE VISION API (Alternativa) ====================
// arquivo: services/google-vision-ocr.js

/**
 * GOOGLE VISION API OCR
 * 
 * Alternativa ao Tesseract.js com:
 * - Melhor precisão (especialmente em documentos complexos)
 * - Suporte a múltiplos idiomas
 * - Detecção de estrutura de documento
 * - Mais rápido em produção
 * 
 * Custo: ~$1.50 por 1000 requests
 */

import vision from '@google-cloud/vision';
import sharp from 'sharp';
import fs from 'fs/promises';

export class GoogleVisionOCRService {
  constructor(credentialsPath) {
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: credentialsPath || process.env.GOOGLE_VISION_KEY_FILE
    });
  }

  /**
   * Extrair texto de região específica
   */
  async extractFromRegion(imagePath, region) {
    try {
      // 1. Fazer crop do scanner
      const croppedBuffer = await sharp(imagePath)
        .extract({
          left: region.x,
          top: region.y,
          width: region.width,
          height: region.height
        })
        .toBuffer();

      // 2. Aumentar resolução para melhor OCR
      const enhancedBuffer = await sharp(croppedBuffer)
        .resize(region.width * 2, region.height * 2, {
          fit: 'fill',
          kernel: 'lanczos3'
        })
        .toBuffer();

      // 3. Detectar texto
      const request = {
        image: { content: enhancedBuffer },
        features: [
          {
            type: 'TEXT_DETECTION',
            maxResults: 10
          },
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            maxResults: 1
          }
        ]
      };

      const [result] = await this.client.batchAnnotateImages({ requests: [request] });
      const annotations = result.responses[0];

      return this._processAnnotations(annotations);

    } catch (err) {
      console.error('Erro Google Vision:', err);
      throw err;
    }
  }

  /**
   * Extrair múltiplos campos de documento
   */
  async extractDocumentFields(imagePath, fieldRegions) {
    const results = {};

    for (const [fieldName, region] of Object.entries(fieldRegions)) {
      try {
        const extraction = await this.extractFromRegion(imagePath, region);
        results[fieldName] = {
          text: extraction.text,
          confidence: extraction.confidence,
          details: extraction.details
        };
      } catch (err) {
        results[fieldName] = {
          error: err.message,
          text: null,
          confidence: 0
        };
      }
    }

    return results;
  }

  /**
   * OCR Completo do Documento
   */
  async extractFullDocument(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);

      const request = {
        image: { content: imageBuffer },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION'
          }
        ]
      };

      const [result] = await this.client.batchAnnotateImages({ requests: [request] });
      const annotations = result.responses[0];

      if (annotations.error) {
        throw new Error(annotations.error.message);
      }

      const fullTextAnnotation = annotations.fullTextAnnotation;

      return {
        text: fullTextAnnotation.text,
        confidence: this._calculateConfidence(annotations.textAnnotations),
        pages: fullTextAnnotation.pages?.length || 1,
        blocks: fullTextAnnotation.pages?.[0]?.blocks?.length || 0,
        paragraphs: fullTextAnnotation.pages?.[0]?.blocks?.[0]?.paragraphs?.length || 0
      };

    } catch (err) {
      console.error('Erro na extração completa:', err);
      throw err;
    }
  }

  /**
   * Buscar campo específico por descrição
   * Ex: "CPF", "data", "valor"
   */
  async searchField(imagePath, fieldDescription) {
    try {
      const fullDoc = await this.extractFullDocument(imagePath);
      
      // Procurar padrão no documento
      const patterns = {
        'cpf': /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
        'cnpj': /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g,
        'data': /\d{1,2}[/-]\d{1,2}[/-]\d{4}/g,
        'valor': /R?\$?\s?\d+[.,]\d{2}/g,
        'telefone': /\(?(\d{2})\)?\s?(\d{4,5})-?(\d{4})/g,
        'email': /[\w\.-]+@[\w\.-]+\.\w+/g
      };

      const lowerDesc = fieldDescription.toLowerCase();
      let matches = [];

      for (const [key, pattern] of Object.entries(patterns)) {
        if (lowerDesc.includes(key)) {
          matches = fullDoc.text.match(pattern) || [];
          break;
        }
      }

      return {
        field: fieldDescription,
        matches,
        primary: matches[0] || null,
        confidence: matches.length > 0 ? 0.95 : 0
      };

    } catch (err) {
      console.error('Erro na busca:', err);
      throw err;
    }
  }

  /**
   * Processar anotações do Vision API
   */
  _processAnnotations(annotations) {
    const textAnnotations = annotations.textAnnotations || [];
    
    if (textAnnotations.length === 0) {
      return {
        text: '',
        confidence: 0,
        details: []
      };
    }

    // Primeiro resultado é o texto completo
    const fullText = textAnnotations[0].description;

    // Calcular confiança média
    const confidence = textAnnotations
      .slice(1)
      .reduce((sum, ann) => sum + (ann.confidence || 0), 0) / 
      Math.max(textAnnotations.length - 1, 1);

    // Detalhes de palavras
    const details = textAnnotations.slice(1).map(ann => ({
      text: ann.description,
      confidence: ann.confidence,
      bounds: ann.boundingPoly?.vertices || []
    }));

    return {
      text: fullText.trim(),
      confidence,
      details
    };
  }

  /**
   * Calcular confiança média
   */
  _calculateConfidence(annotations) {
    if (!annotations || annotations.length === 0) return 0;
    const sum = annotations.reduce((acc, ann) => acc + (ann.confidence || 0), 0);
    return sum / annotations.length;
  }

  /**
   * Estruturar documento (tabelas, listas, etc)
   */
  async structureDocument(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);

      const requests = [
        {
          image: { content: imageBuffer },
          features: [
            { type: 'DOCUMENT_TEXT_DETECTION' },
            { type: 'TABLE_DETECTION' }
          ]
        }
      ];

      const [result] = await this.client.batchAnnotateImages({ requests });
      const response = result.responses[0];

      return {
        fullText: response.fullTextAnnotation?.text || '',
        tables: response.tablesectionProperties?.length || 0,
        structure: {
          hasTable: !!response.tablesectionProperties,
          hasForm: this._detectForm(response)
        }
      };

    } catch (err) {
      console.error('Erro na estruturação:', err);
      throw err;
    }
  }

  /**
   * Detectar se é um formulário
   */
  _detectForm(response) {
    const text = response.fullTextAnnotation?.text || '';
    const formIndicators = ['[ ]', '[x]', '☑', '☐', 'Assinado', 'Recibo'];
    return formIndicators.some(indicator => text.includes(indicator));
  }
}

// ==================== WRAPPER PARA USAR AMBOS ====================

export class HybridOCRService {
  /**
   * Usar Tesseract por padrão, Vision API como fallback
   */
  constructor(tesseractService, googleVisionService) {
    this.tesseract = tesseractService;
    this.googleVision = googleVisionService;
  }

  async extractFieldSafe(imagePath, region, languages = 'por,eng') {
    try {
      // Tentar Tesseract primeiro (mais rápido, local)
      const result = await this.tesseract.extractField(imagePath, region, languages);
      
      // Se confiança baixa, tentar Vision API
      if (result.confidence < 0.7 && this.googleVision) {
        console.log('Confiança baixa, tentando Google Vision...');
        const visionResult = await this.googleVision.extractFromRegion(imagePath, region);
        
        if (visionResult.confidence > result.confidence) {
          return visionResult;
        }
      }

      return result;

    } catch (err) {
      console.warn('Erro Tesseract, tentando Vision API...');
      
      if (this.googleVision) {
        return await this.googleVision.extractFromRegion(imagePath, region);
      }
      
      throw err;
    }
  }
}

// ==================== SETUP ====================

/**
 * PARA USAR GOOGLE VISION:
 * 
 * 1. Criar conta Google Cloud
 * 2. Ativar Vision API
 * 3. Criar service account JSON
 * 4. Instalar:
 *    npm install @google-cloud/vision
 * 
 * 5. Configurar .env:
 *    GOOGLE_VISION_KEY_FILE=./google-credentials.json
 * 
 * 6. Usar no server.js:
 *    import { GoogleVisionOCRService } from './services/google-vision-ocr.js';
 *    const googleVision = new GoogleVisionOCRService();
 */

export default GoogleVisionOCRService;
