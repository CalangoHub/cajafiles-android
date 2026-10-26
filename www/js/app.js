/**
 * Caja Mobile - Gerenciador de Arquivos para Android
 * Inspirado na interface classica do Caja Desktop (MATE)
 */

(function () {
  'use strict';

  // Constante de persistencia local
  const STORAGE_KEY = 'caja_mobile_vfs_v1';
  const VIEW_MODE_KEY = 'caja_mobile_view_mode';

  // Sistema de Arquivos Virtual Inicial
  const defaultFileSystem = {
    '/': {
      name: 'Raiz',
      type: 'folder',
      path: '/',
      parent: null,
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento': {
      name: 'Armazenamento',
      type: 'folder',
      path: '/Armazenamento',
      parent: '/',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/SDCard': {
      name: 'SDCard',
      type: 'folder',
      path: '/SDCard',
      parent: '/',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Lixeira': {
      name: 'Lixeira',
      type: 'folder',
      path: '/Lixeira',
      parent: '/',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento/Documentos': {
      name: 'Documentos',
      type: 'folder',
      path: '/Armazenamento/Documentos',
      parent: '/Armazenamento',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento/Downloads': {
      name: 'Downloads',
      type: 'folder',
      path: '/Armazenamento/Downloads',
      parent: '/Armazenamento',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento/Imagens': {
      name: 'Imagens',
      type: 'folder',
      path: '/Armazenamento/Imagens',
      parent: '/Armazenamento',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento/Musicas': {
      name: 'Musicas',
      type: 'folder',
      path: '/Armazenamento/Musicas',
      parent: '/Armazenamento',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento/Videos': {
      name: 'Videos',
      type: 'folder',
      path: '/Armazenamento/Videos',
      parent: '/Armazenamento',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento/Documentos/leia-me.txt': {
      name: 'leia-me.txt',
      type: 'file',
      mime: 'text/plain',
      path: '/Armazenamento/Documentos/leia-me.txt',
      parent: '/Armazenamento/Documentos',
      size: 420,
      content: 'Bem-vindo ao Caja Mobile!\n\nEste e o gerenciador de arquivos com o visual nostalgico azul suave.\nVoce pode navegar, criar pastas, enviar arquivos do celular, recortar, copiar, colar e visualizar fotos, videos e textos com facilidade!',
      created: '2026-10-25 10:00',
      modified: '2026-10-25 10:00'
    },
    '/Armazenamento/Documentos/notas_projeto.txt': {
      name: 'notas_projeto.txt',
      type: 'file',
      mime: 'text/plain',
      path: '/Armazenamento/Documentos/notas_projeto.txt',
      parent: '/Armazenamento/Documentos',
      size: 185,
      content: '- Interface classica estilo Caja\n- Tema azul clarinho acolhedor\n- Totalmente responsivo no Android\n- Funciona offline',
      created: '2026-10-25 10:15',
      modified: '2026-10-25 10:15'
    },
    '/Armazenamento/Downloads/aplicativo.apk': {
      name: 'aplicativo.apk',
      type: 'file',
      mime: 'application/vnd.android.package-archive',
      path: '/Armazenamento/Downloads/aplicativo.apk',
      parent: '/Armazenamento/Downloads',
      size: 15420000,
      content: null,
      created: '2026-10-25 11:20',
      modified: '2026-10-25 11:20'
    },
    '/Armazenamento/Imagens/paisagem_ceu.svg': {
      name: 'paisagem_ceu.svg',
      type: 'file',
      mime: 'image/svg+xml',
      path: '/Armazenamento/Imagens/paisagem_ceu.svg',
      parent: '/Armazenamento/Imagens',
      size: 980,
      content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bce0f8"/><stop offset="100%" stop-color="#eaf4fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky)"/><circle cx="80" cy="80" r="40" fill="#ffd56b"/><path d="M0 240 Q100 180 200 240 T400 240 L400 300 L0 300 Z" fill="#69b37a"/><path d="M0 260 Q150 210 300 270 T400 280 L400 300 L0 300 Z" fill="#4d9960"/></svg>',
      created: '2026-10-25 11:30',
      modified: '2026-10-25 11:30'
    }
  };

  // Estado da Aplicacao
  let vfs = {};
  let currentPath = '/Armazenamento';
  let historyStack = [];
  let historyIndex = -1;
  let selectedItems = new Set();
  let clipboard = null; // { action: 'copy' | 'cut', items: [] }
  let viewMode = 'grid'; // 'grid' ou 'list'
  let currentSearchQuery = '';
  let activeSort = 'name-asc';

  // Elementos DOM
  const dom = {
    fileContainer: document.getElementById('file-container'),
    emptyState: document.getElementById('empty-state'),
    breadcrumbs: document.getElementById('caja-breadcrumbs'),
    pathInput: document.getElementById('caja-path-input'),
    pathInputWrap: document.getElementById('caja-path-input-container'),
    sidebar: document.getElementById('caja-sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    btnToggleMenu: document.getElementById('btn-toggle-menu'),
    btnCloseSidebar: document.getElementById('btn-close-sidebar'),
    btnHistoryBack: document.getElementById('btn-history-back'),
    btnHistoryForward: document.getElementById('btn-history-forward'),
    btnNavUp: document.getElementById('btn-nav-up'),
    btnNavHome: document.getElementById('btn-nav-home'),
    btnNavReload: document.getElementById('btn-nav-reload'),
    btnTogglePathMode: document.getElementById('btn-toggle-path-mode'),
    btnGoPath: document.getElementById('btn-go-path'),
    btnViewMode: document.getElementById('btn-view-mode'),
    iconViewGrid: document.getElementById('icon-view-grid'),
    iconViewList: document.getElementById('icon-view-list'),
    btnSearchToggle: document.getElementById('btn-search-toggle'),
    searchBar: document.getElementById('caja-search-bar'),
    inputSearch: document.getElementById('input-search'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    itemCount: document.getElementById('caja-item-count'),
    selectSort: document.getElementById('select-sort'),
    statusSelection: document.getElementById('status-selection-info'),
    statusFreeSpace: document.getElementById('status-free-space'),
    storagePercentage: document.getElementById('storage-percentage'),
    storageProgress: document.getElementById('storage-progress'),
    storageDetailsText: document.getElementById('storage-details-text'),
    // Botoes da barra inferior
    btnNewFolder: document.getElementById('act-new-folder'),
    btnUploadFile: document.getElementById('act-upload-file'),
    realFileInput: document.getElementById('real-file-input'),
    btnCopy: document.getElementById('act-copy'),
    btnCut: document.getElementById('act-cut'),
    btnPaste: document.getElementById('act-paste'),
    btnRename: document.getElementById('act-rename'),
    btnDelete: document.getElementById('act-delete'),
    btnProperties: document.getElementById('act-properties'),
    btnNewItemTop: document.getElementById('btn-new-item'),
    // Modais
    modalNewFolder: document.getElementById('modal-new-folder'),
    inputNewFolderName: document.getElementById('input-new-folder-name'),
    btnConfirmNewFolder: document.getElementById('btn-confirm-new-folder'),
    modalRename: document.getElementById('modal-rename'),
    inputRenameName: document.getElementById('input-rename-name'),
    btnConfirmRename: document.getElementById('btn-confirm-rename'),
    modalProperties: document.getElementById('modal-properties'),
    modalViewer: document.getElementById('modal-viewer'),
    viewerTitle: document.getElementById('viewer-title'),
    viewerBody: document.getElementById('viewer-body'),
    btnViewerDownload: document.getElementById('btn-viewer-download'),
    toast: document.getElementById('toast')
  };

  // =========================================================================
  // Inicializacao
  // =========================================================================
  function init() {
    loadFileSystem();
    loadPreferences();
    setupEventListeners();
    navigateTo(currentPath, false);
    updateStorageStatus();
  }

  function loadFileSystem() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        vfs = JSON.parse(saved);
      } else {
        vfs = JSON.parse(JSON.stringify(defaultFileSystem));
        saveFileSystem();
      }
    } catch (e) {
      console.warn('Erro ao carregar sistema de arquivos:', e);
      vfs = JSON.parse(JSON.stringify(defaultFileSystem));
    }
  }

  function saveFileSystem() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vfs));
      updateStorageStatus();
    } catch (e) {
      console.error('Falha ao salvar no armazenamento local:', e);
    }
  }

  function loadPreferences() {
    const savedMode = localStorage.getItem(VIEW_MODE_KEY);
    if (savedMode === 'list' || savedMode === 'grid') {
      viewMode = savedMode;
    }
    applyViewModeUI();
  }

  // =========================================================================
  // SVGs de Icones do Caja (Azul Clarinho / Classico)
  // =========================================================================
  function getIconSvg(item) {
    if (item.type === 'folder') {
      return `<svg viewBox="0 0 24 24" fill="#589fe0">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
      </svg>`;
    }

    const name = item.name.toLowerCase();
    if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.log')) {
      return `<svg viewBox="0 0 24 24" fill="#71a9da">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>`;
    }

    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.svg') || name.endsWith('.webp')) {
      return `<svg viewBox="0 0 24 24" fill="#38a3a5">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>`;
    }

    if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg') || name.endsWith('.m4a')) {
      return `<svg viewBox="0 0 24 24" fill="#8068d8">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>`;
    }

    if (name.endsWith('.mp4') || name.endsWith('.mkv') || name.endsWith('.webm') || name.endsWith('.avi')) {
      return `<svg viewBox="0 0 24 24" fill="#e07a5f">
        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
      </svg>`;
    }

    if (name.endsWith('.apk')) {
      return `<svg viewBox="0 0 24 24" fill="#60b378">
        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.99c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 4.26 6 6.01 6 8h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
      </svg>`;
    }

    if (name.endsWith('.zip') || name.endsWith('.tar') || name.endsWith('.gz') || name.endsWith('.rar')) {
      return `<svg viewBox="0 0 24 24" fill="#e59866">
        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z"/>
      </svg>`;
    }

    // Arquivo generico
    return `<svg viewBox="0 0 24 24" fill="#8cb9df">
      <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
    </svg>`;
  }

  // =========================================================================
  // Formatadores de Exibicao
  // =========================================================================
  function formatBytes(bytes) {
    if (bytes === 0 || bytes === null || bytes === undefined) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function getReadableDate(dateString) {
    if (!dateString) return '-';
    return dateString;
  }

  // =========================================================================
  // Navegacao e Historico
  // =========================================================================
  function navigateTo(targetPath, recordHistory = true) {
    // Garantir que a pasta exista
    if (!vfs[targetPath] || vfs[targetPath].type !== 'folder') {
      showToast('Caminho não encontrado: ' + targetPath);
      return;
    }

    if (recordHistory) {
      // Cortar pilha futura se navegou para novo local
      if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
      }
      historyStack.push(targetPath);
      historyIndex = historyStack.length - 1;
    }

    currentPath = targetPath;
    selectedItems.clear();
    currentSearchQuery = '';
    dom.inputSearch.value = '';

    updateHistoryButtons();
    renderBreadcrumbs();
    renderFileList();
    updateActionButtons();
    updateSidebarActiveState();

    // Ocultar barra lateral no mobile se estiver aberta
    closeSidebar();
  }

  function navigateHistory(delta) {
    const newIdx = historyIndex + delta;
    if (newIdx >= 0 && newIdx < historyStack.length) {
      historyIndex = newIdx;
      navigateTo(historyStack[historyIndex], false);
    }
  }

  function navigateUp() {
    if (currentPath === '/') return;
    const parentPath = vfs[currentPath] ? vfs[currentPath].parent : null;
    if (parentPath) {
      navigateTo(parentPath);
    } else {
      navigateTo('/');
    }
  }

  function updateHistoryButtons() {
    dom.btnHistoryBack.disabled = historyIndex <= 0;
    dom.btnHistoryForward.disabled = historyIndex >= historyStack.length - 1;
    dom.btnNavUp.disabled = currentPath === '/';
  }

  // =========================================================================
  // Breadcrumbs
  // =========================================================================
  function renderBreadcrumbs() {
    dom.breadcrumbs.innerHTML = '';
    dom.pathInput.value = currentPath;

    const parts = currentPath.split('/').filter(Boolean);
    let accumPath = '';

    // Botao Raiz /
    const rootBtn = document.createElement('button');
    rootBtn.className = 'breadcrumb-btn' + (currentPath === '/' ? ' active' : '');
    rootBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="#2d6898"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      <span>Raiz</span>
    `;
    rootBtn.addEventListener('click', () => navigateTo('/'));
    dom.breadcrumbs.appendChild(rootBtn);

    for (let i = 0; i < parts.length; i++) {
      accumPath += '/' + parts[i];
      const stepPath = accumPath;

      const sep = document.createElement('span');
      sep.className = 'breadcrumb-sep';
      sep.textContent = '>';
      dom.breadcrumbs.appendChild(sep);

      const btn = document.createElement('button');
      btn.className = 'breadcrumb-btn' + (currentPath === stepPath ? ' active' : '');
      btn.textContent = parts[i];
      btn.addEventListener('click', () => navigateTo(stepPath));
      dom.breadcrumbs.appendChild(btn);
    }

    // Scroll para a ponta do breadcrumb
    dom.breadcrumbs.scrollLeft = dom.breadcrumbs.scrollWidth;
  }

  // =========================================================================
  // Listagem de Arquivos
  // =========================================================================
  function getItemsInCurrentPath() {
    const list = [];
    for (const p in vfs) {
      const item = vfs[p];
      if (item.parent === currentPath) {
        // Filtrar por busca se ativa
        if (currentSearchQuery) {
          const match = item.name.toLowerCase().includes(currentSearchQuery.toLowerCase());
          if (!match) continue;
        }
        list.push(item);
      }
    }

    // Ordenacao
    list.sort((a, b) => {
      // Pastas primeiro no estilo Caja
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      switch (activeSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        case 'name-desc':
          return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
        case 'size-desc':
          return (b.size || 0) - (a.size || 0);
        case 'size-asc':
          return (a.size || 0) - (b.size || 0);
        case 'date-desc':
          return (b.modified || '').localeCompare(a.modified || '');
        case 'date-asc':
          return (a.modified || '').localeCompare(b.modified || '');
        default:
          return 0;
      }
    });

    return list;
  }

  function renderFileList() {
    const items = getItemsInCurrentPath();
    dom.fileContainer.innerHTML = '';

    if (items.length === 0) {
      dom.emptyState.classList.remove('hidden');
    } else {
      dom.emptyState.classList.add('hidden');
    }

    dom.itemCount.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;

    items.forEach(item => {
      const el = document.createElement('div');
      const isSelected = selectedItems.has(item.path);

      el.className = 'file-item' + (isSelected ? ' selected' : '');
      el.dataset.path = item.path;

      if (viewMode === 'grid') {
        el.innerHTML = `
          <div class="file-icon">${getIconSvg(item)}</div>
          <span class="file-name" title="${item.name}">${item.name}</span>
          <span class="file-size-sub">${item.type === 'folder' ? getFolderChildCount(item.path) + ' itens' : formatBytes(item.size)}</span>
        `;
      } else {
        el.innerHTML = `
          <div class="file-icon">${getIconSvg(item)}</div>
          <div class="file-info-col">
            <span class="file-name">${item.name}</span>
            <small style="color: var(--text-muted); font-size: 11px;">${item.type === 'folder' ? 'Pasta' : (item.mime || 'Arquivo')}</small>
          </div>
          <div class="file-meta-col">
            <span>${item.type === 'folder' ? getFolderChildCount(item.path) + ' itens' : formatBytes(item.size)}</span>
            <small>${item.modified || ''}</small>
          </div>
        `;
      }

      // Eventos de clique e toque duplo
      let lastTap = 0;
      el.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        lastTap = currentTime;

        if (tapLength < 300 && tapLength > 0) {
          // Duplo toque / duplo clique: Abrir
          openItem(item);
        } else {
          // Toque simples: Selecionar
          handleItemSelection(item, e.ctrlKey || e.metaKey);
        }
      });

      dom.fileContainer.appendChild(el);
    });

    updateSelectionText();
    updateActionButtons();
  }

  function getFolderChildCount(folderPath) {
    let count = 0;
    for (const p in vfs) {
      if (vfs[p].parent === folderPath) count++;
    }
    return count;
  }

  function handleItemSelection(item, multiSelect) {
    if (multiSelect) {
      if (selectedItems.has(item.path)) {
        selectedItems.delete(item.path);
      } else {
        selectedItems.add(item.path);
      }
    } else {
      if (selectedItems.size === 1 && selectedItems.has(item.path)) {
        // Deselecionar se clicar no mesmo
        selectedItems.clear();
      } else {
        selectedItems.clear();
        selectedItems.add(item.path);
      }
    }

    // Atualizar UI dos elementos selecionados
    document.querySelectorAll('.file-item').forEach(node => {
      const p = node.dataset.path;
      if (selectedItems.has(p)) {
        node.classList.add('selected');
      } else {
        node.classList.remove('selected');
      }
    });

    updateSelectionText();
    updateActionButtons();
  }

  function updateSelectionText() {
    if (selectedItems.size === 0) {
      dom.statusSelection.textContent = 'Nenhum item selecionado';
    } else if (selectedItems.size === 1) {
      const singlePath = Array.from(selectedItems)[0];
      const item = vfs[singlePath];
      if (item) {
        const sizeStr = item.type === 'folder' ? getFolderChildCount(item.path) + ' itens' : formatBytes(item.size);
        dom.statusSelection.textContent = `"${item.name}" selecionado (${sizeStr})`;
      }
    } else {
      dom.statusSelection.textContent = `${selectedItems.size} itens selecionados`;
    }
  }

  function updateActionButtons() {
    const hasSelection = selectedItems.size > 0;
    const isSingleSelection = selectedItems.size === 1;

    dom.btnCopy.disabled = !hasSelection;
    dom.btnCut.disabled = !hasSelection;
    dom.btnDelete.disabled = !hasSelection;
    dom.btnRename.disabled = !isSingleSelection;
    dom.btnProperties.disabled = !isSingleSelection;

    dom.btnPaste.disabled = !clipboard || clipboard.items.length === 0;
  }

  // =========================================================================
  // Abertura de Itens (Pastas / Visualizador de Arquivos)
  // =========================================================================
  function openItem(item) {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else {
      openFileViewer(item);
    }
  }

  function openFileViewer(item) {
    dom.viewerTitle.textContent = item.name;
    dom.viewerBody.innerHTML = '';
    const name = item.name.toLowerCase();

    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.svg') || name.endsWith('.webp')) {
      const img = document.createElement('img');
      if (item.content && item.content.startsWith('data:')) {
        img.src = item.content;
      } else if (item.content && item.content.startsWith('<svg')) {
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(item.content);
      } else {
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(getIconSvg(item));
      }
      dom.viewerBody.appendChild(img);
    } else if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.log') || name.endsWith('.json') || name.endsWith('.js') || name.endsWith('.html')) {
      const textarea = document.createElement('textarea');
      textarea.className = 'viewer-text-editor';
      textarea.value = item.content || '';
      textarea.addEventListener('input', () => {
        item.content = textarea.value;
        item.size = new Blob([item.content]).size;
        item.modified = getNowFormatted();
        saveFileSystem();
      });
      dom.viewerBody.appendChild(textarea);
    } else if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = item.content || '';
      dom.viewerBody.appendChild(audio);
    } else if (name.endsWith('.mp4') || name.endsWith('.webm')) {
      const video = document.createElement('video');
      video.controls = true;
      video.src = item.content || '';
      dom.viewerBody.appendChild(video);
    } else {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.color = '#ffffff';
      fallbackDiv.style.textAlign = 'center';
      fallbackDiv.innerHTML = `
        <div style="margin-bottom: 12px;">${getIconSvg(item)}</div>
        <h4>${item.name}</h4>
        <p style="color: #b0c9e0; font-size: 12px; margin-top: 6px;">Visualizador direto não disponível para este formato (${item.mime || 'binário'}).</p>
      `;
      dom.viewerBody.appendChild(fallbackDiv);
    }

    // Configurar botao de download
    dom.btnViewerDownload.onclick = () => {
      downloadFile(item);
    };

    openModal(dom.modalViewer);
  }

  function downloadFile(item) {
    let blob;
    if (item.content && item.content.startsWith('data:')) {
      const parts = item.content.split(',');
      const byteString = atob(parts[1]);
      const mime = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([ab], { type: mime });
    } else {
      blob = new Blob([item.content || ''], { type: item.mime || 'application/octet-stream' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Baixando ${item.name}...`);
  }

  // =========================================================================
  // Operacoes de Arquivo (Criar, Renomear, Excluir, Copiar, Colar)
  // =========================================================================
  function createNewFolder(name) {
    const cleanName = (name || 'Nova Pasta').trim();
    const newPath = currentPath === '/' ? `/${cleanName}` : `${currentPath}/${cleanName}`;

    if (vfs[newPath]) {
      showToast('Já existe um item com esse nome!');
      return false;
    }

    vfs[newPath] = {
      name: cleanName,
      type: 'folder',
      path: newPath,
      parent: currentPath,
      created: getNowFormatted(),
      modified: getNowFormatted()
    };

    saveFileSystem();
    renderFileList();
    showToast(`Pasta "${cleanName}" criada`);
    return true;
  }

  function renameItem(oldPath, newName) {
    const cleanName = newName.trim();
    if (!cleanName) return false;

    const item = vfs[oldPath];
    if (!item) return false;

    const parentPath = item.parent;
    const newPath = parentPath === '/' ? `/${cleanName}` : `${parentPath}/${cleanName}`;

    if (vfs[newPath] && newPath !== oldPath) {
      showToast('Já existe um item com esse nome!');
      return false;
    }

    // Se for pasta, atualizar recursivamente caminhos dos filhos
    if (item.type === 'folder') {
      const oldPrefix = oldPath + '/';
      const newPrefix = newPath + '/';

      const updatedEntries = {};
      for (const p in vfs) {
        if (p === oldPath) continue;
        if (p.startsWith(oldPrefix)) {
          const child = vfs[p];
          const newChildPath = newPrefix + p.slice(oldPrefix.length);
          const newChildParent = child.parent === oldPath ? newPath : (newPrefix + child.parent.slice(oldPrefix.length));
          child.path = newChildPath;
          child.parent = newChildParent;
          updatedEntries[newChildPath] = child;
          delete vfs[p];
        }
      }
      Object.assign(vfs, updatedEntries);
    }

    delete vfs[oldPath];
    item.name = cleanName;
    item.path = newPath;
    item.modified = getNowFormatted();
    vfs[newPath] = item;

    selectedItems.clear();
    selectedItems.add(newPath);

    saveFileSystem();
    renderFileList();
    showToast(`Item renomeado para "${cleanName}"`);
    return true;
  }

  function deleteSelectedItems() {
    if (selectedItems.size === 0) return;

    const itemsToDelete = Array.from(selectedItems);
    let deletedCount = 0;

    itemsToDelete.forEach(p => {
      const item = vfs[p];
      if (!item) return;

      // Se nao estiver na lixeira, movemos para lixeira
      if (currentPath !== '/Lixeira' && p !== '/Lixeira') {
        const destPath = `/Lixeira/${item.name}`;
        item.parent = '/Lixeira';
        item.path = destPath;
        delete vfs[p];
        vfs[destPath] = item;
      } else {
        // Exclusao permanente
        if (item.type === 'folder') {
          const prefix = p + '/';
          for (const childPath in vfs) {
            if (childPath.startsWith(prefix)) {
              delete vfs[childPath];
            }
          }
        }
        delete vfs[p];
      }
      deletedCount++;
    });

    selectedItems.clear();
    saveFileSystem();
    renderFileList();
    showToast(`${deletedCount} item(ns) removido(s)`);
  }

  function copySelectedItems(actionType) {
    if (selectedItems.size === 0) return;
    clipboard = {
      action: actionType, // 'copy' ou 'cut'
      items: Array.from(selectedItems)
    };
    updateActionButtons();
    showToast(`${clipboard.items.length} item(ns) para ${actionType === 'cut' ? 'recortar' : 'copiar'}`);
  }

  function pasteItems() {
    if (!clipboard || clipboard.items.length === 0) return;

    let successCount = 0;

    clipboard.items.forEach(sourcePath => {
      const sourceItem = vfs[sourcePath];
      if (!sourceItem) return;

      let targetName = sourceItem.name;
      let targetPath = currentPath === '/' ? `/${targetName}` : `${currentPath}/${targetName}`;

      // Se for acao de copia e ja existir no mesmo diretorio, cria copia com sufixo
      if (clipboard.action === 'copy' && vfs[targetPath]) {
        targetName = 'Cópia de ' + targetName;
        targetPath = currentPath === '/' ? `/${targetName}` : `${currentPath}/${targetName}`;
      }

      if (clipboard.action === 'cut') {
        // Mover
        delete vfs[sourcePath];
        sourceItem.path = targetPath;
        sourceItem.parent = currentPath;
        sourceItem.name = targetName;
        sourceItem.modified = getNowFormatted();
        vfs[targetPath] = sourceItem;

        // Se for pasta, mover os descendentes
        if (sourceItem.type === 'folder') {
          const oldPrefix = sourcePath + '/';
          const newPrefix = targetPath + '/';
          for (const p in vfs) {
            if (p.startsWith(oldPrefix)) {
              const child = vfs[p];
              const newChildPath = newPrefix + p.slice(oldPrefix.length);
              const newChildParent = child.parent === sourcePath ? targetPath : (newPrefix + child.parent.slice(oldPrefix.length));
              delete vfs[p];
              child.path = newChildPath;
              child.parent = newChildParent;
              vfs[newChildPath] = child;
            }
          }
        }
      } else {
        // Copiar
        const clonedItem = JSON.parse(JSON.stringify(sourceItem));
        clonedItem.name = targetName;
        clonedItem.path = targetPath;
        clonedItem.parent = currentPath;
        clonedItem.created = getNowFormatted();
        clonedItem.modified = getNowFormatted();
        vfs[targetPath] = clonedItem;
      }

      successCount++;
    });

    if (clipboard.action === 'cut') {
      clipboard = null;
    }

    saveFileSystem();
    renderFileList();
    showToast(`${successCount} item(ns) colado(s) com sucesso`);
  }

  // =========================================================================
  // Upload / Importar Arquivos do Celular
  // =========================================================================
  function handleFileImport(files) {
    if (!files || files.length === 0) return;

    let loaded = 0;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isText = file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md');

      reader.onload = function (e) {
        const filePath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
        vfs[filePath] = {
          name: file.name,
          type: 'file',
          mime: file.type || 'application/octet-stream',
          path: filePath,
          parent: currentPath,
          size: file.size,
          content: e.target.result,
          created: getNowFormatted(),
          modified: getNowFormatted()
        };

        loaded++;
        if (loaded === files.length) {
          saveFileSystem();
          renderFileList();
          showToast(`${loaded} arquivo(s) importado(s)!`);
        }
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  // =========================================================================
  // Janela de Propriedades (Estilo Caja MATE)
  // =========================================================================
  function showPropertiesModal() {
    if (selectedItems.size !== 1) return;
    const p = Array.from(selectedItems)[0];
    const item = vfs[p];
    if (!item) return;

    document.getElementById('prop-dialog-title').textContent = `Propriedades de ${item.name}`;
    document.getElementById('prop-name-input').value = item.name;
    document.getElementById('prop-name-input').disabled = true;
    document.getElementById('prop-icon-large').innerHTML = getIconSvg(item);
    document.getElementById('prop-mime-type').textContent = item.type === 'folder' ? 'Pasta de arquivos' : (item.mime || 'Arquivo');

    document.getElementById('prop-type-val').textContent = item.type === 'folder' ? 'Pasta' : (item.mime || 'Arquivo');
    document.getElementById('prop-items-val').textContent = item.type === 'folder' ? getFolderChildCount(item.path) + ' itens' : '1 arquivo';
    document.getElementById('prop-size-val').textContent = item.type === 'folder' ? '-' : `${formatBytes(item.size)} (${item.size || 0} bytes)`;
    document.getElementById('prop-path-val').textContent = item.path;
    document.getElementById('prop-date-val').textContent = item.modified || '-';

    openModal(dom.modalProperties);
  }

  // =========================================================================
  // Gerenciamento de Visualizacao e Tema
  // =========================================================================
  function toggleViewMode() {
    viewMode = viewMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
    applyViewModeUI();
    renderFileList();
  }

  function applyViewModeUI() {
    if (viewMode === 'grid') {
      dom.fileContainer.classList.add('grid-view');
      dom.fileContainer.classList.remove('list-view');
      dom.iconViewGrid.classList.remove('hidden');
      dom.iconViewList.classList.add('hidden');
    } else {
      dom.fileContainer.classList.remove('grid-view');
      dom.fileContainer.classList.add('list-view');
      dom.iconViewGrid.classList.add('hidden');
      dom.iconViewList.classList.remove('hidden');
    }
  }

  function updateStorageStatus() {
    let totalBytes = 0;
    for (const p in vfs) {
      if (vfs[p].size) totalBytes += vfs[p].size;
    }
    // Simula capacidade total de 10 GB
    const totalSimulated = 10 * 1024 * 1024 * 1024;
    const baseUsage = 3.5 * 1024 * 1024 * 1024; // Sistema Android base
    const currentTotalUsage = baseUsage + totalBytes;
    const pct = Math.min(100, Math.round((currentTotalUsage / totalSimulated) * 100));

    dom.storagePercentage.textContent = pct + '% usado';
    dom.storageProgress.style.width = pct + '%';
    const freeBytes = totalSimulated - currentTotalUsage;
    dom.storageDetailsText.textContent = `${formatBytes(freeBytes)} livres de 10 GB`;
    dom.statusFreeSpace.textContent = `Espaço Livre: ${formatBytes(freeBytes)}`;
  }

  function updateSidebarActiveState() {
    document.querySelectorAll('.place-item').forEach(el => {
      const p = el.dataset.path;
      if (p === currentPath) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  function openSidebar() {
    dom.sidebar.classList.add('open');
    dom.sidebarBackdrop.classList.remove('hidden');
  }

  function closeSidebar() {
    dom.sidebar.classList.remove('open');
    dom.sidebarBackdrop.classList.add('hidden');
  }

  // =========================================================================
  // Modais e Feedback
  // =========================================================================
  function openModal(modalEl) {
    modalEl.classList.remove('hidden');
  }

  function closeModal(modalEl) {
    modalEl.classList.add('hidden');
  }

  let toastTimer = null;
  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.remove('hidden');
    dom.toast.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dom.toast.style.opacity = '0';
      setTimeout(() => dom.toast.classList.add('hidden'), 200);
    }, 2400);
  }

  function getNowFormatted() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // =========================================================================
  // Configuracao dos Event Listeners
  // =========================================================================
  function setupEventListeners() {
    // Menu lateral
    dom.btnToggleMenu.addEventListener('click', openSidebar);
    dom.btnCloseSidebar.addEventListener('click', closeSidebar);
    dom.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Navegacao
    dom.btnHistoryBack.addEventListener('click', () => navigateHistory(-1));
    dom.btnHistoryForward.addEventListener('click', () => navigateHistory(1));
    dom.btnNavUp.addEventListener('click', navigateUp);
    dom.btnNavHome.addEventListener('click', () => navigateTo('/Armazenamento'));
    dom.btnNavReload.addEventListener('click', () => {
      loadFileSystem();
      renderFileList();
      showToast('Pasta recarregada');
    });

    // Alternador de modo de caminho
    dom.btnTogglePathMode.addEventListener('click', () => {
      const isInput = !dom.pathInputWrap.classList.contains('hidden');
      if (isInput) {
        dom.pathInputWrap.classList.add('hidden');
        dom.breadcrumbs.classList.remove('hidden');
      } else {
        dom.pathInputWrap.classList.remove('hidden');
        dom.breadcrumbs.classList.add('hidden');
        dom.pathInput.focus();
        dom.pathInput.select();
      }
    });

    dom.btnGoPath.addEventListener('click', () => {
      const target = dom.pathInput.value.trim();
      if (target) {
        navigateTo(target);
        dom.pathInputWrap.classList.add('hidden');
        dom.breadcrumbs.classList.remove('hidden');
      }
    });

    dom.pathInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        dom.btnGoPath.click();
      }
    });

    // Barra de Pesquisa
    dom.btnSearchToggle.addEventListener('click', () => {
      const isHidden = dom.searchBar.classList.contains('hidden');
      if (isHidden) {
        dom.searchBar.classList.remove('hidden');
        dom.inputSearch.focus();
      } else {
        dom.searchBar.classList.add('hidden');
        currentSearchQuery = '';
        renderFileList();
      }
    });

    dom.inputSearch.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      renderFileList();
    });

    dom.btnClearSearch.addEventListener('click', () => {
      dom.inputSearch.value = '';
      currentSearchQuery = '';
      renderFileList();
    });

    // Modo de exibicao
    dom.btnViewMode.addEventListener('click', toggleViewMode);

    // Ordenacao
    dom.selectSort.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderFileList();
    });

    // Lugares do Sidebar
    document.querySelectorAll('.place-item').forEach(item => {
      item.addEventListener('click', () => {
        const p = item.dataset.path;
        if (p) navigateTo(p);
      });
    });

    // Botoes de Acao
    dom.btnNewFolder.addEventListener('click', () => {
      dom.inputNewFolderName.value = 'Nova Pasta';
      openModal(dom.modalNewFolder);
      setTimeout(() => dom.inputNewFolderName.select(), 100);
    });

    dom.btnNewItemTop.addEventListener('click', () => {
      dom.btnNewFolder.click();
    });

    dom.btnConfirmNewFolder.addEventListener('click', () => {
      const success = createNewFolder(dom.inputNewFolderName.value);
      if (success) closeModal(dom.modalNewFolder);
    });

    dom.btnRename.addEventListener('click', () => {
      if (selectedItems.size !== 1) return;
      const p = Array.from(selectedItems)[0];
      const item = vfs[p];
      if (!item) return;

      dom.inputRenameName.value = item.name;
      openModal(dom.modalRename);
      setTimeout(() => dom.inputRenameName.select(), 100);
    });

    dom.btnConfirmRename.addEventListener('click', () => {
      if (selectedItems.size !== 1) return;
      const p = Array.from(selectedItems)[0];
      const success = renameItem(p, dom.inputRenameName.value);
      if (success) closeModal(dom.modalRename);
    });

    dom.btnDelete.addEventListener('click', deleteSelectedItems);
    dom.btnCopy.addEventListener('click', () => copySelectedItems('copy'));
    dom.btnCut.addEventListener('click', () => copySelectedItems('cut'));
    dom.btnPaste.addEventListener('click', pasteItems);
    dom.btnProperties.addEventListener('click', showPropertiesModal);

    // Upload / Importar
    dom.btnUploadFile.addEventListener('click', () => {
      dom.realFileInput.click();
    });

    dom.realFileInput.addEventListener('change', (e) => {
      handleFileImport(e.target.files);
      e.target.value = '';
    });

    // Ocultar modais pelos botoes [data-close]
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) closeModal(modal);
      });
    });

    // Abas de propriedades
    document.querySelectorAll('.prop-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        document.querySelectorAll('.prop-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.prop-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
      });
    });

    // Clique fora de itens limpa selecao
    dom.fileContainer.addEventListener('click', (e) => {
      if (e.target === dom.fileContainer) {
        selectedItems.clear();
        updateSelectionText();
        updateActionButtons();
        document.querySelectorAll('.file-item').forEach(n => n.classList.remove('selected'));
      }
    });
  }

  // Iniciar aplicacao
  window.addEventListener('DOMContentLoaded', () => {
    init();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW falhou:', err);
      });
    }
  });
})();
