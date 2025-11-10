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


// ===============================
// FONCTION D’AFFICHAGE DES ALBUMS/EPs
// ===============================

// Fonction appelée automatiquement par Deezer (à cause du jsonp)
function afficherAlbums(data) {
    console.log("✅ Données Deezer :", data);
    tousLesAlbums = data.data;
    afficherFiltres('album'); // on affiche les albums par défaut
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

        div.innerHTML = `
            <img src="${album.cover_medium}" alt="${album.title}">
            <div>`

            if(album.title.length > 20) {
                let nameAlbum = album.title.substr(0, 30);

                console.log("---");
                console.log("SUBSTRING TEST : " + nameAlbum);
                console.log("---");

                div.innerHTML += `<strong>${nameAlbum + '...' }</strong><br>`;
            } else {
                div.innerHTML += `<strong>${album.title}</strong><br>`;
                
            }

            div.innerHTML += `
                <small>Sortie : ${album.release_date}</small><br>
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
            <a href="${album.link}" target="_blank">Écouter l'album sur Deezer</a><br><br><br>

            <strong>Pistes :</strong>
            <ul id="trackList">Chargement des pistes...</ul>

            <br>
            <strong>Nombres d'écoutes :</strong> <br>
            <i class="disclaimer">(Certaines musiques n'ont pas de données)</i>
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
    popupActive.dataset.albumTitle = album.title; // on stocke le titre


    // Charger les pistes via JSONP
    chargerPistesAlbum(album.id);
}

function ouvrirPopUpMentionsCredits() {
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';


    console.log("ertesesrafgazeabdjnok,")

    // Fermer une popup existante
    if (popupActive) popupActive.remove();

    const divPopupMentionsCredits = document.createElement('div');
    divPopupMentionsCredits.className = 'popup-MentionsCredits';

    divPopupMentionsCredits.innerHTML = `
        <div class="popup">
            <h1>Mentions légales</h1>
            <section id="mentions-legales">
                <h2>1. Éditeur du site</h2>
                <p>
                    <strong>Nom du site :</strong> Staytistics<br>
                    <strong>Projet étudiant</strong> réalisé dans le cadre du BUT MMI (Métiers du Multimédia et de l’Internet) – Université Gustave Eiffel.<br>
                    <strong>Éditeurs :</strong> Alex Fiol et Jimmy Te<br>
                    <strong>Contact :</strong> 
                    <a href="mailto:alex.fiol@edu.univ-eiffel.fr">alex.fiol@edu.univ-eiffel.fr</a> / 
                    <a href="mailto:jimmy.te@edu.univ-eiffel.fr">jimmy.te@edu.univ-eiffel.fr</a><br><br>
                    Ce site a été conçu à des fins <strong>pédagogiques et non commerciales</strong>. 
                    Aucune transaction ni collecte de données personnelles sensibles n’est effectuée.
                </p>

                <h2>2. Délégué à la protection des données (DPO)</h2>
                <p>
                    Conformément au RGPD, l’Université Gustave Eiffel dispose d’un Délégué à la Protection des Données (DPO) chargé de veiller au respect des obligations légales relatives à la protection des données.<br><br>
                    <strong>Université Gustave Eiffel</strong><br>
                    <strong>DPO :</strong> dpo@univ-eiffel.fr<br>
                    <strong>Adresse :</strong> 5 boulevard Descartes, 77454 Marne-la-Vallée Cedex 2, France
                </p>

                <h2>3. Responsabilités et rôles</h2>
                <ul>
                    <li><strong>Alex Fiol</strong> – Développeur Front-end, aide au graphisme</li>
                    <li><strong>Jimmy Te</strong> – Développeur Back-end, graphiste</li>
                </ul>

                <h2>4. Hébergement</h2>
                <p>
                    <strong>Hébergeur :</strong> GitHub, Inc.<br>
                    <strong>Adresse :</strong> 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis<br>
                    <strong>Site web :</strong> 
                    <a href="https://pages.github.com" target="_blank">https://pages.github.com</a>
                </p>


                <h2>6. Données personnelles</h2>
                <p>
                    Le site ne collecte <strong>aucune donnée personnelle</strong> à des fins commerciales.<br>
                    Des données anonymes peuvent être recueillies via des outils d’analyse de trafic (par exemple GitHub Pages) uniquement à des fins statistiques.
                </p>

                <h2>7. Cookies</h2>
                <p>
                    Le site <em>Staytistics</em> ne dépose <strong>pas de cookies à des fins publicitaires</strong>.<br>
                    Seuls des cookies techniques essentiels au fonctionnement du site peuvent être utilisés.
                </p>

                <h2>8. Responsabilité</h2>
                <p>
                    Ce projet est réalisé dans un cadre universitaire et non professionnel.<br>
                    Les auteurs ne peuvent être tenus responsables d’éventuelles erreurs ou inexactitudes contenues sur le site, 
                    ni des changements apportés aux données externes par leurs fournisseurs (tels que Deezer).
                </p>


            </section>
            <h1>Crédits</h1>
            <section id="credits">
                <h2>Données et sources externes</h2>
                <p>
                    Les données affichées sur ce site proviennent de l’<strong>API publique de Deezer</strong> 
                    (<a href="https://developers.deezer.com/api" target="_blank">https://developers.deezer.com/api</a>).<br>
                    Ces données (titres, albums, artistes, pochettes, etc.) restent la propriété exclusive de Deezer et de leurs ayants droit.<br>
                    Le site <em>Staytistics</em> ne revendique aucune propriété sur ces contenus et les utilise dans un cadre 
                    strictement éducatif et non commercial.
                </p>

            </section>	
            <button id="closePopup">X</button>
        </div>
    `;

        // Bouton fermer
    divPopupMentionsCredits.querySelector('#closePopup').addEventListener('click', fermerPopup);

    // Ajouter au body
    document.body.appendChild(divPopupMentionsCredits);
    popupActive = divPopupMentionsCredits;
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
    let tracksDeezer = data.data;
    tracksDeezer.forEach(track => {

        console.log("---");
        console.log("TRACKS DE L'ALBUM : " + popupActive.dataset.albumTitle);
        console.log(track)
        console.log("---");


        const li = document.createElement('li');
        li.textContent = track.title;
        trackListUl.appendChild(li);
    });

    const totalStreams = getTotalStreamsForTracks(tracksDeezer);
    console.log("Total streams de l'album :", totalStreams);

    // --- Appel de la fonction du graphique ---
    afficherGraphiquePistes(tracksDeezer);
}
// ===============================
// GRAPHIQUE CHART.JS (avec les données du CSV)
// ===============================

function compareTitleFromCSV_Deezer(tracksDeezer) {
    // Si le CSV n'est pas encore chargé
    if (!streamsData || streamsData.length === 0) {
        console.log("⚠️ streamsData pas encore chargé !");
        return { labels: [], streams: [] };
    }

    const labels = tracksDeezer.map(t => t.title);
    const streams = tracksDeezer.map(tracksDeezer => {
        const found = streamsData.find(item => {
            const titleCSV = item.Title || "";
            const titleTrack = tracksDeezer.title || "";

            // Enlève les espaces et mises en minuscules
            const cleanCSV = titleCSV.trim().toLowerCase();
            const cleanTrack = titleTrack.trim().toLowerCase();

            // Comparaison des données de la track de Deezer et du fichier CSV de la musique
            if(cleanTrack.includes(cleanCSV) || cleanTrack === cleanCSV) {
                return true;       
            }
        });

        if (found) {
            return parseInt(found.Streams.replace(/,/g, ''), 10);
        }
        return 0;
    });
    return { labels, streams };

}

function afficherGraphiquePistes(tracksDeezer) {
    const ctx = popupActive.querySelector('#trackChart');
    if (!ctx) return;

    // On récupère les labels et les streams
    const { labels, streams } = compareTitleFromCSV_Deezer(tracksDeezer);

    console.log("=====");
    console.log(labels, streams);
    console.log("=====");


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

// =========================
// ========= Idées =========
// =========================
// Prendre les données du nombres d'écoutes des musiques du fichier CSV, 
// puispar l'API Deezer où on récupère les morceaux de musique par album, 
// On fait la somme de toutes les musiques de l'album en question 
// Chaque année, on récupère les données de tous les albums d'une même année,
// On pioche l'album qui a fait le plus d'écoutes (qui correspond au MAX du nb d'écoutes sur tous les albums de la même année),
// et on affiche dans le graphe l'album.

function getAllAlbums(data) {
    let tousLesAlbums = data.data; // Récupère tous les albums

    console.log("====================");
    console.log("GetAllAlbums");
    console.log(tousLesAlbums);
    console.log("====================");

    albumsPerYear(tousLesAlbums)
}

function albumsPerYear(data) {
    const albumsByYear = new Map();

    data.forEach(album => {
        const year = album.release_date.substr(0, 4);
        if (!albumsByYear.has(year)) albumsByYear.set(year, []);
        albumsByYear.get(year).push(album);
    });

    // 🧩 Initialisation globale une seule fois ici
    window.topAlbumsByYear = {};
    window.remainingAlbumsByYear = {};

    // 🔽 On trie les années avant de boucler
    const sortedYears = Array.from(albumsByYear.keys()).sort((a, b) => a - b);

    sortedYears.forEach(year => {
        const albums = albumsByYear.get(year);
        // initialiser correctement le compteur
        window.remainingAlbumsByYear[year] = albums.length; // compteur exact pour cette année

        albums.forEach(album => {
            if (!album.id) return;

            // callback unique pour cet album
            const callbackName = "callback_" + album.id;
            window[callbackName] = function(data) {
                const tracks = data.data;
                if (!tracks || tracks.length === 0) return;

                // =======================
                // Tous les albums suivi du nombre total d'écoutes de chaque morceau de musique de l'album :
                // =======================
                
                // const totalStreams = getStreamsForAlbum(tracks).reduce((a, b) => a + b, 0);
                // console.log(`Année ${year} : album "${album.title}" a ${totalStreams} streams`);

                // ------------------------------

                // =======================
                // Top album par année : 
                // =======================

                const totalStreams = getStreamsForAlbum(tracks).reduce((a, b) => a + b, 0);

                if (!window.topAlbumsByYear[year] || totalStreams > window.topAlbumsByYear[year].streams) {
                    window.topAlbumsByYear[year] = { album: album, streams: totalStreams };
                }

                window.remainingAlbumsByYear[year]--;

                if (window.remainingAlbumsByYear[year] === 0) {
                    const top = window.topAlbumsByYear[year];
                    console.log(`Année ${year} : album le plus écouté = "${top.album.title}" avec ${top.streams} streams`);
                }

                // On affiche le graphique
                if (Object.values(window.remainingAlbumsByYear).every(count => count === 0)) {
                    afficherGraphiqueAlbumsParAnnee();
                }

                delete window[callbackName];
            };

            const script = document.createElement('script');
            script.src = `https://api.deezer.com/album/${album.id}/tracks?output=jsonp&callback=${callbackName}`;
            document.body.appendChild(script);
        });
    });

}


function chargerPistesEtCalculerStreams(albumId, title, year) {
    // Stocker les infos pour retrouver album et année dans le callback
    window.currentAlbumInfo = { title, year };

    const script = document.createElement('script');
    script.src = `https://api.deezer.com/album/${albumId}/tracks?output=jsonp&callback=calculerStreamsAlbum`;
    document.body.appendChild(script);
}

function getStreamsForAlbum(albumTracks) {
    if (!streamsData || streamsData.length === 0) return [];

    return albumTracks.map(track => {
        const found = streamsData.find(item => {
            const csvTitle = (item.Title || "").trim().toLowerCase();
            const trackTitle = (track.title || "").trim().toLowerCase();
            return csvTitle && trackTitle && (trackTitle.includes(csvTitle) || trackTitle === csvTitle);
        });
        return found ? parseInt(found.Streams.replace(/,/g, ''), 10) : 0;
    });
}

function afficherGraphiqueAlbumsParAnnee() {
    const ctx = document.getElementById('albumsOverYearsChart');
    if (!ctx) return;

    // On trie les années dans l'ordre croissant
    const anneesTriees = Object.keys(window.topAlbumsByYear).sort((a, b) => a - b);

    // Labels = années
    const labels = anneesTriees;

    // Données = streams max par année
    const streams = anneesTriees.map(year => window.topAlbumsByYear[year].streams);

    // Si un graphique existe déjà, on le détruit pour éviter les doublons
    if (ctx.chartInstance) ctx.chartInstance.destroy();

    // Création du graphique
    ctx.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Streams (par top album)',
                data: streams,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true },
                x: {}
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Top albums par année (en nombre de streams)'
                },
                legend: { display: false }
            }
        }
    });
}


// =========================
// ======== EN PLUS ========
// =========================

// Récupère le total de streams d'un album depuis ton CSV
function getTotalStreamsForTracks(tracksDeezer) {
    if (!streamsData || streamsData.length === 0) {
        console.log("⚠️ streamsData pas encore chargé !");
        return 0;
    }

    return tracksDeezer.reduce((total, track) => {
        const found = streamsData.find(item => {
            const csvTitle = (item.Title || "").trim().toLowerCase();
            const trackTitle = (track.title || "").trim().toLowerCase();
            return csvTitle && trackTitle && (trackTitle.includes(csvTitle) || trackTitle === csvTitle);
        });

        return total + (found ? parseInt(found.Streams.replace(/,/g, ''), 10) : 0);
    }, 0);
}