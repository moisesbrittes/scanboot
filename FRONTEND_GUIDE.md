# 🎨 Frontend React - Scanner OCR

## ✅ Componentes Implementados

### 1️⃣ Seção Upload
- 📤 Upload de imagens (JPG, PNG, TIFF, PDF)
- ⏳ Barra de progresso em tempo real
- 🧠 OCR automático com Tesseract
- 📊 Exibição de confiança e texto extraído
- 🎯 Pré-visualização de imagem

### 2️⃣ Seção Lista
- 📋 Grid responsivo de documentos
- 🔍 Busca por OCR e nome de arquivo
- 🏷️ Filtros por confiança
- 📅 Ordenação por data
- 🖼️ Miniaturas de documentos
- 🗑️ Delete rápido
- 🔄 Atualizar em tempo real

### 3️⃣ Seção Visualizador
- 👁️ Visualização de imagem em tamanho completo
- 📝 Exibição de texto OCR completo
- 📊 Metadados (DPI, tamanho, confiança, data)
- 📧 Compartilhamento por Email
- 💬 Compartilhamento por WhatsApp
- 🗑️ Deletar documento

---

## 🎨 Design Features

### Responsivo
✅ Desktop (1400px+)
✅ Tablet (768px - 1024px)
✅ Mobile (< 480px)

### Moderno
✅ Gradient backgrounds
✅ Smooth animations
✅ Hover effects
✅ Dark/Light optimizado
✅ Acessibilidade

### Performance
✅ Lazy loading de imagens
✅ Paginação automática
✅ Busca otimizada
✅ WebSocket real-time

---

## 🚀 Como Usar

### Setup
```bash
cd C:\Users\grf\OneDrive\Documentos\scanboot

# Backend já está rodando em http://localhost:3001
npm run dev  # Se quiser usar Vite para hot reload
```

### Acessar Frontend
O frontend usa **React com Vite**. Pode ser:

**Opção 1: Via HTML direto** (mais rápido)
1. Abra o arquivo em um navegador
2. Acesse: `index.html` (se existir)

**Opção 2: Via Vite dev server**
```bash
npm run dev  # Inicia em http://localhost:5173
```

**Opção 3: Build para produção**
```bash
npm run build
# Arquivos em: dist/
```

### Estrutura de Arquivos
```
scanboot/
├── App.jsx           # Componente principal
├── App.css           # Estilos modernos
├── index.html        # (Vite)
├── main.jsx          # (Vite entry point)
├── package.json
└── vite.config.js
```

---

## 📝 Funcionalidades em Detalhes

### Upload + OCR
1. Clique em "📤 Upload"
2. Selecione uma imagem
3. Visualize pré-visualização
4. Clique "🚀 Fazer Upload + OCR"
5. Aguarde processamento
6. Veja resultado do OCR

**Tempo aproximado:** 5-10 segundos

### Buscar Documentos
1. Clique em "📋 Documentos"
2. Use barra de busca para filtrar
3. Procura em: OCR text + filename
4. Resultados em tempo real

### Visualizar Documento
1. Clique em "Ver" no card de documento
2. Imagem expandida à esquerda
3. Metadados e texto à direita
4. Opções: Compartilhar ou Deletar

### Compartilhar
1. Visualize documento
2. Clique "📧 Email" ou "💬 WhatsApp"
3. Digite destinatário
4. Clique "✓ Enviar"

**Nota:** Requer configuração de Twilio e Gmail no `.env`

---

## 🔧 Variáveis de Ambiente

```env
REACT_APP_API_BASE=http://localhost:3001
REACT_APP_SUPABASE_URL=https://elgkzvhsvgadefwvwyol.supabase.co
REACT_APP_SUPABASE_KEY=eyJhbGc...
```

---

## 🎯 Customizações Possíveis

### Cores
Edite em `App.css`:
```css
:root {
  --primary: #4f46e5;        /* Azul */
  --danger: #ef4444;         /* Vermelho */
  --success: #10b981;        /* Verde */
}
```

### Layout
- Mude `grid-template-columns` em `.documents-grid`
- Ajuste `max-width` em `.content`
- Altere espaçamento em `padding/gap`

### Animações
Toda animação usa `transition: all 0.3s` - pode aumentar/diminuir

---

## 🧪 Testes

### Teste Manual Upload
1. Tire screenshot da tela
2. Faça upload da imagem
3. Verifique OCR
4. Abra em Visualizador
5. Teste compartilhamento

### Teste Busca
1. Faça 3+ uploads
2. Busque por palavra específica
3. Verifique filtros funcionam

### Teste Responsivo
1. Abra DevTools (F12)
2. Use device toolbar
3. Teste em: Mobile, Tablet, Desktop

---

## 📊 Performance Esperada

| Ação | Tempo |
|------|-------|
| Upload + OCR | 5-10s |
| Busca | <500ms |
| Load lista | <1s |
| Visualizar | <500ms |
| Compartilhar | 2-5s |

---

## ❌ Troubleshooting

### "API não responde"
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/health
```

### "Imagem não carrega"
- Verificar URL do Supabase no console
- Validar credenciais SUPABASE_KEY

### "Upload falha"
- Verificar tamanho do arquivo (<100MB)
- Checar formato (JPG, PNG, TIFF, PDF)
- Ver erro no console (F12)

### "OCR vazio"
- Imagem muito pequena/borrada?
- Tesseract.js pode precisar setup adicional
- Checar console para erros

---

## 🚀 Deploy Frontend

### Vercel (Recomendado)
```bash
# 1. Build
npm run build

# 2. Deploy (Vercel)
vercel --prod

# 3. Update .env com URL de produção
REACT_APP_API_BASE=https://api.seudominio.com
```

### Netlify
```bash
# 1. Build
npm run build

# 2. Deploy (conectar GitHub ou upload dist/)
# Drag and drop 'dist' folder
```

### GitHub Pages
```bash
npm run build
# Push 'dist' folder para gh-pages branch
```

---

## 📚 Tecnologias

- **React 18** - UI Framework
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Estilos modernos
- **Supabase JS** - Backend integration
- **WebSocket** - Real-time updates

---

## ✨ Próximas Melhorias

- [ ] Adicionar Dark Mode
- [ ] Implementar offline mode
- [ ] PWA (Progressive Web App)
- [ ] Integração com Google Drive
- [ ] Histórico de compartilhamentos
- [ ] Filtros avançados
- [ ] Edição de OCR
- [ ] Exportar PDF/Excel
- [ ] Múltiplos usuários/permissões
- [ ] Analytics

---

**Frontend pronto para produção! 🎉**
