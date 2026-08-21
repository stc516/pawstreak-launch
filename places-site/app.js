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

let state = { category: 'all', filter: 'all', query: '', area: '', limit: 8 };

function prettyCategory(category) {
  return categoryLabels[category] || category.replace('_', ' ');
}

function verificationLabel(level) {
  return level === 'official' ? 'Officially verified' : 'Strong evidence';
}

function matches(place) {
  const haystack = `${place.name} ${place.category} ${place.area} ${place.access} ${place.description} ${place.tags.join(' ')}`.toLowerCase();
  const queryOk = !state.query || haystack.includes(state.query.toLowerCase());
  const categoryOk = state.category === 'all' || place.category === state.category;
  const areaOk = !state.area || place.area === state.area;
  const filterOk = state.filter === 'all'
    || (state.filter === 'official' && place.verification === 'official')
    || haystack.includes(state.filter.toLowerCase());
  return queryOk && categoryOk && areaOk && filterOk;
}

function cardMarkup(place, index) {
  const icon = {beach:'≈',dog_park:'♧',restaurant:'🍽',brewery:'◒',cafe:'☕'}[place.category] || '✦';
  return `<article class="place-card" style="--i:${index}">
    <button class="place-card-main" data-open-place="${place.id}">
      <div class="place-visual ${place.category}"><span>${icon}</span><small>${prettyCategory(place.category)}</small></div>
      <div class="place-content">
        <div class="place-meta"><span>${place.area}</span><span class="dot">•</span><span>${place.access}</span></div>
        <h3>${place.name}</h3>
        <p>${place.description}</p>
        <div class="detail-chips">${place.details.slice(0,3).map(d => `<span>${d}</span>`).join('')}</div>
        <div class="verify-row"><span class="verify-badge ${place.verification}">✓ ${verificationLabel(place.verification)}</span><small>${place.source}</small></div>
      </div>
      <span class="card-arrow">↗</span>
    </button>
  </article>`;
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
  else resultsTitle.textContent = 'Worth leaving the neighborhood for';

  document.querySelectorAll('[data-open-place]').forEach(button => {
    button.addEventListener('click', () => openPlace(button.dataset.openPlace));
  });
}

function openPlace(id) {
  const place = places.find(p => p.id === id);
  if (!place) return;
  dialogContent.innerHTML = `
    <div class="dialog-hero ${place.category}"><span>${{beach:'≈',dog_park:'♧',restaurant:'🍽',brewery:'◒',cafe:'☕'}[place.category] || '✦'}</span><small>${prettyCategory(place.category)} · ${place.area}</small></div>
    <div class="dialog-body">
      <span class="verify-badge ${place.verification}">✓ ${verificationLabel(place.verification)}</span>
      <h2>${place.name}</h2>
      <p class="dialog-lead">${place.description}</p>
      <div class="facts-grid">
        <div><small>DOG ACCESS</small><strong>${place.access}</strong></div>
        <div><small>AREA</small><strong>${place.area}</strong></div>
        <div><small>VERIFIED BY</small><strong>${place.source}</strong></div>
        <div><small>BEST FOR</small><strong>${place.tags.slice(0,3).join(' · ')}</strong></div>
      </div>
      <h3>Know before you go</h3>
      <ul>${place.details.map(detail => `<li>${detail}</li>`).join('')}</ul>
      <div class="dialog-actions"><a class="primary-action" href="https://pawstreakapp.com/app">Save to PawStreak →</a><button class="secondary-action" onclick="navigator.share?.({title:'${place.name}',text:'Check out ${place.name} on PawStreak Places'})">Share</button></div>
      <p class="policy-note">Dog policies can change. This listing is currently marked <strong>${verificationLabel(place.verification).toLowerCase()}</strong>.</p>
    </div>`;
  dialog.showModal();
}

categoryButtons.forEach(button => button.addEventListener('click', () => {
  state = {...state, category: button.dataset.category, area:'', query:'', limit:8};
  searchInput.value = '';
  categoryButtons.forEach(b => b.classList.toggle('active', b === button));
  render();
  document.querySelector('.explore-layout').scrollIntoView({behavior:'smooth', block:'start'});
}));

filterButtons.forEach(button => button.addEventListener('click', () => {
  state = {...state, filter: button.dataset.filter, limit:8};
  filterButtons.forEach(b => b.classList.toggle('active', b === button));
  render();
}));

quickButtons.forEach(button => button.addEventListener('click', () => {
  state = {...state, query:button.dataset.query, category:'all', area:'', limit:8};
  searchInput.value = button.dataset.query;
  categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
  render();
  document.querySelector('.explore-layout').scrollIntoView({behavior:'smooth', block:'start'});
}));

areaButtons.forEach(button => button.addEventListener('click', () => {
  state = {...state, area:button.dataset.area, query:'', category:'all', limit:8};
  searchInput.value = '';
  categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
  render();
  document.querySelector('.explore-layout').scrollIntoView({behavior:'smooth', block:'start'});
}));

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  state = {...state, query: searchInput.value.trim(), area:'', category:'all', limit:8};
  categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
  render();
  document.querySelector('.explore-layout').scrollIntoView({behavior:'smooth', block:'start'});
});

loadMore.addEventListener('click', () => { state.limit += 8; render(); });
document.querySelector('#resetMap').addEventListener('click', () => { state.area=''; render(); });
document.querySelector('#showAllCategories').addEventListener('click', () => { state={...state,category:'all',filter:'all',query:'',area:'',limit:places.length}; searchInput.value=''; render(); document.querySelector('.explore-layout').scrollIntoView({behavior:'smooth'}); });
dialogClose.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

render();
