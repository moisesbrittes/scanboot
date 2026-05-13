// ==================== FRONTEND REACT - SCANNER OCR ====================
// arquivo: App.jsx - Versão Supabase

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3002';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://elgkzvhsvgadefwvwyol.supabase.co';

// ==================== COMPONENTE PRINCIPAL ====================

export default function App() {
  const [currentTab, setCurrentTab] = useState('upload'); // 'upload', 'list', 'viewer'
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDocuments();
    connectWebSocket();
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3002');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'document_processed') {
          showMessage('✅ Documento processado com sucesso!', 'success');
          loadDocuments();
        }
      };
    } catch (err) {
      console.error('WebSocket:', err);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/documents?limit=50`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      showMessage('Erro ao carregar documentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <h1>🖨️ Scanner OCR System</h1>
          <p>Digitalização e reconhecimento de documentos</p>
        </div>
        <div className="server-status">
          <span className="status-dot online"></span>
          <span>Conectado</span>
        </div>
      </header>

      {/* NAVEGAÇÃO */}
      <nav className="tabs">
        <button
          className={`tab ${currentTab === 'upload' ? 'active' : ''}`}
          onClick={() => setCurrentTab('upload')}
        >
          📤 Upload
        </button>
        <button
          className={`tab ${currentTab === 'list' ? 'active' : ''}`}
          onClick={() => setCurrentTab('list')}
        >
          📋 Documentos ({documents.length})
        </button>
        <button
          className={`tab ${currentTab === 'viewer' ? 'active' : ''}`}
          onClick={() => setCurrentTab('viewer')}
          disabled={!selectedDocument}
        >
          👁️ Visualizador
        </button>
      </nav>

      {/* MENSAGEM */}
      {message && <div className={`message message-${message.split(':')[0] === '✅' ? 'success' : 'error'}`}>
        {message}
      </div>}

      {/* CONTEÚDO */}
      <main className="content">
        {currentTab === 'upload' && (
          <UploadSection onSuccess={loadDocuments} showMessage={showMessage} />
        )}
        {currentTab === 'list' && (
          <ListSection
            documents={documents}
            loading={loading}
            onSelect={(doc) => {
              setSelectedDocument(doc);
              setCurrentTab('viewer');
            }}
            onRefresh={loadDocuments}
            onDelete={() => loadDocuments()}
            showMessage={showMessage}
          />
        )}
        {currentTab === 'viewer' && selectedDocument && (
          <ViewerSection
            document={selectedDocument}
            onBack={() => setCurrentTab('list')}
            onDelete={() => {
              loadDocuments();
              setCurrentTab('list');
            }}
            showMessage={showMessage}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>Scanner OCR System • Supabase PostgreSQL • v1.0</p>
      </footer>
    </div>
  );
}

// ==================== SEÇÃO: UPLOAD ====================

function UploadSection({ onSuccess, showMessage }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showMessage('Selecione uma imagem', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dpi', '300');

      const res = await axios.post(
        `${API_BASE}/api/documents/upload-process`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        }
      );

      setResult(res.data.ocrResult);
      showMessage('✅ Upload e OCR completos!', 'success');
      onSuccess();

      // Reset
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setProgress(0);
      }, 3000);
    } catch (err) {
      showMessage(`Erro: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="section upload-section">
      <h2>📤 Upload de Documento</h2>

      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button
          className="btn btn-upload"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '⏳ Processando...' : '📁 Selecionar Imagem'}
        </button>
      </div>

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" />
          <p>{file.name}</p>
        </div>
      )}

      {uploading && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span>{progress}%</span>
        </div>
      )}

      {result && (
        <div className="result-box">
          <h3>✅ Resultado do OCR</h3>
          <p><strong>Confiança:</strong> {(result.confidence * 100).toFixed(2)}%</p>
          <p><strong>Texto extraído:</strong></p>
          <pre className="ocr-text">{result.text.substring(0, 500)}...</pre>
        </div>
      )}

      {file && !uploading && !result && (
        <button className="btn btn-primary" onClick={handleUpload}>
          🚀 Fazer Upload + OCR
        </button>
      )}

      <div className="info-box">
        <p>💡 Dicas:</p>
        <ul>
          <li>Formatos aceitos: JPG, PNG, TIFF, PDF</li>
          <li>Tamanho máximo: 100MB</li>
          <li>OCR automático em português e inglês</li>
          <li>Imagens são armazenadas na nuvem (Supabase)</li>
        </ul>
      </div>
    </div>
  );
}

// ==================== SEÇÃO: LISTA ====================

function ListSection({ documents, loading, onSelect, onRefresh, onDelete, showMessage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  const filteredDocs = documents.filter(doc =>
    doc.ocr_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar?')) return;

    try {
      setDeleting(id);
      await axios.delete(`${API_BASE}/api/documents/${id}`);
      showMessage('✅ Documento deletado', 'success');
      onDelete();
    } catch (err) {
      showMessage('Erro ao deletar', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="section list-section">
      <h2>📋 Meus Documentos</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por texto ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
          {loading ? '⏳' : '🔄'} Atualizar
        </button>
      </div>

      {loading && <p className="loading">⏳ Carregando...</p>}

      {filteredDocs.length === 0 ? (
        <div className="empty-state">
          <p>📭 Nenhum documento encontrado</p>
          <p className="text-muted">Comece fazendo upload de uma imagem</p>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="card-image">
                {doc.file_path ? (
                  <img
                    src={`${SUPABASE_URL}/storage/v1/object/public/scans${doc.file_path.split('scans')[1]}`}
                    alt={doc.filename}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23eee" width="200" height="200"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="card-placeholder">📄</div>
                )}
              </div>

              <div className="card-content">
                <h3>{doc.filename}</h3>
                <p className="confidence">
                  Confiança: {(doc.ocr_confidence * 100).toFixed(1)}%
                </p>
                <p className="preview-text">
                  {doc.ocr_text?.substring(0, 80)}...
                </p>
                <p className="date">
                  {new Date(doc.scan_date).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onSelect(doc)}
                >
                  Ver
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                >
                  {deleting === doc.id ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== SEÇÃO: VISUALIZADOR ====================

function ViewerSection({ document, onBack, onDelete, showMessage }) {
  const [sharing, setSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);
  const [recipient, setRecipient] = useState('');

  const handleShare = async () => {
    if (!recipient) {
      showMessage('Digite um destinatário', 'error');
      return;
    }

    try {
      setSharing(true);
      const endpoint = shareMethod === 'email'
        ? `${API_BASE}/api/documents/${document.id}/share-email`
        : `${API_BASE}/api/documents/${document.id}/share-whatsapp`;

      const payload = shareMethod === 'email'
        ? { recipient }
        : { phoneNumber: recipient };

      await axios.post(endpoint, payload);
      showMessage(`✅ Compartilhado via ${shareMethod}!`, 'success');
      setRecipient('');
      setShareMethod(null);
    } catch (err) {
      showMessage(`Erro: ${err.response?.data?.error}`, 'error');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="section viewer-section">
      <button className="btn btn-secondary" onClick={onBack}>← Voltar</button>

      <div className="viewer-container">
        <div className="viewer-image">
          {document.file_path ? (
            <img
              src={`${SUPABASE_URL}/storage/v1/object/public/scans${document.file_path.split('scans')[1]}`}
              alt={document.filename}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23eee" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E📄 Imagem não disponível%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="no-image">📄 Sem imagem</div>
          )}
        </div>

        <div className="viewer-details">
          <h2>{document.filename}</h2>

          <div className="metadata">
            <div className="meta-item">
              <span className="label">Data:</span>
              <span>{new Date(document.scan_date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="meta-item">
              <span className="label">DPI:</span>
              <span>{document.dpi}</span>
            </div>
            <div className="meta-item">
              <span className="label">Confiança OCR:</span>
              <span>{(document.ocr_confidence * 100).toFixed(2)}%</span>
            </div>
            <div className="meta-item">
              <span className="label">Tamanho:</span>
              <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>

          <div className="ocr-content">
            <h3>📝 Texto OCR</h3>
            <div className="ocr-box">{document.ocr_text}</div>
          </div>

          {!shareMethod && (
            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={() => setShareMethod('email')}
              >
                📧 Compartilhar por Email
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShareMethod('whatsapp')}
              >
                💬 Compartilhar por WhatsApp
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('Deletar documento?')) {
                    axios.delete(`${API_BASE}/api/documents/${document.id}`)
                      .then(() => {
                        showMessage('✅ Deletado', 'success');
                        onDelete();
                      })
                      .catch(() => showMessage('Erro ao deletar', 'error'));
                  }
                }}
              >
                🗑️ Deletar
              </button>
            </div>
          )}

          {shareMethod && (
            <div className="share-dialog">
              <h3>
                {shareMethod === 'email' ? '📧 Email' : '💬 WhatsApp'}
              </h3>
              <input
                type="text"
                placeholder={shareMethod === 'email' ? 'seu@email.com' : '+5511999999999'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <div className="dialog-buttons">
                <button
                  className="btn btn-primary"
                  onClick={handleShare}
                  disabled={sharing}
                >
                  {sharing ? '⏳ Enviando...' : '✓ Enviar'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShareMethod(null)}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
