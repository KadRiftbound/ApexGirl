// Security utilities
const Security = {
  // Sanitize HTML to prevent XSS
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Escape regex special characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  // Validate and sanitize input
  sanitizeInput(input, maxLength = 100) {
    if (typeof input !== 'string') return '';
    return input
      .slice(0, maxLength)
      .replace(/[<>\"'&]/g, '')
      .trim();
  },

  // Validate URL to prevent redirect attacks
  validateURL(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },

  // Validate numeric input
  sanitizeNumber(value, min = 0, max = Infinity) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  }
};

const App = {
  data: {
    artists: [],
    loading: true,
    currentPage: 1,
    itemsPerPage: 12,
    searchTerm: '',
    activeFilter: 'all'
  },

  async init() {
    this.setupNavigation();
    this.loadPageData();
    window.addEventListener('popstate', () => this.loadPageData());
  },

  setupNavigation() {
    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        history.pushState({}, '', href);
        this.loadPageData();
      });
    });
  },

  loadPageData() {
    const path = window.location.pathname;
    this.updateActiveNav(path);
    
    if (path === '/' || path.endsWith('index.html')) {
      this.loadHomePage();
    } else if (path.includes('/database/')) {
      this.loadDatabasePage();
    } else if (path.includes('/guides/')) {
      this.loadGuidesPage();
    } else if (path.includes('/tools/')) {
      this.loadToolsPage();
    }
  },

  updateActiveNav(path) {
    document.querySelectorAll('.nav a').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (path === href || (href !== '/' && path.includes(href))) {
        link.classList.add('active');
      }
    });
  },

  async loadHomePage() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <section class="hero">
        <div class="container">
          <h1>TopGirl / ApexGirl</h1>
          <p>Le fansite de référence pour le jeu de A3Games. Guides, base de données et outils pour dominer le jeu.</p>
          <a href="/database/" class="btn">Explorer la Base de Données</a>
        </div>
      </section>
      
      <div class="container main-content">
        <div class="ad-banner">ESPACE PUBLICITAIRE - 728x90</div>
        
        <section>
          <h2 class="section-title">Outils</h2>
          <p class="section-subtitle">Des outils exclusifs pour optimiser votre gameplay</p>
          
          <div class="grid grid-3">
            <a href="/tools/resource-calculator/" class="card">
              <div class="card-icon">🧮</div>
              <h3>Calculateur de Ressources</h3>
              <p>Calculez les ressources nécessaires pour vos builds et progressions.</p>
            </a>
            <a href="/database/artists.html" class="card">
              <div class="card-icon">🎨</div>
              <h3>Base des Artistes</h3>
              <p>Découvrez et notez tous les artistes du jeu.</p>
            </a>
            <a href="/guides/" class="card">
              <div class="card-icon">📖</div>
              <h3>Guides Détaillés</h3>
              <p>Des guides complets écrits par les meilleurs joueurs.</p>
            </a>
          </div>
        </section>

        <div class="ad-banner">ESPACE PUBLICITAIRE - 728x90</div>

        <section style="margin-top: 48px;">
          <h2 class="section-title">Guides Populaires</h2>
          <p class="section-subtitle">Les guides les plus consultés par la communauté</p>
          
          <div class="grid grid-2">
            <div class="card">
              <span class="badge badge-primary">Débutant</span>
              <h3>Guide de démarrage</h3>
              <p>Tout ce qu'il faut savoir pour bien commencer votre aventure.</p>
              <a href="/guides/beginner-guide.html">Lire le guide →</a>
            </div>
            <div class="card">
              <span class="badge badge-secondary">Avancé</span>
              <h3>Optimisation des builds</h3>
              <p>Comment maximiser l'efficacité de vos personnages.</p>
              <a href="/guides/build-optimization.html">Lire le guide →</a>
            </div>
          </div>
        </section>

        <div class="ad-banner">ESPACE PUBLICITAIRE - 728x90</div>
      </div>
    `;
  },

  async loadDatabasePage() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="container main-content">
        <h1 class="section-title">Base de Données</h1>
        <p class="section-subtitle">Explorez toutes les données du jeu</p>
        
        <div class="search-box">
          <input type="text" class="search-input" id="searchInput" placeholder="Rechercher un artiste, une carte, un objet...">
          <div class="filters">
            <button class="filter-btn active" data-filter="all">Tous</button>
            <button class="filter-btn" data-filter="artist">Artistes</button>
            <button class="filter-btn" data-filter="card">Cartes</button>
            <button class="filter-btn" data-filter="item">Objets</button>
          </div>
        </div>

        <div class="ad-banner">ESPACE PUBLICITAIRE - 728x90</div>

        <div class="data-grid" id="dataGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>

        <div class="pagination" id="pagination"></div>
      </div>
    `;

    this.setupDatabaseFilters();
    await this.loadArtistsData();
  },

  setupDatabaseFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.data.activeFilter = btn.dataset.filter;
        this.renderData();
      });
    });

    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.data.searchTerm = Security.sanitizeInput(e.target.value, 50).toLowerCase();
      this.data.currentPage = 1;
      this.renderData();
    });
  },

  async loadArtistsData() {
    try {
      const response = await fetch('/database/data/artists.json');
      this.data.artists = await response.json();
      this.renderData();
    } catch (error) {
      console.error('Erreur chargement données:', error);
      document.getElementById('dataGrid').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <p>Chargement des données...</p>
        </div>
      `;
    }
  },

  renderData() {
    const grid = document.getElementById('dataGrid');
    if (!grid) return;

    let filtered = this.data.artists;
    
    if (this.data.searchTerm) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(this.data.searchTerm) ||
        item.description?.toLowerCase().includes(this.data.searchTerm)
      );
    }

    if (this.data.activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === this.data.activeFilter);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <p>Aucun résultat trouvé</p>
        </div>
      `;
      return;
    }

    const start = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const paginated = filtered.slice(start, start + this.data.itemsPerPage);

    grid.innerHTML = paginated.map(item => `
      <div class="data-card">
        <div class="data-card-image">${this.getTypeIcon(item.type)}</div>
        <div class="data-card-content">
          <h3>${item.name || 'Inconnu'}</h3>
          <p class="meta">${item.description || 'Aucune description'}</p>
          ${item.rating ? `<span class="badge badge-primary">★ ${item.rating}</span>` : ''}
        </div>
      </div>
    `).join('');

    this.renderPagination(filtered.length);
  },

  getTypeIcon(type) {
    const icons = {
      artist: '🎨',
      card: '🃏',
      item: '🎁'
    };
    return icons[type] || '📦';
  },

  renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / this.data.itemsPerPage);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="${i === this.data.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    pagination.innerHTML = html;

    pagination.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.data.currentPage = parseInt(btn.dataset.page);
        this.renderData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  },

  async loadGuidesPage() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="container main-content">
        <h1 class="section-title">Guides</h1>
        <p class="section-subtitle">Des guides détaillés pour maîtriser le jeu</p>
        
        <div class="ad-banner">ESPACE PUBLICITAIRE - 728x90</div>

        <div class="grid grid-2">
          <div class="card">
            <span class="badge badge-primary">Débutant</span>
            <h3>Guide de démarrage</h3>
            <p>Tout ce qu'il faut savoir pour bien commencer votre aventure dans TopGirl.</p>
            <a href="/guides/beginner-guide.html">Lire le guide →</a>
          </div>
          <div class="card">
            <span class="badge badge-secondary">Avancé</span>
            <h3>Optimisation des builds</h3>
            <p>Comment maximiser l'efficacité de vos personnages avec les meilleurs builds.</p>
            <a href="/guides/build-optimization.html">Lire le guide →</a>
          </div>
          <div class="card">
            <span class="badge badge-primary">Personnages</span>
            <h3>Guide des personnages</h3>
            <p>Conoce todos los personajes y sus habilidades.</p>
            <a href="/guides/characters-guide.html">Lire le guide →</a>
          </div>
          <div class="card">
            <span class="badge badge-secondary">Ressources</span>
            <h3>Gestion des ressources</h3>
            <p>Comment efficacement farm et gérer vos ressources.</p>
            <a href="/guides/resources-management.html">Lire le guide →</a>
          </div>
        </div>

        <div class="ad-banner">ESPACE PUBLICITAIRE - 728x90</div>
      </div>
    `;
  },

  async loadToolsPage() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="container main-content">
        <h1 class="section-title">Outils</h1>
        <p class="section-subtitle">Des outils exclusifs pour optimiser votre gameplay</p>
        
        <div class="tabs">
          <button class="tab active" data-tab="calculator">Calculateur de Ressources</button>
          <button class="tab" data-tab="artists">Visualiseur d'Artistes</button>
        </div>

        <div id="toolContent">
          <div class="tool-section">
            <h2>Calculateur de Ressources</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">Calculez les ressources nécessaires pour vos builds.</p>
            
            <div class="tool-form">
              <div class="form-group">
                <label>Niveau cible</label>
                <input type="number" id="targetLevel" min="1" max="100" value="50">
              </div>
              <div class="form-group">
                <label>Type de progression</label>
                <select id="progressionType">
                  <option value="character">Personnage</option>
                  <option value="weapon">Arme</option>
                  <option value="equipment">Équipement</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nombre d'unités à upgrade</label>
                <input type="number" id="unitCount" min="1" value="1">
              </div>
              <button class="btn btn-primary" onclick="App.calculateResources()">Calculer</button>
            </div>

            <div class="result-box" id="resultBox" style="display: none;">
              <h3 style="margin-bottom: 16px;">Résultats</h3>
              <div id="results"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupToolTabs();
  },

  setupToolTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const toolContent = document.getElementById('toolContent');
        if (tab.dataset.tab === 'calculator') {
          toolContent.innerHTML = `
            <div class="tool-section">
              <h2>Calculateur de Ressources</h2>
              <p style="color: var(--text-muted); margin-bottom: 24px;">Calculez les ressources nécessaires pour vos builds.</p>
              <div class="tool-form">
                <div class="form-group">
                  <label>Niveau cible</label>
                  <input type="number" id="targetLevel" min="1" max="100" value="50">
                </div>
                <div class="form-group">
                  <label>Type de progression</label>
                  <select id="progressionType">
                    <option value="character">Personnage</option>
                    <option value="weapon">Arme</option>
                    <option value="equipment">Équipement</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Nombre d'unités à upgrade</label>
                  <input type="number" id="unitCount" min="1" value="1">
                </div>
                <button class="btn btn-primary" onclick="App.calculateResources()">Calculer</button>
              </div>
              <div class="result-box" id="resultBox" style="display: none;">
                <h3 style="margin-bottom: 16px;">Résultats</h3>
                <div id="results"></div>
              </div>
            </div>
          `;
        } else if (tab.dataset.tab === 'artists') {
          toolContent.innerHTML = `
            <div class="tool-section">
              <h2>Visualiseur d'Artistes</h2>
              <p style="color: var(--text-muted); margin-bottom: 24px;">Parcourir et noter les artistes du jeu.</p>
              <div class="search-box">
                <input type="text" class="search-input" id="artistSearch" placeholder="Rechercher un artiste...">
              </div>
              <div class="data-grid" id="artistGrid">
                <div class="loading"><div class="spinner"></div></div>
              </div>
            </div>
          `;
          this.loadArtistsForTools();
        }
      });
    });
  },

  calculateResources() {
    const level = parseInt(document.getElementById('targetLevel').value);
    const type = document.getElementById('progressionType').value;
    const count = parseInt(document.getElementById('unitCount').value);
    
    const costs = {
      character: { gold: level * 100, exp: level * 50, materials: level * 10 },
      weapon: { gold: level * 150, exp: level * 30, materials: level * 15 },
      equipment: { gold: level * 120, exp: level * 40, materials: level * 12 }
    };

    const base = costs[type];
    const multiplier = count;

    const results = [
      { label: 'Or', value: (base.gold * multiplier).toLocaleString() },
      { label: 'EXP', value: (base.exp * multiplier).toLocaleString() },
      { label: 'Matériaux', value: (base.materials * multiplier).toLocaleString() },
      { label: 'Temps estimé', value: `${Math.ceil(level * count / 10)} minutes` }
    ];

    document.getElementById('resultBox').style.display = 'block';
    document.getElementById('results').innerHTML = results.map(r => `
      <div class="result-item">
        <span class="label">${r.label}</span>
        <span class="value">${r.value}</span>
      </div>
    `).join('');
  },

  async loadArtistsForTools() {
    const grid = document.getElementById('artistGrid');
    if (!grid) return;

    try {
      const response = await fetch('/database/data/artists.json');
      const artists = await response.json();
      
      grid.innerHTML = artists.slice(0, 12).map(artist => `
        <div class="data-card">
          <div class="data-card-image">🎨</div>
          <div class="data-card-content">
            <h3>${artist.name || 'Inconnu'}</h3>
            <p class="meta">${artist.description || 'Aucune description'}</p>
            ${artist.rating ? `<span class="badge badge-primary">★ ${artist.rating}</span>` : ''}
          </div>
        </div>
      `).join('');
    } catch (error) {
      grid.innerHTML = `
        <div class="empty-state">
          <p>Erreur lors du chargement des artistes</p>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
