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

    // Filtrer selon le type demandé (album ou ep)
    const filtres = tousLesAlbums.filter(album => {
        return album.record_type === type;
    });

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
                <small>Type : ${album.record_type}</small><br>
                <a href="${album.link}" target="_blank">Écouter sur Deezer</a>
            </div>
        `;

        // Ouvrir popup au clic
        div.addEventListener('click', () => ouvrirPopupAlbum(album));

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

    ctx.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Streams',
                data: streams,
                backgroundColor: 'rgba(75,192,192,0.6)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true },
                y: {}
            },
            plugins: { legend: { display: false } }
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