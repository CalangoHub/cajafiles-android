# Caja Mobile - Gerenciador de Arquivos para Android

Um gerenciador de arquivos inspirado na consagrada interface do **Caja Desktop (MATE)**, adaptado para telas de toque no **Android**, com tema em tom de **azul clarinho suave e nostálgico** dos anos 2000.

---

## 🌟 Características

- **Interface Clássica Estilo Caja**:
  - Barra de localização com migalhas de pão (*breadcrumbs*) navegáveis por toque e modo de entrada manual de caminho direto.
  - Barra de ferramentas completa: Voltar, Avançar, Subir nível, Início (*Home*) e Atualizar.
  - Alternância de visualização entre **Grade de Ícones** e **Lista Detalhada** (Nome, Tamanho, Tipo, Data).
  - Gaveta lateral (*Sidebar*) retrátil com atalhos rápidos de Lugares (*Armazenamento Interno*, *Cartão SD*, *Documentos*, *Downloads*, *Imagens*, *Músicas*, *Vídeos* e *Lixeira*).
  - Medidor de uso de memória do sistema em tempo real.
- **Operações Completas de Arquivo**:
  - Criar novas pastas.
  - Importar e enviar arquivos reais do dispositivo móvel.
  - Copiar, Recortar e Colar (*clipboard* interno com preservação de estrutura).
  - Renomear itens.
  - Lixeira e exclusão definitiva.
  - Janela de Propriedades clássica com abas de Informações Básicas e Permissões do sistema (0755 / Leitura, Gravação e Execução).
  - Busca e filtro instantâneo por texto.
- **Visualizadores e Leitores Embutidos**:
  - Visualizador de fotos e gráficos (PNG, JPG, SVG, WEBP).
  - Reprodutor de áudio e vídeo (MP3, WAV, MP4, etc.).
  - Editor e visualizador de notas de texto e código.
- **Tema Visual Azul Clarinho Nostálgico**:
  - Tons suaves e serenos de azul céu e azul gelo, botões táteis confortáveis e acabamento elegante.
- **Pronto para Android**:
  - Estruturado com **Capacitor** para geração nativa de APK e projeto Gradle pronto em `android/`.
  - Suporta também instalação como aplicativo PWA offline com Service Worker e manifesto.

---

## 📂 Estrutura do Projeto

```
cajafiles-android/
├── android/                 # Projeto nativo Android (Gradle / Android Studio)
│   ├── app/
│   │   └── src/main/AndroidManifest.xml
│   └── build.gradle
├── www/                     # Aplicação Web / Mobile
│   ├── css/
│   │   └── style.css        # Tema azul clarinho e estilo visual Caja
│   ├── js/
│   │   └── app.js           # Lógica do gerenciador de arquivos e navegação
│   ├── assets/
│   │   └── icon.svg         # Ícone oficial
│   ├── index.html           # Estrutura principal
│   ├── manifest.json        # Manifesto PWA
│   └── sw.js                # Service Worker para modo offline
├── capacitor.config.json    # Configurações do Capacitor
└── package.json             # Dependências e rotinas de execução
```

---

## 🚀 Como Executar e Testar

### 1. Teste no Navegador / Emulador Web
Para abrir rapidamente no navegador ou na rede local:
```bash
cd /run/media/calango/pichall-SDA/projetos/cajafiles-android
npm run dev
```
Acesse `http://localhost:3000` no seu navegador ou pelo IP da sua máquina no celular conectado à mesma rede Wi-Fi.

### 2. Sincronizar Alterações com o Android
Sempre que fizer modificações na pasta `www/`, sincronize com a pasta nativa Android:
```bash
npm run sync
```

### 3. Abrir no Android Studio
Para compilar, testar no emulador Android ou gerar o APK assinado:
```bash
npm run open:android
```
Ou abra a pasta `/run/media/calango/pichall-SDA/projetos/cajafiles-android/android` diretamente no Android Studio.
