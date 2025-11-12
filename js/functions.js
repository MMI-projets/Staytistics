// ===============================
// CHARGEMENT DU CSV DES STREAMS
// ===============================
let streamsData = []; // contiendra les données du CSV

Papa.parse("kworb_stray_top_musics_streams.csv", {
    download: true,
    header: false,
    dynamicTyping: false, // on garde les chiffres en string pour traiter les ","
    complete: function(results) {
        // Chaque ligne = array [titre, streams, autre]
        streamsData = results.data.map(row => ({
            Title: row[0],
            Streams: row[1]
        }));
        console.log("Données des streams chargées :", streamsData);
        
    }
});

// ===============================
// VARIABLES GLOBALES
// ===============================
let tousLesAlbums = []; // Données de Deezer
let popupActive = null; // Popup actuelle (pour la fermer facilement)

// Nouveaux états pour le tri et le filtre courant
let sortAlphabetique = false;
let currentFilterType = 'album';


// ===============================
// FONCTION D’AFFICHAGE DES ALBUMS/EPs
// ===============================

// Fonction appelée automatiquement par Deezer (à cause du jsonp)
function afficherAlbums(data) {
    console.log("✅ Données Deezer :", data);
    tousLesAlbums = data.data;
    // afficher albums par défaut (met à jour currentFilterType)
    afficherFiltres('album');
}

function afficherFiltres(type) {
    const albumsDiv = document.querySelector(".discographie-lists");
    albumsDiv.innerHTML = ""; // on vide le conteneur
    // mettre à jour le filtre courant (utile pour le bouton de tri)
    currentFilterType = type;

    // Filtrer selon le type demandé (album ou ep)
    const filtres = tousLesAlbums.filter(album => {
        return album.record_type === type;
    });

    // Appliquer le tri alphabétique si demandé
    if (sortAlphabetique) {
        filtres.sort((a, b) => {
            const ta = (a.title || '').toString();
            const tb = (b.title || '').toString();
            return ta.localeCompare(tb, 'fr', { sensitivity: 'base' });
        });
    }

    if (filtres.length === 0) {
        albumsDiv.textContent = "Aucun résultat trouvé...";
        return;
    }

    // Créer chaque carte d’album
    filtres.forEach(album => {
        const div = document.createElement("div");
        div.className = "album"; // Mettre la classe album à la div
        div.dataset.idAlbum = album.id; // Mettre l'id de l'album à la div
        div.dataset.titleAlbum = album.title; // Mettre l'id de l'album à la div

        // Préparer le titre (tronqué si trop long)
        let titleDisplay = album.title || '';
        if (titleDisplay.length > 30) {
            titleDisplay = titleDisplay.substr(0, 30) + '...';
        }

        // Construire le HTML de la carte d'album proprement
        div.innerHTML = `
            <img src="${album.cover_medium}" alt="${album.title}">
            <div>
                <strong>${titleDisplay}</strong><br>
                <small>Sortie : ${album.release_date}</small><br>
                <a href="${album.link}" target="_blank">Écouter sur Deezer</a>
            </div>
        `;

        // Ouvrir popup au clic
        div.addEventListener('click', () => ouvrirPopupAlbum(album));

        // Si l'utilisateur clique sur le lien Deezer à l'intérieur de la carte,
        // on doit laisser le lien ouvrir dans un nouvel onglet sans déclencher la popup.
        const deezerLink = div.querySelector('a');
        if (deezerLink) {
            deezerLink.addEventListener('click', (e) => {
                e.stopPropagation(); // empêche la propagation vers la div parent
                // laisser le lien fonctionner normalement (target="_blank")
            });
        }

        albumsDiv.appendChild(div);
    });
}

// ===============================
// POPUP : OUVERTURE / FERMETURE
// ===============================

function ouvrirPopupAlbum(album) {
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';

    // Fermer une popup existante
    if (popupActive) popupActive.remove();

    // Créer la popup
    const divPopup = document.createElement('div');
    divPopup.className = 'popup-album';

    divPopup.innerHTML = `
        <div class="popup">
            <img src="${album.cover_medium}" alt="${album.title}">
            <h2>${album.title}</h2>
            <p>Date de sortie : ${album.release_date}</p>
            <p>Type : ${album.record_type}</p>
            <a href="${album.link}" target="_blank">Écouter l'album sur Deezer </a><br><br><br>

            <strong>Pistes :</strong>
            <ul id="trackList">Chargement des pistes...</ul>

            <br>
            <strong>Popularité / Écoutes :</strong>
            <canvas id="trackChart" width="350" height="250"></canvas>

            <br>
            <button id="closePopup">X</button>
        </div>
    `;

    // Bouton fermer
    divPopup.querySelector('#closePopup').addEventListener('click', fermerPopup);

    // Ajouter au body
    document.body.appendChild(divPopup);
    popupActive = divPopup;

    // Charger les pistes via JSONP
    chargerPistesAlbum(album.id);
}


function fermerPopup() {
    if (popupActive) {
        popupActive.remove();
        popupActive = null;
    }

    // Mettre par défaut le scroll au body
    document.body.style.overflow = '';
}

// ===============================
// CHARGER LES PISTES (JSONP)
// ===============================
function chargerPistesAlbum(albumId) {
    const script = document.createElement('script');
    script.src = `https://api.deezer.com/album/${albumId}/tracks?output=jsonp&callback=parseTracks`;
    document.body.appendChild(script);
}

// ===============================
// CALLBACK POUR LES PISTES
// ===============================
function parseTracks(data) {
    if (!popupActive) return;

    const trackListUl = popupActive.querySelector('#trackList');
    trackListUl.innerHTML = '';

    if (!data.data || data.data.length === 0) {
        trackListUl.textContent = 'Aucune piste trouvée 😕';
        return;
    }

    // --- Affichage des titres ---
    data.data.forEach(track => {
        const li = document.createElement('li');
        li.textContent = track.title;
        trackListUl.appendChild(li);
    });

    // --- Appel de la fonction du graphique ---
    afficherGraphiquePistes(data.data);
}
// ===============================
// GRAPHIQUE CHART.JS (avec les données du CSV)
// ===============================
function afficherGraphiquePistes(tracks) {
    const ctx = popupActive.querySelector('#trackChart');
    if (!ctx) return;

    const labels = tracks.map(t => t.title);
    const streams = tracks.map(track => {
        const found = streamsData.find(item =>
            item.Title?.trim().toLowerCase() === track.title.trim().toLowerCase()
        );
        if (found) {
            return parseInt(found.Streams.replace(/,/g, ''), 10);
        }
        return 0;
    });

    console.log(labels, streams);

    if (ctx.chartInstance) ctx.chartInstance.destroy();

    // Couleurs personnalisées : barres rouges et textes plus foncés
    const barColor = '#c0392b'; // rouge
    const barBorderColor = '#a52920';

    ctx.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Streams',
                data: streams,
                backgroundColor: barColor,
                borderColor: barBorderColor,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, ticks: { color: '#000' }, grid: { color: 'rgba(0,0,0,0.06)' } },
                y: { ticks: { color: '#000' } }
            },
            plugins: {
                legend: { display: false, labels: { color: '#000' } },
                tooltip: { backgroundColor: 'rgba(0,0,0,0.85)', titleColor: '#fff', bodyColor: '#fff' }
            }
        }
    });
}

// ===============================
// ATTACHEMENT DU BOUTON DE TRI
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const triBtn = document.querySelector('.tri');
    if (!triBtn) return;

    // Label initial
    triBtn.innerHTML = "<i class='bx bx-filter'></i> Par ordre alphabétique";

    triBtn.addEventListener('click', () => {
        sortAlphabetique = !sortAlphabetique;
        if (sortAlphabetique) {
            triBtn.innerHTML = "<i class='bx bx-sort-alpha-down'></i> A → Z";
        } else {
            triBtn.innerHTML = "<i class='bx bx-filter'></i> Par ordre alphabétique";
        }
        // Raffraîchir l'affichage en gardant le filtre courant
        afficherFiltres(currentFilterType);
    });
});

// ===============================
// RENDU GRAPHIQUE SYNTHÉTIQUE (Discographie) - Top 10
// ===============================
function renderDiscographyCharts() {
    const container = document.querySelector('.discographie-charts');
    if (!container) return;

    container.innerHTML = '';

    if (!streamsData || streamsData.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Données de streams non disponibles pour le moment.';
        container.appendChild(p);
        return;
    }

    // Préparer les données (normaliser les nombres)
    const processed = streamsData
        .map(item => {
            const n = typeof item.Streams === 'string'
                ? parseInt(item.Streams.replace(/,/g, ''), 10)
                : Number(item.Streams || 0);
            return { title: (item.Title || '').trim(), streams: isNaN(n) ? 0 : n };
        })
        .filter(x => x.title)
        .sort((a, b) => b.streams - a.streams)
        .slice(0, 10);

    if (processed.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucune donnée de streams disponible.';
        container.appendChild(p);
        return;
    }

    // Controls (titre + bouton d'orientation)
    const controls = document.createElement('div');
    controls.className = 'chart-controls';

    const left = document.createElement('div');
    left.className = 'left';
    const title = document.createElement('div');
    title.innerHTML = `<strong>Top ${processed.length} morceaux (sources : Kworb)</strong>`;
    left.appendChild(title);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-orientation';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-pressed', discographyOrientation === 'horizontal' ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', 'Basculer l\'orientation du graphique');
    toggleBtn.textContent = discographyOrientation === 'horizontal' ? 'Horizontal' : 'Vertical';
    toggleBtn.addEventListener('click', () => {
        discographyOrientation = discographyOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        toggleBtn.setAttribute('aria-pressed', discographyOrientation === 'horizontal' ? 'true' : 'false');
        toggleBtn.textContent = discographyOrientation === 'horizontal' ? 'Horizontal' : 'Vertical';
        // re-render
        renderDiscographyCharts();
    });

    left.appendChild(toggleBtn);
    controls.appendChild(left);

    const right = document.createElement('div');
    right.className = 'right';
    right.innerHTML = `<small class="disclaimer">Les valeurs sont fournies par le fichier CSV et peuvent différer selon la source.</small>`;
    controls.appendChild(right);

    container.appendChild(controls);

    // Zone du canvas
    const chartArea = document.createElement('div');
    chartArea.className = 'chart-area';
    const canvas = document.createElement('canvas');
    canvas.id = 'discographyTopChart';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Graphique : Top ${processed.length} morceaux par nombre d\'écoutes`);
    chartArea.appendChild(canvas);
    container.appendChild(chartArea);

    // Table accessible (sr-only)
    const table = document.createElement('table');
    table.className = 'sr-only';
    table.id = 'discographyTopTable';
    const caption = document.createElement('caption');
    caption.textContent = `Tableau : Top ${processed.length} morceaux et leurs streams`;
    table.appendChild(caption);
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th scope="col">Titre</th><th scope="col">Streams</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    processed.forEach(item => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = item.title;
        const td2 = document.createElement('td');
        td2.textContent = item.streams.toLocaleString();
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    // Liste visible sous le graphique (pour lisibilité) — accessible
    const listVisible = document.createElement('div');
    listVisible.className = 'list-visible';
    listVisible.id = 'discographyTopList';
    processed.forEach(item => {
        const it = document.createElement('div');
        it.className = 'item';
        it.tabIndex = 0;
        it.setAttribute('role', 'group');
        it.setAttribute('aria-label', `${item.title}, ${item.streams.toLocaleString()} écoutes`);

        const h = document.createElement('h4');
        h.textContent = item.title;
        const c = document.createElement('div');
        c.className = 'count';
        c.textContent = item.streams.toLocaleString() + ' écoutes';

        it.appendChild(h);
        it.appendChild(c);
        listVisible.appendChild(it);
    });
    container.appendChild(listVisible);

    // Préparer dataset
    const labels = processed.map(p => p.title);
    const data = processed.map(p => p.streams);

    // helper: split long labels into an array of lines for Chart.js multiline ticks
    function wrapLabel(str, maxChars) {
        if (!str) return [''];
        // try to split on spaces to keep words
        const words = str.split(' ');
        const lines = [];
        let current = '';
        for (const w of words) {
            if ((current + ' ' + w).trim().length <= maxChars) {
                current = (current + ' ' + w).trim();
            } else {
                if (current) lines.push(current);
                // if single word longer than maxChars, break it
                if (w.length > maxChars) {
                    for (let i = 0; i < w.length; i += maxChars) {
                        lines.push(w.substr(i, maxChars));
                    }
                    current = '';
                } else {
                    current = w;
                }
            }
        }
        if (current) lines.push(current);
        // limit to 3 lines to avoid overflow
        return lines.slice(0, 3);
    }

    // Détruire l'instance précédente si existante
    if (discographyChart) {
        try { discographyChart.destroy(); } catch (e) { /* ignore */ }
        discographyChart = null;
    }

    const ctx = canvas.getContext('2d');
    // helper: choose black or white text for contrast against a hex color
    function getContrastingColor(hex) {
        if (!hex) return '#111';
        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128 ? '#111' : '#fff';
    }

    // choose colors and label color for contrast
    const barColor = '#c0392b';
    const datalabelColor = getContrastingColor(barColor);

    // Auto-detect if horizontal orientation is needed based on label widths/count
    let autoHorizontal = discographyOrientation === 'horizontal';
    try {
        // measure longest label width using canvas 2D context
        const measureCtx = canvas.getContext('2d');
        measureCtx.font = '13px Space Grotesk, sans-serif';
        const labelWidths = labels.map(l => measureCtx.measureText(l || '').width || 0);
        const maxLabelWidth = Math.max(...labelWidths, 0);
        // available width per label
        const availableWidth = Math.max(120, (chartArea.clientWidth || 800) / Math.max(1, labels.length));
        // prefer vertical by default; switch to horizontal only when clearly needed
        if (labels.length > 12) autoHorizontal = true;
        // if label is much wider than available space and there are several labels, switch
        if (maxLabelWidth > availableWidth * 1.1 && labels.length > 6) autoHorizontal = true;
    } catch (e) { /* ignore measurement errors */ }

    // add a short textual summary above the chart for quick reading and screen readers
    try {
        const prev = container.querySelector('#discographySummary');
        if (prev) prev.remove();
        const maxVal = Math.max(...data);
        const idxMax = data.indexOf(maxVal);
        const summary = document.createElement('div');
        summary.id = 'discographySummary';
        summary.setAttribute('role', 'note');
        summary.setAttribute('aria-live', 'polite');
        summary.style.fontSize = '14px';
        summary.style.color = '#111';
        summary.style.marginBottom = '8px';
        if (idxMax >= 0) summary.textContent = `Piste la plus écoutée : ${labels[idxMax]} — ${maxVal.toLocaleString()} écoutes.`;
        else summary.textContent = `Top ${processed.length} morceaux`;
        container.insertBefore(summary, chartArea);
    } catch (e) { /* ignore */ }

    // build config with improved tick handling
    const pluginsList = [];
    try { if (typeof ChartDataLabels !== 'undefined') pluginsList.push(ChartDataLabels); } catch (e) { }

    const config = {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Streams', data, backgroundColor: barColor, borderRadius: 6, borderSkipped: false }]
        },
        options: {
            indexAxis: autoHorizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 8, right: 8, bottom: autoHorizontal ? 24 : 60, left: 8 } },
            scales: (function () {
                if (autoHorizontal) {
                    // labels on y axis
                    return {
                        x: { ticks: { color: '#111', font: { family: 'Space Grotesk, sans-serif', size: 13 }, callback: (v) => v.toLocaleString() }, grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: true },
                        y: { ticks: { color: '#111', font: { family: 'Space Grotesk, sans-serif', size: 13 }, callback: function (value, index) { return wrapLabel(this.getLabelForValue ? this.getLabelForValue(index) : value, 28); }, autoSkip: true, maxRotation: 0 }, grid: { display: false } }
                    };
                }
                // vertical labels on x axis
                return {
                    x: { ticks: { color: '#111', font: { family: 'Space Grotesk, sans-serif', size: 12 }, callback: function (value, index) { return wrapLabel(this.getLabelForValue ? this.getLabelForValue(index) : value, 14); }, maxRotation: 45, autoSkip: true, padding: 6 }, grid: { display: false } },
                    y: { ticks: { color: '#111', font: { family: 'Space Grotesk, sans-serif', size: 13 }, callback: function (value) { return value.toLocaleString(); } }, grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: true }
                };
            })(),
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: 'rgba(0,0,0,0.85)', titleColor: '#fff', bodyColor: '#fff', bodyFont: { size: 13 }, titleFont: { size: 13 }, callbacks: { title: (items) => items[0].label, label: (ctx) => ctx.parsed.y ? ctx.parsed.y.toLocaleString() + ' écoutes' : ctx.parsed.x.toLocaleString() + ' écoutes' } },
                datalabels: (function () { if (autoHorizontal) { return { anchor: 'end', align: 'right', color: datalabelColor, font: { weight: '700', size: 12 }, formatter: (value) => value.toLocaleString() }; } return { anchor: 'end', align: 'end', color: datalabelColor, font: { weight: '700', size: 12 }, formatter: (value) => value.toLocaleString() }; })()
            }
        },
        plugins: pluginsList
    };

    discographyChart = new Chart(ctx, config);
    // link canvas to visible list for screen readers and make it focusable
    try { canvas.setAttribute('aria-describedby', 'discographyTopList discographyTopTable discographySummary'); canvas.setAttribute('tabindex', '0'); } catch (e) { }
}