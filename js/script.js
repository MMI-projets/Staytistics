let sortAlphabetique = false;  // Tri alphabétique désactivé par défaut
let currentFilterType = 'album'; // Filtre courant par défaut

// Données sur les présentataions des membres
const membersData = {
    "BangChan": {
        name: "Bang Chan",
        img: "images/bangchan-member.jpg",
        desc: `Leader du groupe Stray Kids, Bang Chan est reconnu pour son talent polyvalent en tant que chanteur, danseur, rappeur et producteur. Perfectionniste et travailleur, il est à l’origine de nombreuses compositions du groupe grâce à son implication au sein du trio de production 3RACHA. Charismatique et bienveillant, il est apprécié pour son énergie, sa créativité et son dévouement envers les fans comme envers ses membres.`
    },
    "Felix": {
        name: "Felix",
        img: "images/members/felix-member.jpg",
        desc: `Felix est connu pour sa voix grave iconique, son charisme puissant sur scène et sa personnalité douce hors scène. Danseur exceptionnel, il apporte une énergie unique aux performances du groupe.`
    },
    "Seungmin": {
        name: "Seungmin",
        img: "images/members/seungmin-member.jpg",
        desc: `Seungmin est le vocaliste principal du groupe, reconnu pour sa voix stable et émotionnelle. Appliqué et sérieux, il met un point d'honneur à toujours offrir des performances impeccables.`
    },
    "IN": {
        name: "IN",
        img: "images/members/in-member.jpg",
        desc: `IN est le plus jeune membre du groupe. Il possède une voix douce mais puissante et travaille constamment pour améliorer ses performances. Il est apprécié pour son humour et sa personnalité attachante.`
    },
    "Han": {
        name: "Han",
        img: "images/members/han-member.jpg",
        desc: `Han est chanteur, rappeur et producteur. Son talent polyvalent et sa sensibilité artistique sont au cœur de l'identité musicale du groupe.`
    },
    "Lee Know": {
        name: "Lee Know",
        img: "images/members/leeknow-member.jpg",
        desc: `Lee Know est danseur principal, connu pour sa précision et son charisme. Il possède un humour particulier très apprécié par les fans.`
    },
    "Hyunjin": {
        name: "Hyunjin",
        img: "images/members/hyunjin-member.jpg",
        desc: `Hyunjin est danseur principal et visuel du groupe. Ses expressions scéniques et son élégance en font l’un des membres les plus remarqués du groupe.`
    },
    "Changbin": {
        name: "Changbin",
        img: "images/members/changbin-member.jpg",
        desc: `Rappeur et membre de 3RACHA, Changbin est connu pour son flow rapide et puissant. Malgré son apparence intense, il est très impliqué et attentionné envers ses fans.`
    }
};

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM complètement chargé et parsé");
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
    /* Contenu sur les présentations des différents membres de Stray Kids */
    /* ============================= */

    // Sélection des éléments
    const buttons = document.querySelectorAll(".navbar-members button");
    const nameEl = document.querySelector(".infos-member .text-member h2");
    const descEl = document.querySelector(".infos-member .text-member p");
    const imgEl = document.querySelector(".infos-member img");

    // Événement clic pour chaque bouton
    buttons.forEach(button => {
        button.addEventListener("click", () => {

        // Style bouton actif
        const activeButton = document.querySelector(".navbar-members .active");

        if (activeButton) {
            activeButton.classList.remove("active");
        }

        button.classList.add("active");

            const memberKey = button.textContent.trim();

            // Mise à jour des infos
            const member = membersData[memberKey];

            if (member) {
                nameEl.textContent = member.name;
                descEl.textContent = member.desc;
                imgEl.src = member.img;
                imgEl.alt = member.name;
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
        let filtreType;

        if (typeClass === "display-albums") {
            filtreType = "album";
        } else {
            filtreType = "ep";
        }

        afficherFiltres(filtreType);
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

    const stickyHeader = document.querySelector(".discographie-header-sticky");
    const normalHeader = document.querySelector(".discographie-header-normal");

    // Hauteur à partir de laquelle le sticky apparaît
    const triggerStart = normalHeader.getBoundingClientRect().bottom + window.scrollY;

    // Hauteur à laquelle le sticky disparaît
    const triggerEnd = 5075;

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;

        if (scrollY >= triggerStart && scrollY < triggerEnd) {
            stickyHeader.classList.add("active");
        } else {
            stickyHeader.classList.remove("active");
        }

    }, { passive: true });

    
    /* ============================= */
    /* Effet de compteur - Animation - Chiffres du nombres d'écoutes sur Spotify de Stray Kids */
    /* ============================= */
    AOS.init({
        once: true,
        duration: 1200 
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


    /* =============================== */
    /* ATTACHEMENT DU BOUTON DE TRI */
    /* =============================== */

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
        afficherFiltres(currentFilterType);
    });
});

