const CATEGORIES = {
  perfumes: { name: 'Perfumes', kicker: 'A arte de deixar uma impressão', description: 'Fragrâncias para diferentes momentos, estilos e formas de expressão.', image: 'l-eau-de-lily-blanche-desodorante-colonia-75ml' },
  presentes: { name: 'Kits e presentes', kicker: 'Para transformar um gesto em memória', description: 'Conjuntos prontos para escolher com carinho e presentear.', image: 'kit-presente-especial-malbec-3-itens' },
  maquiagem: { name: 'Maquiagem', kicker: 'Pequenos gestos, muitas possibilidades', description: 'Paletas e cores para compor a beleza do seu jeito.', image: 'paleta-de-sombra-niina-secrets-neutrals-5-6g' },
  cuidados: { name: 'Corpo e banho', kicker: 'Tempo para cuidar de você', description: 'Texturas e aromas para os rituais de todos os dias.', image: 'locao-aveludada-desodorante-corporal-nativa-spa-cereja-rouge-400ml' },
  skincare: { name: 'Skincare', kicker: 'Cuidado em cada detalhe', description: 'Uma pequena seleção de cuidados para a pele.', image: 'lancome-absolue-revitalisant-eye-cream-firming-eye-area-and-reducing-fine-lines-0-7oz-20ml' },
  acessorios: { name: 'Acessórios', kicker: 'Os detalhes fazem parte', description: 'Itens de apoio à sua rotina de beleza.', image: '1pcs-silver-handle-nail-dust-brush-large-soft-bristle-manicure-cleanup-brush-professional-nail-art-tool-for-acrylic' },
  todos: { name: 'Todos os produtos', kicker: 'Explore a seleção', description: 'Perfumes, maquiagem, presentes e cuidados em um só lugar.' },
};

const FEATURED = [
  'l-eau-de-lily-blanche-desodorante-colonia-75ml',
  'kit-presente-especial-malbec-3-itens',
  'paleta-de-sombra-niina-secrets-neutrals-5-6g',
  'locao-aveludada-desodorante-corporal-nativa-spa-cereja-rouge-400ml',
];
const PERFUME_EDIT = [
  'l-eau-de-lily-blanche-desodorante-colonia-75ml',
  'malbec-20-anos-desodorante-colonia-100ml',
  'zaad-venture-eau-de-parfum-95ml',
  'body-splash-desodorante-colonia-cereja-de-fases-200ml',
];
const SHORT_NAMES = {
  'l-eau-de-lily-blanche-desodorante-colonia-75ml': 'L’Eau de Lily Blanche Colônia 75ml',
  'kit-presente-especial-malbec-3-itens': 'Kit Presente Malbec · 3 itens',
  'paleta-de-sombra-niina-secrets-neutrals-5-6g': 'Paleta Niina Secrets Neutrals 5,6g',
  'locao-aveludada-desodorante-corporal-nativa-spa-cereja-rouge-400ml': 'Loção Nativa SPA Cereja Rouge 400ml',
};

const icons = {
  search: '<circle cx="11" cy="11" r="6.75"/><path d="m16.2 16.2 4.3 4.3"/>',
  bag: '<path d="M4.5 8h15l-1.2 12h-12L4.5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  menu: '<path d="M3 7h18M3 12h18M3 17h18"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  arrow: '<path d="M4 12h16M13 5l7 7-7 7"/>',
  left: '<path d="m14 5-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  spark: '<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10Z"/>',
};
const icon = (name, size = 22) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const niceName = p => SHORT_NAMES[p.handle] || p.title;
const image = (p, index = 0) => p?.images[index] || p?.images[0] || '';
const productByHandle = handle => catalog.find(p => p.handle === handle);
const categoryName = key => CATEGORIES[key]?.name || 'Beleza';
const shopDate = iso => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso));

let catalog = [];
let catalogInfo = {};
let cart = loadCart();
let state = { brand: new Set(), maxPrice: 'all', sort: 'featured', gallery: 0, qty: 1, selectedVariant: null, menu: false, search: false, drawer: false, filters: false };
let toastTimer;

function loadCart() {
  try { return JSON.parse(localStorage.getItem('afrodite-demo-cart-v1')) || []; }
  catch { return []; }
}
function saveCart() { localStorage.setItem('afrodite-demo-cart-v1', JSON.stringify(cart)); }
function cartLines() { return cart.map(line => ({ ...line, product: productByHandle(line.handle) })).filter(line => line.product); }
function countCart() { return cartLines().reduce((sum, line) => sum + line.quantity, 0); }
function cartTotal() { return cartLines().reduce((sum, line) => sum + line.quantity * line.product.price, 0); }
function route() {
  const raw = location.hash.slice(1) || '/';
  const question = raw.indexOf('?');
  const pathname = question < 0 ? raw : raw.slice(0, question);
  const params = new URLSearchParams(question < 0 ? '' : raw.slice(question + 1));
  const parts = pathname.split('/').filter(Boolean);
  return { type: parts[0] || 'home', slug: decodeURIComponent(parts.slice(1).join('/')), params };
}
function go(hash) { if (location.hash === hash) onRoute(); else location.hash = hash; }
function onRoute() {
  state.brand.clear(); state.maxPrice = 'all'; state.sort = 'featured'; state.gallery = 0;
  state.qty = 1; state.selectedVariant = null; state.menu = false; state.search = false;
  state.drawer = false; state.filters = false;
  render(); window.scrollTo({ top: 0, behavior: 'instant' });
}
function notice(message) {
  const el = document.getElementById('toast');
  el.innerHTML = `${icon('check', 18)}<span>${escapeHtml(message)}</span>`;
  el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3300);
}

function header() {
  const links = [
    ['perfumes', 'Perfumes'], ['maquiagem', 'Maquiagem'], ['presentes', 'Kits e presentes'],
    ['cuidados', 'Corpo e banho'], ['skincare', 'Skincare'],
  ];
  return `<div class="demo-strip"><span class="demo-dot"></span> Demonstração visual <span class="strip-divider">—</span> compras desabilitadas</div>
    <header class="site-header">
      <div class="header-main container-wide">
        <button class="icon-button mobile-menu-trigger" type="button" data-action="menu-open" aria-label="Abrir menu">${icon('menu')}</button>
        <a class="wordmark" href="#/" aria-label="Afrodite Beleza e Cuidado, início"><span>AFRODITE</span><small>BELEZA & CUIDADO</small></a>
        <div class="header-actions">
          <button class="icon-button" type="button" data-action="search-open" aria-label="Buscar produtos">${icon('search')}</button>
          <a class="icon-button cart-icon" href="#/carrinho" aria-label="Carrinho, ${countCart()} ${countCart() === 1 ? 'item' : 'itens'}">${icon('bag')}<span class="cart-count">${countCart()}</span></a>
        </div>
      </div>
      <nav class="desktop-nav" aria-label="Categorias principais"><div class="container-wide nav-inner">
        <a href="#/colecao/todos">Explorar tudo</a>${links.map(([key, label]) => `<a href="#/colecao/${key}">${label}</a>`).join('')}
        <a href="#/sobre">A Afrodite</a>
      </div></nav>
    </header>`;
}

function footer() {
  return `<footer class="footer"><div class="container-wide footer-top">
      <div class="footer-brand"><a class="wordmark wordmark-light" href="#/"><span>AFRODITE</span><small>BELEZA & CUIDADO</small></a><p>Uma seleção multimarcas de perfumes, presentes, maquiagem e cuidados pessoais.</p><span class="footer-demo">Conceito visual para avaliação · sem vendas nesta demo</span></div>
      <div class="footer-col"><h3>Descubra</h3><a href="#/colecao/perfumes">Perfumes</a><a href="#/colecao/presentes">Kits e presentes</a><a href="#/colecao/maquiagem">Maquiagem</a><a href="#/colecao/cuidados">Corpo e banho</a><a href="#/colecao/skincare">Skincare</a></div>
      <div class="footer-col"><h3>Afrodite</h3><a href="#/sobre">Sobre esta proposta</a><a href="#/atendimento">Atendimento e informações</a><a href="#/colecao/todos">Todos os produtos</a><a href="#/carrinho">Carrinho demonstrativo</a></div>
      <div class="footer-col"><h3>Informações verificadas</h3><a href="https://afroditebelezaecuidado.com/pages/contact" target="_blank" rel="noopener noreferrer">Contato da loja publicada ↗</a><a href="https://afroditebelezaecuidado.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">Política de privacidade ↗</a><p>Frete, trocas e pagamento não são processados nesta demonstração.</p></div>
    </div><div class="container-wide footer-bottom"><span>© ${new Date().getFullYear()} Afrodite Beleza e Cuidado · demonstração independente</span><span>Catálogo público consultado em ${shopDate(catalogInfo.capturedAt)}</span></div></footer>`;
}

function productCard(p, { compact = false } = {}) {
  if (!p) return '';
  const sale = p.compareAt && p.compareAt > p.price;
  return `<article class="product-card ${compact ? 'product-card-compact' : ''}">
    <a class="product-image-wrap" href="#/produto/${encodeURIComponent(p.handle)}" aria-label="Ver ${escapeHtml(p.title)}">
      ${sale ? '<span class="product-tag">Oferta</span>' : ''}
      <img src="${escapeHtml(image(p))}" alt="${escapeHtml(p.title)}" loading="lazy" decoding="async">
      <span class="card-view">Conhecer produto ${icon('arrow', 17)}</span>
    </a>
    <div class="product-card-details"><div class="product-brand">${escapeHtml(p.brand || 'Marca não informada')}</div>
      <h3><a href="#/produto/${encodeURIComponent(p.handle)}" title="${escapeHtml(p.title)}">${escapeHtml(niceName(p))}</a></h3>
      <div class="card-prices"><strong>${money(p.price)}</strong>${sale ? `<del>${money(p.compareAt)}</del>` : ''}</div>
    </div>
  </article>`;
}

function sectionHeading(kicker, title, action = '') {
  return `<div class="section-heading"><div><span class="eyebrow">${escapeHtml(kicker)}</span><h2>${title}</h2></div>${action}</div>`;
}

function categoryCard(key, index) {
  const c = CATEGORIES[key]; const p = productByHandle(c.image);
  return `<a class="category-card category-card-${index + 1}" href="#/colecao/${key}">
    <div class="category-visual"><img src="${escapeHtml(image(p))}" alt="" loading="lazy"></div>
    <div class="category-caption"><span>${catalog.filter(p => p.available && p.category === key).length} produtos</span><h3>${escapeHtml(c.name)}</h3><span class="round-arrow">${icon('arrow', 20)}</span></div>
  </a>`;
}

function home() {
  const heroProduct = productByHandle(FEATURED[0]);
  const featureItems = FEATURED.map(productByHandle).filter(Boolean);
  const fragranceItems = PERFUME_EDIT.map(productByHandle).filter(Boolean);
  return `<main id="main-content">
    <section class="hero container-wide" aria-labelledby="hero-title">
      <div class="hero-copy"><span class="eyebrow"><span class="little-star">✳</span> AFRODITE BELEZA & CUIDADO</span>
        <h1 id="hero-title">O encanto de <em>escolher bem.</em></h1>
        <p>Perfumes, maquiagem e cuidados para descobrir. Presentes para tornar o momento ainda mais especial.</p>
        <div class="hero-actions"><a class="button button-dark" href="#/colecao/todos">Explorar a seleção ${icon('arrow', 18)}</a><a class="text-link" href="#/colecao/presentes">Encontrar um presente ${icon('arrow', 16)}</a></div>
        <div class="hero-index"><span class="fine-line"></span> UMA SELEÇÃO MULTIMARCAS</div>
      </div>
      <div class="hero-visual"><img class="hero-editorial" src="assets/products/l-eau-de-lily-blanche-desodorante-colonia-75ml-2.webp" alt="L’Eau de Lily Blanche em uma fotografia do catálogo da Afrodite" width="1000" height="1029" fetchpriority="high">
        <div class="hero-product-note"><img src="${escapeHtml(image(heroProduct))}" alt="${escapeHtml(heroProduct.title)}"><div><span>EM DESTAQUE</span><strong>${escapeHtml(niceName(heroProduct))}</strong><small>${money(heroProduct.price)}</small></div><a href="#/produto/${heroProduct.handle}" aria-label="Ver produto em destaque">${icon('arrow', 18)}</a></div>
      </div>
    </section>
    <div class="intro-line container-wide"><span>ESCOLHAS PARA VOCÊ</span><p>Uma curadoria que vai do perfume favorito ao presente que faz lembrar.</p><span>${catalog.filter(p => p.available).length} PRODUTOS</span></div>
    <section class="section-space container-wide" aria-labelledby="categories-title">
      ${sectionHeading('ENCONTRE O SEU CAMINHO', '<span id="categories-title">Explore por categoria</span>', '<a class="section-link" href="#/colecao/todos">Ver todos os produtos '+icon('arrow', 18)+'</a>')}
      <div class="category-grid">${['perfumes', 'presentes', 'maquiagem', 'cuidados'].map(categoryCard).join('')}</div>
      <a class="quiet-category-link" href="#/colecao/skincare">Descobrir também a seleção de skincare ${icon('arrow', 16)}</a>
    </section>
    <section class="section-space featured-section" aria-labelledby="featured-title"><div class="container-wide">
      ${sectionHeading('A SELEÇÃO AFRODITE', '<span id="featured-title">Detalhes que encantam</span>', '<a class="section-link" href="#/colecao/todos">Explorar a curadoria '+icon('arrow', 18)+'</a>')}
      <div class="product-grid home-products">${featureItems.map(p => productCard(p)).join('')}</div>
    </div></section>
    <section class="editorial-section container-wide" aria-labelledby="editorial-title">
      <div class="editorial-photo"><img src="${escapeHtml(image(productByHandle('kit-presente-especial-malbec-3-itens')))}" alt="Kit Presente Especial Malbec, produto do catálogo da Afrodite" loading="lazy"></div>
      <div class="editorial-copy"><span class="eyebrow">GESTOS QUE FICAM</span><h2 id="editorial-title">O cuidado de <em>presentear.</em></h2><p>Uma seleção de kits para tornar a escolha mais simples — e o momento ainda mais especial.</p><a class="button button-outline" href="#/colecao/presentes">Conhecer os kits ${icon('arrow', 18)}</a><div class="editorial-rule"><span>AFRODITE / PRESENTES</span><span>${catalog.filter(p => p.available && p.category === 'presentes').length} OPÇÕES</span></div></div>
    </section>
    <section class="section-space container-wide perfume-feature" aria-labelledby="perfume-title">
      ${sectionHeading('PERFUMARIA', '<span id="perfume-title">Uma fragrância, uma presença.</span>', '<a class="section-link" href="#/colecao/perfumes">Todos os perfumes '+icon('arrow', 18)+'</a>')}
      <div class="product-grid">${fragranceItems.map(p => productCard(p)).join('')}</div>
    </section>
    <section class="service-panel" aria-labelledby="service-title"><div class="container-wide"><span class="eyebrow">INFORMAÇÕES COM CLAREZA</span><h2 id="service-title">A beleza está nos <em>detalhes.</em></h2>
      <div class="service-grid"><a href="#/atendimento"><span class="service-index">01</span><h3>Atendimento</h3><p>Encontre o canal de contato da loja publicada e saiba o que está disponível nesta demo.</p>${icon('arrow', 20)}</a><a href="https://afroditebelezaecuidado.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer"><span class="service-index">02</span><h3>Privacidade</h3><p>Consulte a política de privacidade publicada pela loja.</p>${icon('arrow', 20)}</a><a href="#/carrinho"><span class="service-index">03</span><h3>Experimente a demo</h3><p>Adicione produtos ao carrinho local. Não há pagamento nem pedidos aqui.</p>${icon('arrow', 20)}</a></div>
    </div></section>
  </main>`;
}

function filteredProducts(r) {
  let list = catalog.filter(p => p.available && (r.type === 'busca' || r.slug === 'todos' || p.category === r.slug));
  if (r.type === 'busca') { const q = normalize(r.params.get('q')); list = list.filter(p => normalize(`${p.title} ${p.brand || ''} ${categoryName(p.category)}`).includes(q)); }
  if (state.brand.size) list = list.filter(p => state.brand.has(p.brand || 'Marca não informada'));
  if (state.maxPrice !== 'all') list = list.filter(p => p.price <= Number(state.maxPrice));
  if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  return list;
}
function filterPanel(base) {
  const brands = [...new Set(base.map(p => p.brand || 'Marca não informada'))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return `<div class="filter-panel ${state.filters ? 'filter-panel-open' : ''}">
      <div class="filter-head"><strong>Filtrar produtos</strong><button class="icon-button filter-close" data-action="filters-close" aria-label="Fechar filtros">${icon('close')}</button></div>
      <fieldset><legend>Marca</legend>${brands.map(brand => `<label class="filter-check"><input type="checkbox" data-filter-brand="${escapeHtml(brand)}" ${state.brand.has(brand) ? 'checked' : ''}><span>${escapeHtml(brand)}</span></label>`).join('')}</fieldset>
      <label class="filter-price"><span>Faixa de preço</span><select data-filter-price><option value="all">Todos os preços</option><option value="100" ${state.maxPrice === '100' ? 'selected' : ''}>Até R$ 100</option><option value="200" ${state.maxPrice === '200' ? 'selected' : ''}>Até R$ 200</option><option value="300" ${state.maxPrice === '300' ? 'selected' : ''}>Até R$ 300</option><option value="500" ${state.maxPrice === '500' ? 'selected' : ''}>Até R$ 500</option></select></label>
      <button class="filter-clear" data-action="filters-clear" type="button">Limpar filtros</button>
      <button class="button button-dark filter-apply" data-action="filters-close" type="button">Ver produtos</button>
    </div>`;
}
function collectionPage(r) {
  const isSearch = r.type === 'busca';
  const key = isSearch ? 'todos' : (CATEGORIES[r.slug] ? r.slug : 'todos');
  const c = CATEGORIES[key];
  const query = r.params.get('q') || '';
  const base = catalog.filter(p => p.available && (isSearch || key === 'todos' || p.category === key));
  const result = filteredProducts(r);
  const visualProduct = productByHandle(c.image || 'l-eau-de-lily-blanche-desodorante-colonia-75ml');
  return `<main id="main-content"><div class="container-wide">
    <nav class="breadcrumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span><span>${isSearch ? 'Busca' : escapeHtml(c.name)}</span></nav>
    <section class="collection-hero ${isSearch ? 'search-hero' : ''}"><div><span class="eyebrow">${isSearch ? 'RESULTADOS DA BUSCA' : escapeHtml(c.kicker).toUpperCase()}</span>
      <h1>${isSearch ? `Busca por <em>“${escapeHtml(query)}”</em>` : escapeHtml(c.name)}</h1><p>${isSearch ? `${result.length} ${result.length === 1 ? 'produto encontrado' : 'produtos encontrados'} para sua busca.` : escapeHtml(c.description)}</p></div>
      ${!isSearch && key !== 'todos' ? `<img src="${escapeHtml(image(visualProduct))}" alt="" loading="eager">` : `<div class="collection-ornament" aria-hidden="true">A</div>`}
    </section>
    <nav class="category-pills" aria-label="Navegar por categorias">${['todos','perfumes','presentes','maquiagem','cuidados','skincare','acessorios'].map(cat => `<a href="#/colecao/${cat}" class="${cat === key && !isSearch ? 'active' : ''}">${escapeHtml(CATEGORIES[cat].name)}</a>`).join('')}</nav>
    <div class="listing-toolbar"><div><button class="filter-mobile-trigger" type="button" data-action="filters-open">Filtros ${icon('plus', 16)}</button><span><strong>${result.length}</strong> ${result.length === 1 ? 'produto' : 'produtos'}</span></div><label>Ordenar por <select data-sort><option value="featured" ${state.sort === 'featured' ? 'selected' : ''}>Seleção Afrodite</option><option value="price-asc" ${state.sort === 'price-asc' ? 'selected' : ''}>Menor preço</option><option value="price-desc" ${state.sort === 'price-desc' ? 'selected' : ''}>Maior preço</option><option value="name" ${state.sort === 'name' ? 'selected' : ''}>Nome A–Z</option></select></label></div>
    <div class="listing-layout">${filterPanel(base)}<div class="listing-results">${result.length ? `<div class="product-grid listing-grid">${result.map(p => productCard(p)).join('')}</div>` : `<div class="empty-state"><span class="empty-icon">✳</span><h2>Nenhum produto encontrado.</h2><p>Experimente outra marca, faixa de preço ou uma busca diferente.</p><button class="button button-dark" data-action="filters-clear">Limpar filtros</button></div>`}</div></div>
  </div></main>`;
}

function productPage(r) {
  const p = productByHandle(r.slug);
  if (!p) return notFound();
  const related = catalog.filter(item => item.category === p.category && item.handle !== p.handle).slice(0, 4);
  const selected = p.variants.find(v => String(v.id) === String(state.selectedVariant)) || p.variants[0];
  const sale = p.compareAt && p.compareAt > selected.price;
  const paragraphs = p.description.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const intro = paragraphs[0]?.slice(0, 450) || `Conheça ${p.title}.`;
  const detail = paragraphs.slice(1).join('\n\n') || p.description;
  return `<main id="main-content"><div class="container-wide">
    <nav class="breadcrumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span><a href="#/colecao/${p.category}">${escapeHtml(categoryName(p.category))}</a><span>/</span><span>${escapeHtml(niceName(p))}</span></nav>
    <div class="product-layout"><div class="product-gallery"><div class="main-product-image"><img src="${escapeHtml(image(p, state.gallery))}" alt="${escapeHtml(p.title)} — imagem ${state.gallery + 1}" decoding="async"></div><div class="gallery-thumbs">${p.images.map((src, index) => `<button type="button" data-action="gallery" data-index="${index}" class="${state.gallery === index ? 'active' : ''}" aria-label="Mostrar imagem ${index + 1} de ${p.images.length}" aria-pressed="${state.gallery === index}"><img src="${escapeHtml(src)}" alt=""></button>`).join('')}</div></div>
      <div class="product-info"><span class="eyebrow">${escapeHtml(p.brand || 'MARCA NÃO INFORMADA')}</span><h1>${escapeHtml(p.title)}</h1><div class="product-category-label">${escapeHtml(categoryName(p.category))}</div><div class="product-price"><strong>${money(selected.price)}</strong>${sale ? `<del>${money(p.compareAt)}</del><span class="sale-note">Preço do catálogo</span>` : ''}</div>
        <p class="product-intro">${escapeHtml(intro)}</p>
        ${p.variants.length > 1 ? `<label class="variant-label">Opção<select data-variant>${p.variants.map(v => `<option value="${v.id}" ${v.id === selected.id ? 'selected' : ''}>${escapeHtml(v.title)}</option>`).join('')}</select></label>` : ''}
        <div class="purchase-row"><div class="quantity-control"><button data-action="qty-minus" type="button" aria-label="Diminuir quantidade">${icon('minus', 17)}</button><span aria-live="polite">${state.qty}</span><button data-action="qty-plus" type="button" aria-label="Aumentar quantidade">${icon('plus', 17)}</button></div><button class="button button-dark add-main" data-action="add" data-handle="${escapeHtml(p.handle)}" type="button">Adicionar ao carrinho ${icon('arrow', 18)}</button></div>
        <p class="demo-purchase-note">Carrinho demonstrativo. Pagamento e pedidos não estão disponíveis aqui.</p>
        <div class="product-info-links"><a href="#/atendimento">Informações e atendimento ${icon('arrow', 16)}</a><span>Produto do catálogo público da Afrodite</span></div>
        <div class="accordion"><details open><summary>Descrição do produto <span>${icon('plus', 19)}</span></summary><div class="accordion-body">${escapeHtml(p.description).replace(/\n/g, '<br>')}</div></details><details><summary>Detalhes <span>${icon('plus', 19)}</span></summary><div class="accordion-body"><p>Marca: ${escapeHtml(p.brand || 'não informada no catálogo')}</p><p>Categoria: ${escapeHtml(categoryName(p.category))}</p><p>Nome do catálogo: ${escapeHtml(p.title)}</p><p>Disponibilidade no momento da captura: ${p.available ? 'disponível' : 'indisponível'}.</p></div></details></div>
      </div>
    </div>
    ${related.length ? `<section class="related-section">${sectionHeading('CONTINUE EXPLORANDO', 'Você também pode gostar', `<a class="section-link" href="#/colecao/${p.category}">Ver categoria ${icon('arrow', 18)}</a>`)}<div class="product-grid">${related.map(item => productCard(item)).join('')}</div></section>` : ''}
  </div></main>`;
}

function cartContent(drawer = false) {
  const lines = cartLines();
  return lines.length ? `<div class="cart-lines">${lines.map(({ product: p, quantity }) => `<article class="cart-line"><a class="cart-line-image" href="#/produto/${p.handle}"><img src="${escapeHtml(image(p))}" alt="${escapeHtml(p.title)}"></a><div class="cart-line-detail"><span>${escapeHtml(p.brand || 'Marca não informada')}</span><h3><a href="#/produto/${p.handle}">${escapeHtml(niceName(p))}</a></h3><strong>${money(p.price)}</strong><div class="cart-line-actions"><div class="quantity-control"><button data-action="cart-minus" data-handle="${escapeHtml(p.handle)}" aria-label="Diminuir quantidade de ${escapeHtml(p.title)}">${icon('minus', 15)}</button><span>${quantity}</span><button data-action="cart-plus" data-handle="${escapeHtml(p.handle)}" aria-label="Aumentar quantidade de ${escapeHtml(p.title)}">${icon('plus', 15)}</button></div><button class="remove-button" data-action="remove" data-handle="${escapeHtml(p.handle)}">Remover</button></div></div><strong class="cart-line-total">${money(p.price * quantity)}</strong></article>`).join('')}</div>
    <div class="cart-summary"><div><span>Subtotal demonstrativo</span><strong>${money(cartTotal())}</strong></div><p>Frete, tributos e pagamento não são calculados nesta demonstração. Confira o valor final na loja publicada antes de qualquer compra.</p><button class="button button-disabled" disabled title="Pagamento indisponível nesta demonstração">Pagamento indisponível na demo</button>${drawer ? '<a class="text-link" href="#/carrinho">Ver carrinho completo '+icon('arrow', 16)+'</a>' : '<a class="text-link" href="#/colecao/todos">Continuar explorando '+icon('arrow', 16)+'</a>'}</div>`
    : `<div class="empty-cart"><span class="empty-icon">✳</span><h2>Seu carrinho está vazio.</h2><p>Explore a seleção e encontre algo para o seu momento.</p><a class="button button-dark" href="#/colecao/todos">Descobrir produtos ${icon('arrow', 18)}</a></div>`;
}
function cartPage() {
  return `<main id="main-content" class="cart-page"><div class="container-wide"><nav class="breadcrumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span><span>Carrinho</span></nav><div class="cart-page-head"><span class="eyebrow">SUA SELEÇÃO</span><h1>O seu carrinho<span class="title-dot">.</span></h1><p>Uma prévia local para explorar a experiência. Nenhum pedido será criado.</p></div><div class="cart-page-content">${cartContent()}</div></div></main>`;
}
function aboutPage() {
  return `<main id="main-content" class="story-page"><div class="container-wide"><nav class="breadcrumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span><span>A Afrodite</span></nav><section class="story-hero"><div><span class="eyebrow">SOBRE ESTA PROPOSTA</span><h1>Uma nova forma de <em>encontrar beleza.</em></h1><p>A Afrodite reúne em seu catálogo público perfumes, presentes, maquiagem e cuidados pessoais de diferentes marcas. Esta demonstração propõe uma experiência visual mais clara e elegante para descobrir essa seleção.</p><a class="button button-dark" href="#/colecao/todos">Explorar a seleção ${icon('arrow', 18)}</a></div><div class="story-photo"><img src="${escapeHtml(image(productByHandle('l-eau-de-lily-blanche-desodorante-colonia-75ml')))}" alt="L’Eau de Lily Blanche, item do catálogo da Afrodite"></div></section><div class="story-columns"><div><span>01 / O CATÁLOGO</span><h2>Escolhas reais.</h2><p>As imagens, os nomes e os preços desta proposta foram obtidos do catálogo público da loja. A organização por categoria é uma camada visual criada somente para esta demonstração.</p></div><div><span>02 / A DEMONSTRAÇÃO</span><h2>Uma visão possível.</h2><p>Textos institucionais definitivos, políticas comerciais e identidade oficial dependem de aprovação. Esta página não inventa história da empresa, certificações nem condições de compra.</p></div></div></div></main>`;
}
function supportPage() {
  return `<main id="main-content" class="support-page"><div class="container-wide"><nav class="breadcrumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span><span>Atendimento</span></nav><div class="support-intro"><span class="eyebrow">INFORMAÇÕES</span><h1>Conte com a <em>clareza.</em></h1><p>Esta página apresenta apenas canais e informações que foi possível confirmar na loja publicada.</p></div><div class="support-grid"><a href="https://afroditebelezaecuidado.com/pages/contact" target="_blank" rel="noopener noreferrer"><span class="service-index">01</span><h2>Falar com a loja</h2><p>A página pública de contato da Afrodite oferece um formulário de mensagem.</p><span class="link-bottom">Abrir contato da loja publicada ${icon('arrow', 19)}</span></a><a href="https://afroditebelezaecuidado.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer"><span class="service-index">02</span><h2>Privacidade</h2><p>A política de privacidade publicada está disponível para consulta.</p><span class="link-bottom">Ler política de privacidade ${icon('arrow', 19)}</span></a><div><span class="service-index">03</span><h2>Sobre compras</h2><p>Este ambiente não processa pagamento, frete ou pedidos. Condições de troca, entrega e valor final devem ser confirmadas na loja publicada antes da compra.</p></div></div></div></main>`;
}
function notFound() { return `<main id="main-content"><div class="container-wide empty-page"><span class="empty-icon">✳</span><h1>Não encontramos esta página.</h1><p>Volte para a seleção e continue explorando.</p><a class="button button-dark" href="#/colecao/todos">Ver produtos ${icon('arrow', 18)}</a></div></main>`; }

function overlays() {
  const menu = state.menu ? `<div class="backdrop" data-action="overlay-close"></div><aside class="mobile-menu" aria-label="Menu"><div class="overlay-top"><span class="wordmark"><span>AFRODITE</span><small>BELEZA & CUIDADO</small></span><button class="icon-button" data-action="overlay-close" aria-label="Fechar menu">${icon('close')}</button></div><nav>${[['todos','Explorar tudo'],['perfumes','Perfumes'],['maquiagem','Maquiagem'],['presentes','Kits e presentes'],['cuidados','Corpo e banho'],['skincare','Skincare'],['acessorios','Acessórios']].map(([key,label]) => `<a href="#/colecao/${key}">${label}${icon('arrow',17)}</a>`).join('')}<a href="#/sobre">A Afrodite${icon('arrow',17)}</a><a href="#/atendimento">Atendimento${icon('arrow',17)}</a></nav><div class="menu-bottom">DEMONSTRAÇÃO VISUAL · SEM COMPRAS</div></aside>` : '';
  const search = state.search ? `<div class="backdrop" data-action="overlay-close"></div><section class="search-modal" role="dialog" aria-modal="true" aria-label="Buscar produtos"><div class="container-wide"><div class="search-modal-head"><span class="eyebrow">O QUE VOCÊ PROCURA?</span><button class="icon-button" data-action="overlay-close" aria-label="Fechar busca">${icon('close')}</button></div><form id="search-form" class="search-form">${icon('search',27)}<input class="search-input" type="search" name="q" placeholder="Experimente perfume, Lily, maquiagem…" aria-label="Buscar produtos" autocomplete="off"><button type="submit">Buscar ${icon('arrow', 18)}</button></form><div class="search-suggestions"></div><div class="search-hint">Busque por produto, marca ou categoria.</div></div></section>` : '';
  const drawer = state.drawer ? `<div class="backdrop" data-action="overlay-close"></div><aside class="cart-drawer" role="dialog" aria-modal="true" aria-label="Carrinho demonstrativo"><div class="drawer-head"><div><span class="eyebrow">SUA SELEÇÃO</span><h2>Carrinho <small>(${countCart()})</small></h2></div><button class="icon-button" data-action="overlay-close" aria-label="Fechar carrinho">${icon('close')}</button></div><div class="drawer-body">${cartContent(true)}</div></aside>` : '';
  return menu + search + drawer;
}

function render() {
  const r = route();
  let content = home();
  if (r.type === 'colecao' || r.type === 'busca') content = collectionPage(r);
  else if (r.type === 'produto') content = productPage(r);
  else if (r.type === 'carrinho') content = cartPage();
  else if (r.type === 'sobre') content = aboutPage();
  else if (r.type === 'atendimento') content = supportPage();
  else if (r.type !== 'home') content = notFound();
  document.getElementById('app').innerHTML = header() + content + footer();
  document.getElementById('overlay-root').innerHTML = overlays();
  document.body.classList.toggle('overlay-active', state.menu || state.search || state.drawer);
  const pageTitle = r.type === 'home' ? 'Afrodite Beleza e Cuidado' : r.type === 'produto' ? productByHandle(r.slug)?.title : r.type === 'colecao' ? categoryName(r.slug) : r.type === 'busca' ? 'Busca' : r.type === 'carrinho' ? 'Carrinho' : r.type === 'sobre' ? 'A Afrodite' : 'Atendimento';
  document.title = `${pageTitle || 'Afrodite'} — demonstração visual`;
}

function changeCart(handle, delta) {
  const product = productByHandle(handle); if (!product) return;
  let line = cart.find(item => item.handle === handle);
  if (!line && delta > 0) { line = { handle, quantity: 0 }; cart.push(line); }
  if (!line) return;
  line.quantity = Math.min(99, Math.max(0, line.quantity + delta));
  if (!line.quantity) cart = cart.filter(item => item.handle !== handle);
  saveCart(); render();
}
function updateSuggestions(term) {
  const box = document.querySelector('.search-suggestions'); if (!box) return;
  const query = normalize(term.trim());
  if (!query) { box.innerHTML = `<span class="suggestion-title">EXPLORE POR CATEGORIA</span><div class="suggestion-categories">${['perfumes','presentes','maquiagem','cuidados'].map(key => `<a href="#/colecao/${key}">${escapeHtml(CATEGORIES[key].name)} ${icon('arrow',15)}</a>`).join('')}</div>`; return; }
  const matches = catalog.filter(p => normalize(`${p.title} ${p.brand || ''}`).includes(query)).slice(0, 5);
  box.innerHTML = `<span class="suggestion-title">${matches.length ? 'SUGESTÕES' : 'NENHUMA SUGESTÃO'}</span>${matches.map(p => `<a class="suggestion-item" href="#/produto/${p.handle}"><img src="${escapeHtml(image(p))}" alt=""><span><small>${escapeHtml(p.brand || 'Marca não informada')}</small><strong>${escapeHtml(niceName(p))}</strong></span><b>${money(p.price)}</b></a>`).join('')}<button class="all-search" data-action="search-submit" type="button">Ver todos os resultados ${icon('arrow',16)}</button>`;
}

document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    const main = document.getElementById('main-content');
    if (main) { main.tabIndex = -1; main.focus({ preventScroll: true }); main.scrollIntoView({ behavior: 'smooth' }); }
    return;
  }
  const el = event.target.closest('[data-action]'); if (!el) return;
  const action = el.dataset.action; const handle = el.dataset.handle;
  if (action === 'menu-open') { state.menu = true; render(); }
  if (action === 'search-open') { state.search = true; render(); updateSuggestions(''); requestAnimationFrame(() => document.querySelector('.search-input')?.focus()); }
  if (action === 'overlay-close') { state.menu = false; state.search = false; state.drawer = false; render(); }
  if (action === 'gallery') { state.gallery = Number(el.dataset.index); render(); }
  if (action === 'qty-minus') { state.qty = Math.max(1, state.qty - 1); render(); }
  if (action === 'qty-plus') { state.qty = Math.min(99, state.qty + 1); render(); }
  if (action === 'add') { changeCart(handle, state.qty); state.drawer = true; render(); notice('Adicionado ao carrinho demonstrativo'); }
  if (action === 'cart-minus') changeCart(handle, -1);
  if (action === 'cart-plus') changeCart(handle, 1);
  if (action === 'remove') changeCart(handle, -99);
  if (action === 'filters-open') { state.filters = true; render(); }
  if (action === 'filters-close') { state.filters = false; render(); }
  if (action === 'filters-clear') { state.brand.clear(); state.maxPrice = 'all'; state.filters = false; render(); }
  if (action === 'search-submit') { const q = document.querySelector('.search-input')?.value.trim() || ''; if (q) go(`#/busca?q=${encodeURIComponent(q)}`); }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'search-form') { event.preventDefault(); const q = event.target.querySelector('input').value.trim(); if (q) go(`#/busca?q=${encodeURIComponent(q)}`); }
});
document.addEventListener('input', event => { if (event.target.matches('.search-input')) updateSuggestions(event.target.value); });
document.addEventListener('change', event => {
  const t = event.target;
  if (t.matches('[data-sort]')) { state.sort = t.value; render(); }
  if (t.matches('[data-filter-brand]')) { t.checked ? state.brand.add(t.dataset.filterBrand) : state.brand.delete(t.dataset.filterBrand); render(); }
  if (t.matches('[data-filter-price]')) { state.maxPrice = t.value; render(); }
  if (t.matches('[data-variant]')) { state.selectedVariant = t.value; render(); }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && (state.menu || state.search || state.drawer)) { state.menu = false; state.search = false; state.drawer = false; render(); } });
window.addEventListener('hashchange', onRoute);

try {
  const response = await fetch('data/catalog.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  catalogInfo = await response.json(); catalog = catalogInfo.products;
  cart = cart.filter(line => catalog.some(p => p.handle === line.handle) && Number.isInteger(line.quantity) && line.quantity > 0);
  render();
} catch (error) {
  document.getElementById('app').innerHTML = `<main class="load-error"><h1>Não foi possível abrir o catálogo.</h1><p>Recarregue a página. Se o problema continuar, abra novamente o link da demonstração.</p><code>${escapeHtml(error.message)}</code></main>`;
}
