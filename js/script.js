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
    // Tous les titres à mettre à jour
    const allTitles = document.querySelectorAll("h2.title-list-albums-eps");

    // Tous les boutons Albums / EPs
    const allButtons = document.querySelectorAll(".display-type-albums button");

    // Sticky header principal
    const stickyHeaderTitle = document.querySelector(".discographie-header-sticky .title-logo-discographie h2");

    // Fonction pour gérer le clic sur un bouton
    function switchFilter(typeClass) {
        // Mettre à jour tous les boutons
        allButtons.forEach(btn => {
            if (btn.classList.contains(typeClass)) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Mettre à jour tous les titres
        allTitles.forEach(title => {
            title.textContent = typeClass === "display-albums" ? "Albums" : "EPs";
        });

        // Le sticky header principal reste "Discographies"
        stickyHeaderTitle.textContent = "Discographies";

        // Afficher le contenu filtré
        afficherFiltres(typeClass === "display-albums" ? "album" : "ep");
    }

    // Ajouter écouteur à tous les boutons
    allButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const typeClass = btn.classList[0]; // "display-albums" ou "display-eps"
            switchFilter(typeClass);
        });
    });


    /* ============================= */
    /* Navbar en position sticky de la partie discographie */
    /* ============================= */
    // Position sticky pour avoir une nav en position sticky 
    const stickyHeader = document.querySelector(".discographie-header-sticky");
    const normalHeader = document.querySelector(".discographie-header-normal");

    // Hauteur à partir de laquelle le sticky apparaît
    const triggerStart = normalHeader.getBoundingClientRect().bottom + window.scrollY;

    // Hauteur à laquelle le sticky disparaît
    const triggerEnd = 5075; // tu l'as déterminé manuellement

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;

        if (scrollY >= triggerStart && scrollY < triggerEnd) {
            stickyHeader.classList.add("active");
        } else {
            stickyHeader.classList.remove("active");
        }

        console.log("Scroll Y :", scrollY); // debug
    }, { passive: true });

    
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

