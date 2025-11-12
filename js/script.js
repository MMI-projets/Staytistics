let sortAlphabetique = false;  // Tri alphabétique désactivé par défaut
let currentFilterType = 'album'; // Filtre courant par défaut

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

    /* ============================= */
    /* Boutons stop/play pour la vidéo dans le hero-section */
    /* ============================= */

   const playButtons = document.querySelectorAll(".play");
    playButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const video = button.previousElementSibling;
            if (video.paused) {
                video.play();
                button.textContent = "⏸"; 
            } else {
                video.pause();
                button.textContent = "⏵"; 
            }
        });
    });

    /* ============================= */
    /* Boutons qui gère albums/EPs */
    /* ============================= */

    // Gestion des boutons
    document.querySelector('.display-albums').addEventListener('click', () => {
        document.querySelector("h2.title-list-albums-eps").textContent = "Albums";
        afficherFiltres('album');
    });
    document.querySelector('.display-eps').addEventListener('click', () => {
        document.querySelector("h2.title-list-albums-eps").textContent = "EPs";
        afficherFiltres('ep');
    });

    /* ============================= */
    /* Effet de compteur - Animation - Chiffres du nombres d'écoutes sur Spotify de Stray Kids */
    /* ============================= */
    AOS.init({
        once: true, // animation une seule fois
        duration: 1200 // durée globale des animations
    });

    // Sélection de tous les compteurs
    const counters = document.querySelectorAll('.counter');

    const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
        // Lancer l'animation CounterUp
        window.counterUp.default(entry.target, {
            duration: 2500,
            delay: 16
        });
        observer.unobserve(entry.target); // pour ne l’animer qu’une seule fois
        }
    });
    }, { threshold: 0.5 }); // 50% visible pour déclencher

    counters.forEach(counter => {
    observer.observe(counter);
    });

    /* ============================= */
    /* Popup sur les mentions légales et les crédits */
    /* ============================= */
    document.querySelector("button.mentions-legales-credits").addEventListener("click", ouvrirPopUpMentionsCredits);


    // ===============================
    // ATTACHEMENT DU BOUTON DE TRI
    // ===============================


    const triBtn = document.querySelector('.tri');
    if (!triBtn) {
        return;
    } 

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

