    // ===============================
    // CHARGEMENT DU CSV DES STREAMS
    // ===============================
    let streamsData = []; // contiendra les données du CSV

    // Promise globale pour ne charger le CSV qu'une seule fois
    let streamsCSVPromise = null;

    function getStreamsData() {
        if (!streamsCSVPromise) {
            streamsCSVPromise = new Promise((resolve, reject) => {
                Papa.parse("kworb_stray_top_musics_streams.csv", {
                    download: true,
                    header: false,
                    complete: function (results) {
                        streamsData = results.data.map(row => ({
                            title: row[0],
                            streams: parseInt((row[1] || '0').replace(/,/g, ''), 10) || 0
                        }));
                        resolve(streamsData);
                    },
                    error: reject
                });
            });
        }
        return streamsCSVPromise;
    }

    // getStreamsData()
    // .then(() => {
    //     getAllAlbums(tousLesAlbums);
    //     afficherTop5GlobalSongs();
    // })
    // .catch(err => console.error("Erreur CSV :", err));
        
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
        console.log("Données Deezer :", data);
        tousLesAlbums = data.data;

        getStreamsData().then(() => {
            getStreamsData().then(() => console.log(streamsData));

            afficherFiltres('album');
            getAllAlbums(tousLesAlbums); // ✅ ici, après CSV chargé et albums reçus
            afficherTop5GlobalSongs();   // idem
        });

        // // Attendre CSV avant d'afficher les albums
        // getStreamsData().then(() => {
        //     afficherFiltres('album'); // Albums par défaut
        //     getAllAlbums(tousLesAlbums);
        // });
    }

    function afficherFiltres(type) {
        const albumsDiv = document.querySelector(".discographie-lists");
        albumsDiv.innerHTML = ""; // on vide le conteneur

        // mettre à jour le filtre courant (utile pour le bouton de tri)
        currentFilterType = type;

        // Filtrer selon le type demandé (album ou ep)
        let filtres = tousLesAlbums.filter(album => album.record_type === type);
        let numberAlbumsEps = document.querySelector('.number-albums-eps');
        numberAlbumsEps.textContent = "(Résultats trouvés :" + filtres.length + ")";


        if (!filtres || filtres.length === 0) {
            albumsDiv.textContent = "Aucun résultat trouvé...";
            return;
        }

        // Appliquer le tri alphabétique si cela est demandé
        if (sortAlphabetique) {
            filtres.sort((a, b) => {
                const ta = (a.title || '').toString();
                const tb = (b.title || '').toString();
                return ta.localeCompare(tb, 'fr', { sensitivity: 'base' });
            });
        }

        // Créer chaque carte d’album
        filtres.forEach(album => {
            if (!album) {
                return;
            }

            const div = document.createElement("div");
            div.className = "album";
            div.dataset.idAlbum = album.id || '';
            div.dataset.titleAlbum = album.title || '';

            // Réduction du titre (si le titre est trop long)
            let titleDisplay = album.title || '';
            if (titleDisplay.length > 30) {
                titleDisplay = titleDisplay.substr(0, 30) + '...';
                console.log("---");
                console.log("SUBSTRING TEST : " + titleDisplay);
                console.log("---");
            }

            // Construire le HTML de la carte d'album
            div.innerHTML = `
                <img src="${album.cover_medium || ''}" alt="${album.title || ''}">
                <div>
                    <h3>${titleDisplay}</h3><br>
                    <p>Sortie : ${album.release_date || 'Inconnue'}</p><br>
                    <a href="${album.link || '#'}" target="_blank" class="button-deezer"><i class='bx bx-play-circle'></i>Écouter sur Deezer</a>
                </div>
            `;

            // Ouvrir popup au clic
            div.addEventListener('click', () => ouvrirPopupAlbum(album));

            // Empêcher la popup si l'utilisateur clique sur le lien Deezer
            const deezerLink = div.querySelector('a');
            if (deezerLink) {
                deezerLink.addEventListener('click', (e) => e.stopPropagation());
            }

            albumsDiv.appendChild(div);
        });
    }


    // ===============================
    // POPUP : OUVERTURE / FERMETURE
    // ===============================

    function ouvrirPopupAlbum(album) {
        // On bloque le scroll du body
        document.body.style.overflow = 'hidden';

        // On ferme une popup existante
        if (popupActive) popupActive.remove();

        // On crée la popup
        const divPopup = document.createElement('div');
        divPopup.className = 'popup-album';

        divPopup.innerHTML = `
            <div class="popup">
                <button id="closePopup">X</button>
                <div class="album-popup-infos">
                    <img src="${album.cover_medium}" alt="${album.title}">
                    <div class="album-texts-popup-infos">
                        <h2>${album.title}</h2>
                        <p>Date de sortie : ${album.release_date}</p>
                        <p>Type : ${album.record_type}</p>
                        <a href="${album.link}" target="_blank" class="button-deezer">Écouter l'album sur Deezer</a><br><br><br>
                    </div>
                </div>

                <div class="tracks-album-popup">
                    <strong>Pistes :</strong>
                    <ul id="trackList">Chargement des pistes...</ul>
                </div>


                <br>
                <div class="graphic-songs-popup">
                    <strong>Nombres d'écoutes :</strong> <br>
                    <p id="albumTotalStreams" class="album-total-streams"></p><br>
                    <i class="disclaimer">(Certaines musiques n'ont pas de données)</i>
                    <canvas id="trackChart" width="350" height="250"></canvas>
                </div>
            </div>
        `;

        // Bouton fermer
        divPopup.querySelector('#closePopup').addEventListener('click', fermerPopup);

        // On ajoute au body
        document.body.appendChild(divPopup);
        popupActive = divPopup;
        popupActive.dataset.albumTitle = album.title; // On stocke le titre


        // Charger les pistes via JSONP
        chargerPistesAlbum(album.id);
    }

    function ouvrirPopUpMentionsCredits() {
        // On bloque le scroll du body
        document.body.style.overflow = 'hidden';


        console.log("ertesesrafgazeabdjnok,")

        // On ferme une popup existante
        if (popupActive) popupActive.remove();

        const divPopupMentionsCredits = document.createElement('div');
        divPopupMentionsCredits.className = 'popup-MentionsCredits';

        divPopupMentionsCredits.innerHTML = `
            <div class="popup">
                <div class="mentions-legales">
                    <h1>Mentions légales</h1>
                    <div class="infos-mentions-legales">     
                        <p>Staytistics est un projet étudiant d’analyse de l’évolution des écoutes du groupe de k-pop Stray Kids au fil du temps, réalisé en deuxième année du BUT Métiers du Multimédia et de l’Internet (MMI) à l’Université Gustave Eiffel.</p>

                        <h2>Éditeur du site</h2>
                        <p><strong>Université Gustave Eiffel</strong><br>
                        Adresse : 5 boulevard Descartes, 77454 Marne-la-Vallée Cedex 2, France<br>
                        Site web : <a href="https://www.univ-eiffel.fr" target="_blank">https://www.univ-eiffel.fr</a></p>
                        <p>Gilles Roussel, Président de l’Université Gustave Eiffel.</p>
                        

                        <h2>Données personnelles</h2>
                        <p>Ce site a été conçu à des fins exclusivement pédagogiques. Il ne collecte aucune donnée personnelle sensible et n’utilise aucun cookie permettant d’identifier les visiteurs du site.</p>
                        <p>Aucune donnée personnelle n’est donc traitée ou stockée par le site. En revanche l'hébergeur du site récolte certaines données techniques nécessaires à l'hébergement et à la sécurité du site.</p>

                        <h2>Hébergement</h2>
                        <p>Le site est hébergé par GitHub Pages, une plateforme appartenant à GitHub, Inc., dont le siège est situé au : 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.<br>
                        Site web : <a href="https://pages.github.com" target="_blank">https://pages.github.com/</a></p>

                        <h2>Délégué à la protection des données (DPO)</h2>
                        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), l’Université Gustave Eiffel dispose d’un Délégué à la Protection des Données (DPO) chargé de veiller au respect des obligations légales relatives à la protection des données.</p>
                        <p>Vous pouvez contacter <strong>Véronique Juge</strong> à l’adresse mail suivante : <a href="mailto:protectiondesdonnees-dpo@univ-eiffel.fr">protectiondesdonnees-dpo@univ-eiffel.fr</a></p>

                        <p>Adresse : 5 boulevard Descartes, 77454 Marne-la-Vallée Cedex 2, France</p>

                        <h2>Équipe du projet</h2>
                        <p>Le projet a été réalisé par :<br>
                        Alex Fiol, développeur front-end et contributeur au graphisme.<br>
                        Jimmy TE, développeur back-end et graphiste.</p>

                        <p>Pour toute demande de contact, vous pouvez nous contacter à nos adresses universitaires :<br>
                        <a href="mailto:alex.fiol@edu.univ-eiffel.fr">alex.fiol@edu.univ-eiffel.fr</a><br>
                        <a href="mailto:jimmy.te@edu.univ-eiffel.fr">jimmy.te@edu.univ-eiffel.fr</a></p>
                    </div>
                </div>

                <div class="credits">
                    <h1>Crédits</h1>
                    <div class="infos-credits">
                        <p>Les informations affichées sur ce site proviennent de sources publiques :</p>
                        <ul>
                            <li>API publique Deezer (<a href="https://developers.deezer.com/api" target="_blank">developers.deezer.com/api</a>) : données relatives aux albums, titres et métadonnées musicales.</li>
                            <li>Kworb (<a href="https://kworb.net/spotify/artist/2dIgFjalVxs4ThymZ67YCE_songs.html" target="_blank">https://kworb.net/</a>) : statistiques publiques concernant les écoutes des musiques de Stray Kids. (Kworb n’est pas une source officielle, il utilise des données provenant de différentes plateformes.)</li>
                            <li>Les images présentes sur le site des artistes sont relayées par la société de production JYP Entertainment a des fins de promotions pour le groupe Stray Kids.</li>
                            <li>Vidéo : montage réalisé à partir d’extraits de clips trouvés sur YouTube, utilisés à des fins pédagogiques. Les droits appartiennent aux auteurs respectifs.</li>
                            <li>Logo : généré initialement par une intelligence artificielle, puis modifié et adapté manuellement par les auteurs du projet.</li>
                            <li>Polices utilisées sur le site : Kolker Brush, Goudy Bookletter 1911 et Space Grotesk (Google Fonts).</li>
                            <li>Icônes utilisées : Boxicons (<a href="https://boxicons.com/" target="_blank">https://boxicons.com/</a>).</li>
                        </ul>
                        <br>
                    </div>
                </div>

                <button id="closePopup">X</button>
            </div>
        `;

        // Bouton fermer
        divPopupMentionsCredits.querySelector('#closePopup').addEventListener('click', fermerPopup);

        // On ajoute au body
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
            trackListUl.textContent = 'Aucune piste trouvée...';
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

        // =============================
        // Calcul du total streams
        // =============================
        const { streams } = getLabelsAndStreamsForAlbum(tracksDeezer);
        const totalAlbumStreams = streams.reduce((a, b) => a + b, 0);

        const totalText = popupActive.querySelector('#albumTotalStreams');
        if (totalText) {
            totalText.innerHTML = `L'album a fait un total de <strong>${totalAlbumStreams.toLocaleString('fr-FR')} streams</strong>.`;
        }

        // --- Appel de la fonction du graphique ---
        afficherGraphiquePistes(tracksDeezer);
    }
    // ===============================
    // GRAPHIQUE CHART.JS (avec les données du CSV)
    // ===============================

    function afficherGraphiquePistes(tracksDeezer) {
        const ctx = popupActive.querySelector('#trackChart');
        if (!ctx) return;

        // On récupère les labels et les streams
        // const { labels, streams } = compareTitleFromCSV_Deezer(tracksDeezer);

        const { labels, streams } = getLabelsAndStreamsForAlbum(tracksDeezer);


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
                    backgroundColor: 'rgba(165, 29, 25, 1)',
                    borderColor: 'rgba(224, 52, 30, 0.6)',
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
        // Si data est un objet avec 'data' (cas Deezer JSONP), prendre le tableau
        let albums;

        if (Array.isArray(data)) {
            albums = data; // data est déjà un tableau
        } else if (data && Array.isArray(data.data)) {
            albums = data.data; // on prend la propriété data du JSON renvoyé par Deezer
        } else {
            albums = []; // valeur par défaut si ce n'est pas un tableau
        }

        if (!Array.isArray(albums)) {
            console.error("getAllAlbums : data n'est pas un tableau !", data);
            return;
        }

        albumsPerYear(albums);

        console.log("====================");
        console.log("GetAllAlbums");
        console.log(albums);
        console.log("====================");
    }

    function albumsPerYear(data) {
        const albumsByYear = new Map();

        data.forEach(album => {
            const year = album.release_date.substr(0, 4);
            if (!albumsByYear.has(year)) {
                albumsByYear.set(year, []);
            }
            albumsByYear.get(year).push(album);
        });

        // Initialisation globale (pour qu'elle soit accessible à l'intérieur des callbacks JSONP)
        window.topAlbumsByYear = {};
        window.remainingAlbumsByYear = {};

        // On trie les années avant de boucler
        const sortedYears = Array.from(albumsByYear.keys()).sort((a, b) => a - b);

        sortedYears.forEach(year => {
            const albums = albumsByYear.get(year); // On récupère tous les albums d'une même année

            // On initialise le compteur pour cette même année
            window.remainingAlbumsByYear[year] = albums.length;

            albums.forEach(album => {
                if (!album.id) {
                    return;
                }

                // Callback unique pour cet album
                const callbackName = "callback_" + album.id;
                window[callbackName] = function (data) {
                    const tracks = data.data;
                    if (!tracks || tracks.length === 0) {
                        return;
                    }

                    // =======================
                    // Top album par année : 
                    // =======================

                    const { labels, streams } = getLabelsAndStreamsForAlbum(tracks);

                    // On fait la somme de toutes les écoutes de chaque musique de l'album (pour avoir l'album avec le plus d'écoutes)
                    const totalStreams = streams.reduce((a, b) => a + b, 0);

                    if (!window.topAlbumsByYear[year] || totalStreams > window.topAlbumsByYear[year].streams) {
                        window.topAlbumsByYear[year] = { album: album, streams: totalStreams };
                    }

                    window.remainingAlbumsByYear[year]--;

                    if (window.remainingAlbumsByYear[year] === 0) {
                        const top = window.topAlbumsByYear[year];
                        console.log(`Année ${year} : album le plus écouté = "${top.album.title}" avec ${top.streams} streams`);
                    }

                    // On affiche le graphique
                    if (Object.values(window.remainingAlbumsByYear).every(count => count === 0)) { // On vérifie si tous les compteurs sont à 0 (plus de d'albums restants à traiter)
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

    function afficherGraphiqueAlbumsParAnnee() {
        const ctx = document.getElementById('albumsOverYearsChart');
        if (!ctx) return;

        // On trie les années dans l'ordre croissant
        const anneesTriees = Object.keys(window.topAlbumsByYear).sort((a, b) => a - b);

        // Labels = années
        const labels = anneesTriees;

        // Données = streams max par année
        const streams = anneesTriees.map(year => window.topAlbumsByYear[year].streams);

        // Titres des albums pour chaque année
        const albumTitles = anneesTriees.map(year => window.topAlbumsByYear[year].album.title);

        // Si un graphique existe déjà, on le détruit
        if (ctx.chartInstance) {
            ctx.chartInstance.destroy();
        }

        // Création du graphique
        ctx.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Streams (par top album)',
                    data: streams,
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    borderColor: '#c0392b',
                    borderWidth: 5,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffffff', 
                    pointBorderColor: '#000000ff',
                    pointRadius: 10,
                    pointHoverRadius: 20
                }]
            },
            options: {
                layout: { padding: 30 },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#fff' }, ticks: { color: '#fff', font: { size: 14 } } },
                    x: { grid: { color: 'rgba(0,0,0,0.1)' }, ticks: { color: '#fff', font: { size: 14 } } }
                },
                plugins: {
                    title: { display: true, text: 'Top albums par année (en nombre de streams)' },
                    legend: { display: false },
                    customCanvasBackgroundColor: { color: '#0f1113' },
                    tooltip: {
                        mode: 'nearest',
                        intersect: true,
                        callbacks: {
                            title: function(context) {
                                const idx = context[0].dataIndex;
                                return albumTitles[idx];
                            },
                            label: function(context) {
                                const value = context.raw;
                                return `${value.toLocaleString()} streams`;
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hitRadius: 30,
                        hoverRadius: 12
                    }
                },
            }
        });

        // Permet d'ouvrir le popup de l'album en cliquant sur le point concerné
        ctx.onclick = function(event) {
            const points = ctx.chartInstance.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

            if (points.length > 0) {
                const index = points[0].index;
                const year = labels[index];
                const album = window.topAlbumsByYear[year].album;
                ouvrirPopupAlbum(album);
            }
        };



        // =========================
        // AFFICHAGE TEXTE DES ALBUMS
        // =========================
        const graphicTextsDiv = document.querySelector('.graphic-texts');
        if (graphicTextsDiv) {
            graphicTextsDiv.innerHTML = ''; // vider avant de remplir

            anneesTriees.forEach(year => {
                const topAlbum = window.topAlbumsByYear[year].album;
                const tracks = topAlbum.tracks ? topAlbum.tracks.data : [];
                const divYear = document.createElement('div');
                divYear.className = 'year-album-text';
                divYear.dataset.year = year; // ← indispensable pour le popup
                divYear.innerHTML = `
                    <h3>${year} - ${topAlbum.title}</h3>
                    <ul>
                        ${tracks.map(track => `<li>${track.title}</li>`).join('')}
                    </ul>
                `;
                graphicTextsDiv.appendChild(divYear);
            });
        }
        // ACTIVER POPUPS SUR LES BLOCS CRÉÉS
        document.querySelectorAll('.year-album-text').forEach(block => {
            block.addEventListener('click', () => {
                const year = block.dataset.year;
                const album = window.topAlbumsByYear[year].album; // Récupération de l'album
                ouvrirPopupAlbum(album); // Ouverture du popup principal
            });
        });


    }


    function creerPopupAlbum(year) {
        const topAlbum = window.topAlbumsByYear[year].album;
        const tracks = topAlbum.tracks ? topAlbum.tracks.data : [];

        // Calcul total streams
        const totalStreams = tracks.reduce((acc, t) => {
            const found = streamsData.find(s =>
                (s.Title || "").trim().toLowerCase() === (t.title || "").trim().toLowerCase()
            );
            return acc + (found ? parseInt(found.Streams.replace(/,/g, ''), 10) : 0);
        }, 0);

        // Création du popup
        const popup = document.createElement('div');
        popup.className = 'popup-album-overlay';
        popup.innerHTML = `
            <div class="popup-album-content">
                <button class="close-popup">X</button>
                <h2>${topAlbum.title} (${year})</h2>
                <p><strong>Total streams :</strong> ${totalStreams.toLocaleString()}</p>
                <ul>
                    ${tracks.map(track => {
                        const found = streamsData.find(s =>
                            (s.Title || "").trim().toLowerCase() === (track.title || "").trim().toLowerCase()
                        );
                        const streams = found ? parseInt(found.Streams.replace(/,/g, ''), 10) : 0;
                        return `<li>${track.title} <span>${streams.toLocaleString()} streams</span></li>`;
                    }).join('')}
                </ul>
            </div>
        `;

        // Fermeture
        popup.querySelector('.close-popup').addEventListener('click', () => popup.remove());

        document.body.appendChild(popup);
    }

    // ===============================
    // CALCUL DU TOP 5 GLOBAL
    // ===============================
    function getTop5GlobalSongs() {
        if (!streamsData || streamsData.length === 0) return [];

        // Trier du plus écouté au moins écouté
        return streamsData
            .filter(item => item.title && !isNaN(item.streams))
            .sort((a, b) => b.streams - a.streams)
            .slice(0, 5);
    }

    // ===============================
    // AFFICHAGE DU GRAPHIQUE TOP 5
    // ===============================
function afficherTop5GlobalSongs() {
    const ctx = document.getElementById('top5Chart');
    if (!ctx) return;

    const top5 = getTop5GlobalSongs();
    console.log("Top 5 chansons :", top5);

    const labels = top5.map(item => item.title);
    const streams = top5.map(item => item.streams);

    if (ctx.chartInstance) ctx.chartInstance.destroy();

    ctx.chartInstance = new Chart(ctx, {
        type: 'line', // ligne avec interpolation
        data: {
            labels,
            datasets: [{
                label: 'Streams',
                data: streams,
                backgroundColor: 'rgba(165, 29, 25, 0.2)',
                borderColor: 'rgba(224, 52, 30, 1)',
                borderWidth: 3,
                tension: 0.4, // ici l’interpolation (courbe lissée)
                fill: true,   // remplissage sous la courbe
                pointBackgroundColor: 'rgba(224, 52, 30, 1)',
                pointBorderColor: '#fff',
                pointRadius: 6,
                pointHoverRadius: 10
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => context.raw.toLocaleString('fr-FR') + " streams"
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { font: { size: 14 } }
                },
                x: {
                    ticks: { font: { size: 14 } }
                }
            },
            elements: {
                line: { borderJoinStyle: 'round' }
            }
        }
    });
}


    // Fonction de comparaison des titres du CSV et Deezer (il peut y avoir des différences dans le nom) 
    // => Fonction utilisée dans le popup lorsque l'on clique sur un album, pour récupérer toutes les musiques d'un album avec le nombre d'écoutes
    // => Pour obtenir les streams/écoutes des morceaux de musiques dans un album (en "matchant" les titres du CSV et ceux proposés par Deezer pour lier les mêmes musiques ensemble)

function getLabelsAndStreamsForAlbum(albumTracks) {
    if (!streamsData || streamsData.length === 0) {
        return { labels: [], streams: [] };
    }

    const labels = albumTracks.map(track => track.title);
    const streams = albumTracks.map(track => {
        const found = streamsData.find(item => {
            const csvTitle = (item.title || "").trim().toLowerCase();
            const trackTitle = (track.title || "").trim().toLowerCase();
            return csvTitle && trackTitle && (trackTitle.includes(csvTitle) || trackTitle === csvTitle);
        });
        return found ? found.streams : 0;
    });

    return { labels, streams };
}