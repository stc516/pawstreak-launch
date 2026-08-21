import { places, categoryLabels } from './data.js';

const placeList = document.querySelector('#placeList');
const resultCount = document.querySelector('#resultCount');
const resultsTitle = document.querySelector('#resultsTitle');
const searchInput = document.querySelector('#searchInput');
const searchForm = document.querySelector('#searchForm');
const categoryButtons = [...document.querySelectorAll('[data-category]')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const quickButtons = [...document.querySelectorAll('[data-query]')];
const areaButtons = [...document.querySelectorAll('[data-area]')];
const loadMore = document.querySelector('#loadMore');
const dialog = document.querySelector('#placeDialog');
const dialogContent = document.querySelector('#dialogContent');
const dialogClose = document.querySelector('#dialogClose');
const contributeDialog = document.querySelector('#contributeDialog');
const contributeForm = document.querySelector('#contributeForm');
const contributeTitle = document.querySelector('#contributeTitle');

let state = { category: 'all', filter: 'all', query: '', area: '', limit: 8 };
let map;
let markerLayer;

const areaCenters = {
  'Ocean Beach':[32.749,-117.250], 'Mission Bay':[32.780,-117.230], 'Balboa Park':[32.735,-117.145],
  'Pacific Beach':[32.797,-117.240], 'North Park':[32.748,-117.129], 'South Park':[32.720,-117.129],
  'Normal Heights':[32.763,-117.118], 'Kearny Mesa':[32.821,-117.155], 'Kensington':[32.763,-117.106],
  'Old Town':[32.755,-117.197], 'Bankers Hill':[32.729,-117.159], 'Crown Point':[32.782,-117.233],
  'Sorrento Valley':[32.907,-117.224], 'Miramar':[32.878,-117.145], 'East Village':[32.710,-117.151],
  'Bay Park':[32.785,-117.199], 'Little Italy':[32.724,-117.169], 'Gaslamp':[32.711,-117.160],
  'Golden Hill':[32.716,-117.128], 'Liberty Station':[32.740,-117.213], 'Coronado':[32.685,-117.183],
  'University City':[32.860,-117.214], 'Rancho Bernardo':[33.020,-117.080], 'Rancho Peñasquitos':[32.960,-117.120],
  'San Diego':[32.735,-117.160]
};

const categoryRoutes = {
  restaurant:'dog-friendly-restaurants', brewery:'dog-friendly-breweries', beach:'dog-friendly-beaches', dog_park:'dog-parks', cafe:'dog-friendly-coffee'
};

function slugify(value){ return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function prettyCategory(category) { return categoryLabels[category] || category.replace('_', ' '); }
function verificationLabel(level) { return level === 'official' ? 'Officially verified' : 'Strong evidence'; }

function matches(place) {
  const haystack = `${place.name} ${place.category} ${place.area} ${place.access} ${place.description} ${place.tags.join(' ')}`.toLowerCase();
  return (!state.query || haystack.includes(state.query.toLowerCase()))
    && (state.category === 'all' || place.category === state.category)
    && (!state.area || place.area === state.area)
    && (state.filter === 'all' || (state.filter === 'official' && place.verification === 'official') || haystack.includes(state.filter.toLowerCase()));
}

function setUrl(path, replace=false){
  const fn = replace ? history.replaceState : history.pushState;
  fn.call(history, {}, '', path);
  updateMeta();
}

function updateMeta(){
  let title = 'PawStreak Places — Dog-Friendly San Diego';
  let description = 'Find genuinely dog-friendly places in San Diego: beaches, patios, breweries, parks, coffee and adventures.';
  if(state.area){ title = `Dog-Friendly ${state.area} — PawStreak Places`; description = `Verified dog-friendly places and things to do with your dog in ${state.area}, San Diego.`; }
  else if(state.category !== 'all'){ title = `${prettyCategory(state.category)} With Your Dog in San Diego — PawStreak Places`; description = `Browse ${prettyCategory(state.category).toLowerCase()} options for dog people across San Diego.`; }
  else if(state.filter === 'off-leash'){ title = 'Off-Leash San Diego — PawStreak Places'; }
  document.title = title;
  document.querySelector('meta[name="description"]').setAttribute('content', description);
  document.querySelector('link[rel="canonical"]').setAttribute('href', `https://places.pawstreakapp.com${location.pathname}`);
}

function cardMarkup(place, index) {
  const icon = {beach:'≈',dog_park:'♧',restaurant:'🍽',brewery:'◒',cafe:'☕'}[place.category] || '✦';
  return `<article class="place-card" style="--i:${index}">
    <button class="place-card-main" data-open-place="${place.id}">
      <div class="place-visual ${place.category}"><span>${icon}</span><small>${prettyCategory(place.category)}</small></div>
      <div class="place-content">
        <div class="place-meta"><span>${place.area}</span><span class="dot">•</span><span>${place.access}</span></div>
        <h3>${place.name}</h3><p>${place.description}</p>
        <div class="detail-chips">${place.details.slice(0,3).map(d => `<span>${d}</span>`).join('')}</div>
        <div class="verify-row"><span class="verify-badge ${place.verification}">✓ ${verificationLabel(place.verification)}</span><small>${place.source}</small></div>
      </div><span class="card-arrow">↗</span>
    </button>
  </article>`;
}

function renderMap(filtered){
  if(!window.L) return;
  if(!map){
    map = L.map('placesMap', {scrollWheelZoom:false}).setView([32.77,-117.17], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap'}).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
  }
  markerLayer.clearLayers();
  const groups = {};
  filtered.forEach(place => { groups[place.area] = (groups[place.area] || 0) + 1; });
  Object.entries(groups).forEach(([area,count]) => {
    const center = areaCenters[area] || areaCenters['San Diego'];
    const marker = L.marker(center).addTo(markerLayer);
    marker.bindPopup(`<strong>${area}</strong><br>${count} dog-friendly ${count === 1 ? 'place' : 'places'}<br><button class="map-popup-button" data-map-area="${area}">Browse area</button>`);
  });
  map.off('popupopen');
  map.on('popupopen', e => {
    const button = e.popup.getElement()?.querySelector('[data-map-area]');
    button?.addEventListener('click', () => selectArea(button.dataset.mapArea));
  });
}

function render() {
  const filtered = places.filter(matches);
  const visible = filtered.slice(0, state.limit);
  placeList.innerHTML = visible.map(cardMarkup).join('') || `<div class="empty-state"><strong>No exact match yet.</strong><p>Try another neighborhood, category or broader search. We’re continuously adding verified San Diego places.</p></div>`;
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'place' : 'places'}`;
  loadMore.hidden = filtered.length <= state.limit;
  if (state.area) resultsTitle.textContent = `Dog-friendly ${state.area}`;
  else if (state.query) resultsTitle.textContent = `Results for “${state.query}”`;
  else if (state.category !== 'all') resultsTitle.textContent = `${prettyCategory(state.category)} with your dog`;
  else if (state.filter === 'off-leash') resultsTitle.textContent = 'Off-leash San Diego';
  else resultsTitle.textContent = 'Worth leaving the neighborhood for';
  document.querySelectorAll('[data-open-place]').forEach(button => button.addEventListener('click', () => openPlace(button.dataset.openPlace, true)));
  renderMap(filtered);
  updateMeta();
}

function openPlace(id, push=false) {
  const place = places.find(p => p.id === id); if (!place) return;
  if(push) setUrl(`/san-diego/places/${place.id}`);
  dialogContent.innerHTML = `<div class="dialog-hero ${place.category}"><span>${{beach:'≈',dog_park:'♧',restaurant:'🍽',brewery:'◒',cafe:'☕'}[place.category] || '✦'}</span><small>${prettyCategory(place.category)} · ${place.area}</small></div>
    <div class="dialog-body"><span class="verify-badge ${place.verification}">✓ ${verificationLabel(place.verification)}</span><h2>${place.name}</h2><p class="dialog-lead">${place.description}</p>
    <div class="facts-grid"><div><small>DOG ACCESS</small><strong>${place.access}</strong></div><div><small>AREA</small><strong>${place.area}</strong></div><div><small>VERIFIED BY</small><strong>${place.source}</strong></div><div><small>BEST FOR</small><strong>${place.tags.slice(0,3).join(' · ')}</strong></div></div>
    <h3>Know before you go</h3><ul>${place.details.map(detail => `<li>${detail}</li>`).join('')}</ul>
    <div class="dialog-actions"><a class="primary-action" href="https://pawstreakapp.com/app">Save to PawStreak →</a><a class="secondary-action" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name+' '+place.area+' San Diego')}">Directions</a><button class="secondary-action" data-report-place="${place.name}">Report info</button></div>
    <p class="policy-note">Dog policies can change. This listing is currently marked <strong>${verificationLabel(place.verification).toLowerCase()}</strong>.</p></div>`;
  dialog.showModal();
  dialogContent.querySelector('[data-report-place]')?.addEventListener('click', () => { dialog.close(); openContribution('report', place.name); });
}

function selectArea(area, push=true){
  state = {...state, area, query:'', category:'all', limit:8}; searchInput.value='';
  categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
  if(push) setUrl(`/san-diego/neighborhoods/${slugify(area)}`); render(); scrollToResults();
}

function selectCategory(category, push=true){
  state = {...state, category, area:'', query:'', filter:'all', limit:8}; searchInput.value='';
  categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === category));
  filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  if(push) setUrl(category === 'all' ? '/san-diego' : `/san-diego/${categoryRoutes[category]}`); render(); scrollToResults();
}

function scrollToResults(){ document.querySelector('.explore-layout').scrollIntoView({behavior:'smooth', block:'start'}); }

function openContribution(mode='suggest', place=''){
  contributeTitle.textContent = mode === 'report' ? 'Report incorrect dog information' : 'Suggest a dog-friendly place';
  contributeForm.reset();
  if(place){ contributeForm.elements.place.value = place; }
  contributeDialog.dataset.mode = mode;
  contributeDialog.showModal();
}

function applyRoute(){
  const path = location.pathname.replace(/\/$/,'') || '/san-diego';
  state = { category:'all', filter:'all', query:'', area:'', limit:8 };
  const placeMatch = path.match(/^\/san-diego\/places\/([^/]+)$/);
  const areaMatch = path.match(/^\/san-diego\/neighborhoods\/([^/]+)$/);
  if(placeMatch){ render(); openPlace(placeMatch[1], false); return; }
  if(areaMatch){ const area = Object.keys(areaCenters).find(a => slugify(a) === areaMatch[1]); if(area) state.area = area; }
  else if(path.endsWith('/dog-friendly-restaurants')) state.category='restaurant';
  else if(path.endsWith('/dog-friendly-breweries')) state.category='brewery';
  else if(path.endsWith('/dog-friendly-beaches')) state.category='beach';
  else if(path.endsWith('/dog-parks')) state.category='dog_park';
  else if(path.endsWith('/dog-friendly-coffee')) state.category='cafe';
  else if(path.endsWith('/off-leash')) state.filter='off-leash';
  categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === state.category));
  filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === state.filter));
  render();
  if(location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 0);
}

categoryButtons.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.category)));
filterButtons.forEach(button => button.addEventListener('click', () => { state={...state,filter:button.dataset.filter,limit:8}; filterButtons.forEach(b=>b.classList.toggle('active',b===button)); if(button.dataset.filter==='off-leash') setUrl('/san-diego/off-leash'); render(); }));
quickButtons.forEach(button => button.addEventListener('click', () => { state={...state,query:button.dataset.query,category:'all',area:'',limit:8}; searchInput.value=button.dataset.query; render(); scrollToResults(); }));
areaButtons.forEach(button => button.addEventListener('click', () => selectArea(button.dataset.area)));
searchForm.addEventListener('submit', event => { event.preventDefault(); state={...state,query:searchInput.value.trim(),area:'',category:'all',limit:8}; setUrl(`/san-diego?search=${encodeURIComponent(state.query)}`); render(); scrollToResults(); });
loadMore.addEventListener('click', () => { state.limit += 8; render(); });
document.querySelector('#resetMap').addEventListener('click', () => { state.area=''; setUrl('/san-diego'); render(); });
document.querySelector('#showAllCategories').addEventListener('click', () => selectCategory('all'));

document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', e => { const href = link.getAttribute('href'); if(!href?.startsWith('/san-diego')) return; e.preventDefault(); const [path,hash=''] = href.split('#'); setUrl(path + (hash ? '#'+hash : '')); applyRoute(); }));
document.querySelector('#suggestPlace').addEventListener('click', () => openContribution('suggest'));
document.querySelector('#suggestTop').addEventListener('click', () => openContribution('suggest'));
document.querySelector('#suggestFooter').addEventListener('click', () => openContribution('suggest'));
document.querySelector('#reportInfo').addEventListener('click', () => openContribution('report'));
document.querySelector('#contributeClose').addEventListener('click', () => contributeDialog.close());
contributeDialog.addEventListener('click', e => { if(e.target === contributeDialog) contributeDialog.close(); });
contributeForm.addEventListener('submit', e => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(contributeForm)); payload.mode = contributeDialog.dataset.mode; payload.createdAt = new Date().toISOString();
  const queue = JSON.parse(localStorage.getItem('pawstreakPlacesSubmissions') || '[]'); queue.push(payload); localStorage.setItem('pawstreakPlacesSubmissions', JSON.stringify(queue));
  contributeForm.innerHTML = `<div class="form-success"><span>✓</span><h2>Got it.</h2><p>Thanks. This is queued for verification before anything gets published.</p><button type="button" class="primary-action" id="doneContribution">Done</button></div>`;
  document.querySelector('#doneContribution').addEventListener('click', () => contributeDialog.close());
});

dialogClose.addEventListener('click', () => { dialog.close(); if(location.pathname.includes('/places/')) { setUrl('/san-diego'); applyRoute(); } });
dialog.addEventListener('click', event => { if (event.target === dialog) dialogClose.click(); });
window.addEventListener('popstate', applyRoute);

const searchParam = new URLSearchParams(location.search).get('search'); if(searchParam){ state.query=searchParam; searchInput.value=searchParam; }
applyRoute();
