let sortAlphabetique = false;  // Tri alphabétique désactivé par défaut
let currentFilterType = 'album'; // Filtre courant par défaut

// Données sur les présentataions des membres
const membersData = {
    "BangChan": {
        name: "Bang Chan",
        img: "images/members/bangchan-member.jpg",
        desc: `Bang Chan incarne le cœur créatif de Stray Kids. En tant que leader, il rassemble et guide le groupe tout en mettant en lumière sa polyvalence exceptionnelle : chanteur, danseur, rappeur et producteur. Il façonne l’identité musicale du groupe grâce à son travail acharné et à son implication au sein de 3RACHA, où il compose et produit une grande partie de leur discographie.`
    },
    "Felix": {
        name: "Felix",
        img: "images/members/felix-member.jpg",
        desc: `Danseur et rappeur de Stray Kids, Felix est reconnu pour son timbre grave singulier et sa présence scénique puissante. Dévoué et enthousiaste, il apporte une énergie lumineuse au groupe ainsi qu’une intensité marquante dans chaque performance. Bienveillant et chaleureux, il est apprécié pour sa personnalité rayonnante, son travail acharné et son impact vocal instantanément identifiable.`
    },
    "Seungmin": {
        name: "Seungmin",
        img: "images/members/seungmin-member.jpg",
        desc: `Vocaliste principal de Stray Kids, Seungmin se distingue par sa voix claire, stable et expressive. Sérieux et assidu, il contribue à définir la couleur vocale du groupe grâce à sa précision et à sa musicalité. Posé et attentionné, il est apprécié pour sa sincérité, son professionnalisme et sa capacité à transmettre une grande émotion à travers ses interprétations.`
    },
    "IN": {
        name: "IN",
        img: "images/members/in-member.jpg",
        desc: `Vocaliste de Stray Kids, I.N est reconnu pour son timbre distinct et sa progression constante au fil des années. Déterminé et appliqué, il travaille sans relâche pour affiner sa technique et trouver sa propre couleur artistique. Joyeux et sensible, il est apprécié pour son enthousiasme, sa gentillesse et la fraîcheur qu’il apporte au groupe en tant que plus jeune membre.`
    },
    "Han": {
        name: "Han",
        img: "images/members/han-member.jpg",
        desc: `Membre polyvalent de Stray Kids, Han excelle en tant que rappeur, chanteur et producteur. Talentueux et créatif, il contribue à l’écriture et à la composition de nombreuses chansons grâce à son rôle essentiel au sein de 3RACHA. Émotif et brillant, il est admiré pour sa capacité à transmettre des sentiments profonds, sa sensibilité artistique et son aisance dans tous les registres musicaux.`
    },
    "Lee Know": {
        name: "Lee Know",
        img: "images/members/leeknow-member.jpg",
        desc: `Danseur principal de Stray Kids, Lee Know est reconnu pour sa précision remarquable et son sens aiguisé du détail. Perfectionniste et rigoureux, il contribue fortement à l’identité scénique du groupe grâce à son style chorégraphique unique et maîtrisé. Charismatique et réservé, il est apprécié pour son humour discret, son professionnalisme et son engagement constant envers les performances du groupe.`
    },
    "Hyunjin": {
        name: "Hyunjin",
        img: "images/members/hyunjin-member.jpg",
        desc: `Danseur et visage du groupe, Hyunjin est reconnu pour son élégance scénique et son expressivité artistique. Appliqué et inspiré, il apporte une dimension visuelle forte à Stray Kids grâce à son implication dans l’esthétique et la narration des performances. Sensible et charismatique, il est apprécié pour sa présence captivante, son implication émotionnelle et son dévouement à perfectionner chaque détail.`
    },
    "Changbin": {
        name: "Changbin",
        img: "images/members/changbin-member.jpg",
        desc: `Rappeur principal de Stray Kids, Changbin se distingue par son flow puissant et sa maîtrise technique. Travailleur acharné et passionné, il participe à la composition et à l’écriture de nombreux titres grâce à son rôle fondamental au sein de 3RACHA. Créatif et déterminé, il est admiré pour son énergie explosive, son sens artistique et sa capacité à insuffler une intensité unique dans chaque morceau.`
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
            if (typeClass === "display-albums") {
                title.textContent = "Albums";
            } else {
                title.textContent = "EPs";
            }

        });

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