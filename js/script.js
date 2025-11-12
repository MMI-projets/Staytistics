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
    /* Scroll intéractif pour les membres de skz */
    /* ============================= */
    const scrollingText = document.querySelector('.scrolling-members-skz p');
    let lastScrollY = window.scrollY;   // dernière position du scroll
    let currentOffset = 0;               // offset horizontal actuel
    const speed = 3;                     // vitesse du défilement horizontal

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const delta = scrollY - lastScrollY; // différence de scroll depuis le dernier event

        // on ajoute delta * speed à l'offset horizontal
        currentOffset += delta * speed;

        // boucle infinie
        const width = scrollingText.offsetWidth;
        currentOffset = currentOffset % width;

        scrollingText.style.transform = `translateX(-${currentOffset}px)`;

        lastScrollY = scrollY; // mise à jour pour le prochain scroll
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
            if (entry.isIntersecting) {
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

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ff4c4c'); // rouge doux en haut
    gradient.addColorStop(1, '#ffc04c'); // doré clair en bas
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(255, 76, 76, 0.3)';
    ctx.shadowBlur = 10;

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

});


