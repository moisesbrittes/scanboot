// ==================== OCR CONFIG AVANÇADO ====================
// arquivo: config/ocr-config.js

/**
 * CONFIGURAÇÃO OCR PARA DIFERENTES TIPOS DE DOCUMENTO
 * 
 * Kodak i1120 scanneia documentos em 300 DPI padrão.
 * Cada região (region) define onde fazer o OCR.
 * 
 * Unidades: PIXELS na imagem 300 DPI
 * A1 (210x297mm @ 300dpi) = 2480x3507 pixels
 */

export const OCR_REGIONS = {
  // ==================== BOLETO BANCÁRIO ====================
  BOLETO: {
    name: 'Boleto Bancário',
    regions: {
      NUMERO_BOLETO: {
        x: 200,
        y: 150,
        width: 800,
        height: 60,
        description: 'Campo código de barras do boleto'
      },
      VALOR: {
        x: 2000,
        y: 200,
        width: 400,
        height: 60,
        description: 'Valor do boleto'
      },
      VENCIMENTO: {
        x: 200,
        y: 300,
        width: 400,
        height: 50,
        description: 'Data de vencimento'
      }
    },
    languages: 'eng,por',
    preprocessing: {
      rotate: 'auto',
      contrast: 'high',
      threshold: 0.5
    }
  },

  // ==================== CPF/RG ====================
  CPF_RG: {
    name: 'CPF/RG',
    regions: {
      NUMERO: {
        x: 150,
        y: 200,
        width: 600,
        height: 80,
        description: 'Número do documento'
      },
      NOME: {
        x: 150,
        y: 300,
        width: 1200,
        height: 60,
        description: 'Nome completo'
      },
      DATA_NASC: {
        x: 150,
        y: 400,
        width: 400,
        height: 50,
        description: 'Data de nascimento'
      }
    },
    languages: 'por',
    preprocessing: {
      rotate: 'auto',
      contrast: 'adaptive',
      denoise: true
    }
  },

  // ==================== NOTA FISCAL ====================
  NOTA_FISCAL: {
    name: 'Nota Fiscal',
    regions: {
      NUMERO_NF: {
        x: 1800,
        y: 100,
        width: 500,
        height: 60,
        description: 'Número da NF'
      },
      CNPJ_EMITENTE: {
        x: 100,
        y: 300,
        width: 600,
        height: 50,
        description: 'CNPJ do emitente'
      },
      VALOR_TOTAL: {
        x: 2000,
        y: 2500,
        width: 400,
        height: 60,
        description: 'Valor total da nota'
      }
    },
    languages: 'eng,por',
    preprocessing: {
      rotate: 'auto',
      contrast: 'high',
      deskew: true
    }
  },

  // ==================== CONTRATO ====================
  CONTRATO: {
    name: 'Contrato',
    regions: {
      NUMERO_CONTRATO: {
        x: 100,
        y: 100,
        width: 800,
        height: 50,
        description: 'Número do contrato'
      },
      PARTES: {
        x: 100,
        y: 200,
        width: 2000,
        height: 150,
        description: 'Partes envolvidas'
      },
      DATA: {
        x: 100,
        y: 3200,
        width: 400,
        height: 50,
        description: 'Data do contrato'
      }
    },
    languages: 'por',
    preprocessing: {
      rotate: 'auto',
      contrast: 'adaptive'
    }
  },

  // ==================== CRACHÁ/ID ====================
  CRACHA: {
    name: 'Crachá/ID',
    regions: {
      NOME: {
        x: 200,
        y: 100,
        width: 1000,
        height: 60,
        description: 'Nome da pessoa'
      },
      NUMERO_ID: {
        x: 200,
        y: 200,
        width: 800,
        height: 60,
        description: 'Número do ID'
      },
      DEPARTAMENTO: {
        x: 200,
        y: 300,
        width: 800,
        height: 50,
        description: 'Departamento'
      }
    },
    languages: 'por,eng',
    preprocessing: {
      rotate: 'auto',
      contrast: 'high',
      sharpen: true
    }
  }
};

// ==================== CLASSE AVANÇADA DE OCR ====================

import sharp from 'sharp';
import Tesseract from 'tesseract.js';

export class AdvancedOCRService {
  constructor() {
    this.currentConfig = null;
  }

  /**
   * Pré-processar imagem para melhor OCR
   */
  async preprocessImage(imagePath, config = {}) {
    const {
      rotate = 'auto',
      contrast = 'adaptive',
      deskew = false,
      denoise = false,
      sharpen = false,
      threshold = null
    } = config;

    let pipeline = sharp(imagePath);

    // 1. Auto-rotate
    if (rotate === 'auto') {
      pipeline = pipeline.rotate();
    } else if (typeof rotate === 'number') {
      pipeline = pipeline.rotate(rotate);
    }

    // 2. Contraste
    if (contrast === 'high') {
      pipeline = pipeline.normalize();
    } else if (contrast === 'adaptive') {
      // Equalização adaptativa (CLAHE)
      // Nota: Sharp não tem suporte nativo, usar conversão
      pipeline = pipeline.normalize();
    }

    // 3. Deskew (correção de inclinação)
    if (deskew) {
      // Tesseract faz auto-deskew, não precisa aqui
    }

    // 4. Denoise (redução de ruído)
    if (denoise) {
      pipeline = pipeline.median(3);
    }

    // 5. Sharpen (aguçar)
    if (sharpen) {
      pipeline = pipeline.sharpen({
        sigma: 1.5
      });
    }

    // 6. Threshold (preto e branco)
    if (threshold !== null) {
      // Tesseract lida melhor com essa conversão
      pipeline = pipeline.threshold(Math.floor(255 * threshold));
    }

    return pipeline.toBuffer();
  }

  /**
   * Extrair múltiplos campos de uma imagem
   */
  async extractMultipleFields(imagePath, documentType) {
    const config = OCR_REGIONS[documentType];
    if (!config) {
      throw new Error(`Tipo de documento não suportado: ${documentType}`);
    }

    const results = {};
    const buffer = await sharp(imagePath).toBuffer();

    for (const [fieldName, region] of Object.entries(config.regions)) {
      try {
        const fieldResult = await this.extractField(
          imagePath,
          region,
          config.languages
        );

        results[fieldName] = {
          text: fieldResult.text,
          confidence: fieldResult.confidence,
          region: region.description
        };
      } catch (err) {
        results[fieldName] = {
          error: err.message,
          text: null,
          confidence: 0
        };
      }
    }

    return {
      documentType,
      fields: results,
      timestamp: new Date()
    };
  }

  /**
   * Extrair campo único com pré-processamento
   */
  async extractField(imagePath, region, languages = 'por,eng') {
    try {
      // 1. Crop da região
      const cropped = await sharp(imagePath)
        .extract({
          left: region.x,
          top: region.y,
          width: region.width,
          height: region.height
        })
        .toBuffer();

      // 2. Pré-processar
      const preprocessed = await this.preprocessImage(cropped, {
        rotate: 'auto',
        contrast: 'adaptive',
        sharpen: true,
        denoise: true
      });

      // 3. Aumentar imagem para melhor OCR
      const enlarged = await sharp(preprocessed)
        .resize(region.width * 2, region.height * 2, {
          fit: 'fill',
          kernel: 'lanczos3'
        })
        .toBuffer();

      // 4. OCR com Tesseract
      const { data } = await Tesseract.recognize(
        enlarged,
        languages,
        {
          logger: m => console.log(`OCR ${region.description}:`, m.status, m.progress),
          psm: 6 // Single uniform block of text
        }
      );

      return {
        text: data.text.trim(),
        confidence: data.confidence / 100,
        oem: data.oem,
        paragraphs: data.paragraphs
      };
    } catch (err) {
      console.error(`Erro OCR no campo ${region.description}:`, err);
      throw err;
    }
  }

  /**
   * Validar resultado OCR
   */
  validateOCRResult(text, fieldType) {
    const validators = {
      CPF: (text) => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(text.replace(/\D/g, '')),
      CNPJ: (text) => /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(text.replace(/\D/g, '')),
      DATA: (text) => /^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(text),
      VALOR: (text) => /^R?\$?\s?\d+[.,]\d{2}$/.test(text),
      NUMERO: (text) => /^\d+$/.test(text)
    };

    const validator = validators[fieldType];
    return validator ? validator(text) : true;
  }

  /**
   * Corrigir erros comuns de OCR (pós-processamento)
   */
  correctOCRErrors(text, fieldType) {
    // Substituições comuns
    const corrections = {
      'l0': 'lo',       // letra L x zero
      '1I': 'li',       // um x I maiúsculo
      'O0': 'o0',       // O maiúsculo x zero
      'rn': 'm',        // rn x m
      ' - ': '-',       // espaços
      '  ': ' '         // múltiplos espaços
    };

    let corrected = text;
    for (const [from, to] of Object.entries(corrections)) {
      corrected = corrected.replace(new RegExp(from, 'g'), to);
    }

    // Limpeza específica por tipo
    switch (fieldType) {
      case 'CPF':
      case 'CNPJ':
        corrected = corrected.replace(/\D/g, '');
        break;
      case 'DATA':
        corrected = corrected.replace(/[^\d/-]/g, '');
        break;
      case 'VALOR':
        corrected = corrected.replace(/[^\d.,]/g, '');
        break;
    }

    return corrected.trim();
  }
}

// ==================== EXEMPLO DE USO ====================

/*
import { AdvancedOCRService, OCR_REGIONS } from './config/ocr-config.js';

const ocr = new AdvancedOCRService();

// 1. Extrair múltiplos campos
const result = await ocr.extractMultipleFields(
  '/path/to/image.jpg',
  'NOTA_FISCAL'
);
console.log(result);

// 2. Extrair campo único com pré-processamento
const cpfField = await ocr.extractField(
  '/path/to/cpf.jpg',
  OCR_REGIONS.CPF_RG.regions.NUMERO,
  'por'
);
console.log(cpfField);

// 3. Validar e corrigir
const corrected = ocr.correctOCRErrors(cpfField.text, 'CPF');
const isValid = ocr.validateOCRResult(corrected, 'CPF');
console.log({ corrected, isValid });
*/

export default AdvancedOCRService;
