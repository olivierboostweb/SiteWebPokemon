const API = '/api';
let allCardsCache = [];
let editingCardId = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function showMessage(text, isError = false) {
    const box = $('#message');
    box.textContent = text;
    box.classList.remove('hidden');
    box.style.background = isError ? '#ffb3b3' : '#ffff99';
    setTimeout(() => box.classList.add('hidden'), 4500);
}

async function api(action, params = {}) {
    const url = new URL(API, window.location.href);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erreur API');
    return data.data;
}

async function apiPost(action, payload = {}) {
    const url = new URL(API, window.location.href);
    url.searchParams.set('action', action);
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erreur API');
    return data;
}

function switchTab(tabName) {
    $$('.tab').forEach(tab => tab.classList.remove('active'));
    const selected = $(`#tab-${tabName}`);
    if (selected) selected.classList.add('active');

    if (tabName === 'generations') loadGenerations();
    if (tabName === 'cartes') loadAllCards();
    if (tabName === 'ajouter') loadFormOptions();
}

function imageForCard(card) {
    if (card.illustration) return card.illustration;
    const slug = (card.nom_carte || 'pikachu').toLowerCase().replaceAll(' ', '-');
    return `https://img.pokemondb.net/artwork/large/${slug}.jpg`;
}

function cardTile(card, previewId) {
    const div = document.createElement('div');
    div.className = 'card-tile';
    div.innerHTML = `
        <img src="${imageForCard(card)}" alt="${card.nom_carte}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
        <h4>${card.nom_carte}</h4>
        <div>${card.type || 'Type inconnu'}</div>
        <div>${card.nom_rarete || 'Rareté inconnue'}</div>
        <div>${card.valeur_carte ? card.valeur_carte + '$' : ''}</div>
    `;
    div.addEventListener('click', () => showCardPreview(card, previewId));
    return div;
}

function showCardPreview(card, previewId) {
    const preview = document.querySelector(previewId);
    preview.innerHTML = `
        <img src="${imageForCard(card)}" alt="${card.nom_carte}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
        <h2>${card.nom_carte}</h2>
        <div class="stat"><strong>ID Pokémon:</strong> ${card.id_pokemon || '-'}</div>
        <div class="stat"><strong>Numéro:</strong> ${card.numero_carte || '-'}</div>
        <div class="stat"><strong>PV:</strong> ${card.pv || '-'}</div>
        <div class="stat"><strong>Type:</strong> ${card.type || '-'}</div>
        <div class="stat"><strong>Valeur:</strong> ${card.valeur_carte || '0.00'}$</div>
        <div class="stat"><strong>Génération:</strong> ${card.nom_generation || card.generation || '-'}</div>
        <div class="stat"><strong>Série:</strong> ${card.nom_serie || '-'}</div>
        <div class="stat"><strong>Booster:</strong> ${card.nom_booster || '-'}</div>
        <div class="stat"><strong>Rareté:</strong> ${card.nom_rarete || '-'}</div>
        <p><strong>Talent:</strong><br>${card.talent || '-'}</p>
        <div class="preview-actions">
            <button type="button" data-edit-card>Modifier</button>
            <button type="button" data-delete-card>Supprimer</button>
        </div>
    `;

    preview.querySelector('[data-edit-card]').addEventListener('click', () => startEditCard(card));
    preview.querySelector('[data-delete-card]').addEventListener('click', () => deleteCard(card));
}

async function loadGenerations() {
    try {
        const generations = await api('generations');
        const container = $('#generationsList');
        container.innerHTML = '';
        generations.forEach(gen => {
            const btn = document.createElement('button');
            btn.textContent = gen.nom_generation;
            btn.title = gen.description || '';
            btn.addEventListener('click', () => loadCardsByGeneration(gen));
            container.appendChild(btn);
        });
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function loadCardsByGeneration(gen) {
    try {
        $('#generationTitle').textContent = `Cartes de ${gen.nom_generation}`;
        const cards = await api('cartes', { generation: gen.id_generation });
        const grid = $('#cardsByGeneration');
        grid.innerHTML = '';
        if (cards.length === 0) {
            grid.innerHTML = '<p>Aucune carte dans cette génération.</p>';
            return;
        }
        cards.forEach(card => grid.appendChild(cardTile(card, '#cardPreviewGeneration')));
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function loadAllCards() {
    try {
        allCardsCache = await api('cartes');
        renderAllCards(allCardsCache);
    } catch (error) {
        showMessage(error.message, true);
    }
}

function renderAllCards(cards) {
    const grid = $('#allCards');
    grid.innerHTML = '';
    if (cards.length === 0) {
        grid.innerHTML = '<p>Aucune carte trouvée.</p>';
        return;
    }
    cards.forEach(card => grid.appendChild(cardTile(card, '#cardPreviewAll')));
}

async function loadFormOptions() {
    try {
        const [series, boosters, raretes] = await Promise.all([
            api('series'),
            api('boosters'),
            api('raretes')
        ]);
        fillSelect('#serieSelect', series, 'id_serie', 'nom_serie');
        fillSelect('#boosterSelect', boosters, 'id_booster', 'nom_booster');
        fillSelect('#rareteSelect', raretes, 'id_rarete', 'nom_rarete');
    } catch (error) {
        showMessage(error.message, true);
    }
}

function fillSelect(selector, rows, valueKey, labelKey) {
    const select = $(selector);
    select.innerHTML = '<option value="">-- Choisir --</option>';
    rows.forEach(row => {
        const option = document.createElement('option');
        option.value = row[valueKey];
        option.textContent = row[labelKey];
        select.appendChild(option);
    });
}

async function startEditCard(card) {
    try {
        switchTab('ajouter');
        await loadFormOptions();
        editingCardId = card.id_carte;

        const form = $('#addCardForm');
        form.elements.id_carte.value = card.id_carte;
        form.elements.nom_carte.value = card.nom_carte || '';
        form.elements.id_pokemon.value = card.id_pokemon || '';
        form.elements.numero_carte.value = card.numero_carte || '';
        form.elements.valeur_carte.value = card.valeur_carte || '';
        form.elements.pv.value = card.pv || '';
        form.elements.generation.value = card.generation || card.nom_generation || '';
        form.elements.type.value = card.type || '';
        form.elements.talent.value = card.talent || '';
        form.elements.illustration.value = card.illustration || '';
        form.elements.id_serie.value = card.id_serie || '';
        form.elements.id_booster.value = card.id_booster || '';
        form.elements.id_rarete.value = card.id_rarete || '';

        $('#formTitle').textContent = 'Modifier une carte';
        $('#submitCardButton').textContent = 'Enregistrer les modifications';
        $('#cancelEditButton').classList.remove('hidden');
    } catch (error) {
        showMessage(error.message, true);
    }
}

function resetCardForm() {
    editingCardId = null;
    const form = $('#addCardForm');
    form.reset();
    form.elements.id_carte.value = '';
    $('#formTitle').textContent = 'Ajouter une carte';
    $('#submitCardButton').textContent = 'Ajouter dans la DB';
    $('#cancelEditButton').classList.add('hidden');
}

async function deleteCard(card) {
    if (!confirm(`Supprimer ${card.nom_carte} de la base?`)) return;

    try {
        const data = await apiPost('supprimer_carte', { id_carte: card.id_carte });
        showMessage(data.message);
        allCardsCache = await api('cartes');
        renderAllCards(allCardsCache);
        $('#cardPreviewAll').innerHTML = '<p>Clique sur une carte pour la voir ici.</p>';
        $('#cardPreviewGeneration').innerHTML = '<p>Clique sur une carte pour la voir ici.</p>';
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function submitCard(event) {
    event.preventDefault();
    try {
        const form = event.currentTarget;
        const payload = Object.fromEntries(new FormData(form));
        const action = editingCardId ? 'modifier_carte' : 'ajouter_carte';
        const data = await apiPost(action, payload);
        showMessage(data.message);
        resetCardForm();
        allCardsCache = await api('cartes');
        renderAllCards(allCardsCache);
    } catch (error) {
        showMessage(error.message, true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    $$('[data-tab]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            switchTab(link.dataset.tab);
        });
    });

    $('#addCardForm').addEventListener('submit', submitCard);
    $('#cancelEditButton').addEventListener('click', resetCardForm);

    $('#searchInput').addEventListener('input', event => {
        const term = event.target.value.toLowerCase();
        const filtered = allCardsCache.filter(card =>
            `${card.nom_carte} ${card.type} ${card.nom_generation} ${card.nom_serie}`.toLowerCase().includes(term)
        );
        renderAllCards(filtered);
    });

    loadGenerations();
});
