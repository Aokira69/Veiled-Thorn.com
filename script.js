/* ==========================================================================
   VEILED THORN — SCRIPT.JS
   Theme: Dark Fantasy x Dark Forest x Isekai
   Developer: aokira
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. INITIAL SETUP & LOCAL STORAGE DATA
       ========================================================================== */
    const STORAGE_KEY = 'VEILED_THORN_DATA';
    
    let appState = {
        themeMode: 'Deep Night', // 'Deep Night', 'Moonlit Forest', 'Purple Eclipse'
        weather: 'Fog',          // 'Fog', 'Rain', 'Clear Night', 'Thunder'
        ambienceActive: false,
        player: {
            name: 'Wanderer',
            level: 1,
            xp: 0,
            nextXp: 100,
            bestScore: 0
        },
        achievements: {
            first: false,
            runner: false,
            driver: false,
            survivor: false,
            eternal: false
        },
        quests: {
            distance: 0,
            score: 0,
            dodged: 0
        },
        leaderboard: []
    };

    function loadStorageData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                appState = { ...appState, ...parsed };
            } catch (e) {
                console.error('Error loading data', e);
            }
        }
    }

    function saveStorageData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }

    loadStorageData();

    /* ==========================================================================
       2. LOADING SCREEN & PAGE TRANSITIONS (SPA)
       ========================================================================== */
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }
    }, 800);

    const navLinks = document.querySelectorAll('.nav-link, .nav-brand');
    const pageSections = document.querySelectorAll('.page-section');

    function switchPage(targetPageId) {
        pageSections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(targetPageId);
        if (targetSection) {
            targetSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Update Nav Active Class
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-page') === targetPageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close Mobile Menu if open
        const navMenu = document.getElementById('nav-menu');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburgerBtn.classList.remove('active');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            if (pageId) switchPage(pageId);
        });
    });

    const btnEnterVeil = document.getElementById('btn-enter-veil');
    if (btnEnterVeil) {
        btnEnterVeil.addEventListener('click', () => {
            switchPage('page-archives');
            showToast('Welcome to the Veiled Archives.');
        });
    }

    /* Mobile Hamburger Menu */
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    /* Navbar Scroll Behavior */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back To Top Button visibility
        const backToTopBtn = document.getElementById('btn-back-to-top');
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    });

    const backToTopBtn = document.getElementById('btn-back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ==========================================================================
       3. CUSTOM CURSOR & TOUCH RIPPLE
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('custom-cursor-follower');

    if (cursor && follower && window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            follower.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        });
    }

    // Touch Burst / Click Ripple Effect
    document.addEventListener('pointerdown', (e) => {
        createParticleBurst(e.clientX, e.clientY);
    });

    function createParticleBurst(x, y) {
        for (let i = 0; i < 6; i++) {
            const p = document.createElement('div');
            p.className = 'touch-particle';
            p.style.cssText = `
                position: fixed;
                left: ${x}px; top: ${y}px;
                width: 6px; height: 6px;
                background: ${i % 2 === 0 ? 'var(--primary-purple)' : 'var(--accent-magenta)'};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 8px var(--primary-purple);
                transition: transform 0.5s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.5s ease;
            `;
            document.body.appendChild(p);

            const angle = (Math.PI * 2 / 6) * i;
            const dist = 25 + Math.random() * 20;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;

            requestAnimationFrame(() => {
                p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
                p.style.opacity = '0';
            });

            setTimeout(() => p.remove(), 500);
        }
    }

    /* ==========================================================================
       4. AMBIENT BACKGROUND PARTICLES & WEATHER CANVAS
       ========================================================================== */
    const ambientCanvas = document.getElementById('ambient-canvas');
    const ctx = ambientCanvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        ambientCanvas.width = window.innerWidth;
        ambientCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class AmbientParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * ambientCanvas.width;
            this.y = Math.random() * ambientCanvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = -Math.random() * 0.5 - 0.2;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.color = Math.random() > 0.5 ? '#a855f7' : '#d946ef';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (appState.weather === 'Rain') {
                this.speedY = -Math.random() * 3 - 2;
                this.y -= this.speedY; // Falling down
            }

            if (this.y < 0 || this.y > ambientCanvas.height || this.x < 0 || this.x > ambientCanvas.width) {
                this.reset();
                if (appState.weather === 'Rain') this.y = 0;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initAmbientParticles() {
        const count = window.innerWidth < 768 ? 25 : 60;
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new AmbientParticle());
        }
    }
    initAmbientParticles();

    function renderAmbient() {
        ctx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
        
        // Render Particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Thunder Flash Effect
        if (appState.weather === 'Thunder' && Math.random() < 0.005) {
            ctx.fillStyle = 'rgba(233, 213, 255, 0.25)';
            ctx.fillRect(0, 0, ambientCanvas.width, ambientCanvas.height);
        }

        requestAnimationFrame(renderAmbient);
    }
    renderAmbient();

    /* ==========================================================================
       5. ACCORDION CHANNELS INTERACTION
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            
            const isOpen = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
                accItem.querySelector('.accordion-content').style.maxHeight = null;
            });

            // Open clicked if was closed
            if (!isOpen) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    /* ==========================================================================
       6. REAL-TIME CLOCK & DASHBOARD CONTROLS
       ========================================================================== */
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const clockTimeEl = document.getElementById('clock-time');
        if (clockTimeEl) {
            clockTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
        }

        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

        const clockDateEl = document.getElementById('clock-date');
        const clockDayEl = document.getElementById('clock-day');

        if (clockDateEl) clockDateEl.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        if (clockDayEl) clockDayEl.textContent = days[now.getDay()];
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Mode Toggle (Day/Night Mode)
    const btnToggleMode = document.getElementById('btn-toggle-mode');
    const modeText = document.getElementById('mode-text');
    const modes = ['Deep Night', 'Moonlit Forest', 'Purple Eclipse'];

    if (btnToggleMode) {
        btnToggleMode.addEventListener('click', () => {
            const currentIdx = modes.indexOf(appState.themeMode);
            const nextIdx = (currentIdx + 1) % modes.length;
            appState.themeMode = modes[nextIdx];
            
            applyThemeMode(appState.themeMode);
            saveStorageData();
        });
    }

    function applyThemeMode(mode) {
        document.body.className = '';
        if (mode === 'Deep Night') document.body.classList.add('theme-deep-night');
        if (mode === 'Moonlit Forest') document.body.classList.add('theme-moonlit');
        if (mode === 'Purple Eclipse') document.body.classList.add('theme-eclipse');
        if (modeText) modeText.textContent = mode;
    }
    applyThemeMode(appState.themeMode);

    // Weather Toggle
    const btnToggleWeather = document.getElementById('btn-toggle-weather');
    const weatherText = document.getElementById('weather-text');
    const weatherTypes = ['Fog', 'Rain', 'Clear Night', 'Thunder'];

    if (btnToggleWeather) {
        btnToggleWeather.addEventListener('click', () => {
            const currentIdx = weatherTypes.indexOf(appState.weather);
            const nextIdx = (currentIdx + 1) % weatherTypes.length;
            appState.weather = weatherTypes[nextIdx];

            if (weatherText) weatherText.textContent = appState.weather;
            showToast(`Weather changed to ${appState.weather}`);
            saveStorageData();
        });
    }

    // Ambience Audio Toggle (Synthetic Web Audio API Synth)
    const btnToggleAmbience = document.getElementById('btn-toggle-ambience');
    const ambienceText = document.getElementById('ambience-text');
    let audioCtx = null;
    let ambienceOscillator = null;

    if (btnToggleAmbience) {
        btnToggleAmbience.addEventListener('click', () => {
            appState.ambienceActive = !appState.ambienceActive;
            
            if (appState.ambienceActive) {
                startSynthAmbience();
                if (ambienceText) ambienceText.textContent = 'Ambience: ON';
                showToast('Forest Ambience Playing');
            } else {
                stopSynthAmbience();
                if (ambienceText) ambienceText.textContent = 'Ambience: OFF';
            }
        });
    }

    function startSynthAmbience() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            ambienceOscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            ambienceOscillator.type = 'sine';
            ambienceOscillator.frequency.setValueAtTime(110, audioCtx.currentTime); // Low mystical drone
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

            ambienceOscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            ambienceOscillator.start();
        } catch (e) {
            console.log('Audio Context Error', e);
        }
    }

    function stopSynthAmbience() {
        if (ambienceOscillator) {
            ambienceOscillator.stop();
            ambienceOscillator.disconnect();
            ambienceOscillator = null;
        }
    }

    /* ==========================================================================
       7. PAGE 3 — MINI GAME ENGINE (THORN RUNNER 2D)
       ========================================================================== */
    const canvas = document.getElementById('game-canvas');
    const gCtx = canvas ? canvas.getContext('2d') : null;

    let gameLoopReq = null;
    let isGaming = false;
    let score = 0;
    let distance = 0;
    let speed = 4;
    let dodgedCars = 0;

    const playerCar = {
        x: 180,
        y: 480,
        width: 40,
        height: 70,
        speed: 6,
        targetX: 180
    };

    let obstacles = [];

    function initGame() {
        score = 0;
        distance = 0;
        speed = 4;
        dodgedCars = 0;
        playerCar.x = canvas.width / 2 - 20;
        playerCar.targetX = playerCar.x;
        obstacles = [];
        updateGameUI();
    }

    function spawnObstacle() {
        const lanes = [60, 150, 240, 310];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        obstacles.push({
            x: randomLane,
            y: -80,
            width: 38,
            height: 65,
            speed: speed + Math.random() * 2,
            color: Math.random() > 0.5 ? '#d946ef' : '#8b5cf6'
        });
    }

    function updateGame() {
        if (!isGaming) return;

        // Player movement interpolation
        playerCar.x += (playerCar.targetX - playerCar.x) * 0.2;

        // Keep inside bounds
        if (playerCar.x < 20) playerCar.x = 20;
        if (playerCar.x > canvas.width - 60) playerCar.x = canvas.width - 60;

        distance += Math.floor(speed);
        score += 1;

        // Speed scaling
        if (distance % 500 === 0) speed += 0.5;

        // Spawn obstacles
        if (Math.random() < 0.03) spawnObstacle();

        // Update obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.y += obs.speed;

            // Collision check
            if (
                playerCar.x < obs.x + obs.width &&
                playerCar.x + playerCar.width > obs.x &&
                playerCar.y < obs.y + obs.height &&
                playerCar.y + playerCar.height > obs.y
            ) {
                gameOver();
                return;
            }

            // Remove out of bounds
            if (obs.y > canvas.height) {
                obstacles.splice(i, 1);
                dodgedCars++;
                score += 20;
            }
        }

        // Update Quest & Achievement Progress
        updateQuestsProgress();

        renderGame();
        updateGameUI();
        gameLoopReq = requestAnimationFrame(updateGame);
    }

    function renderGame() {
        // Clear background
        gCtx.fillStyle = '#0a0414';
        gCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Road Lines
        gCtx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        gCtx.setLineDash([20, 20]);
        gCtx.lineWidth = 2;
        gCtx.beginPath();
        gCtx.moveTo(canvas.width / 3, 0);
        gCtx.lineTo(canvas.width / 3, canvas.height);
        gCtx.moveTo((canvas.width / 3) * 2, 0);
        gCtx.lineTo((canvas.width / 3) * 2, canvas.height);
        gCtx.stroke();
        gCtx.setLineDash([]);

        // Draw Player Car
        gCtx.fillStyle = '#a855f7';
        gCtx.shadowColor = '#a855f7';
        gCtx.shadowBlur = 10;
        gCtx.fillRect(playerCar.x, playerCar.y, playerCar.width, playerCar.height);

        // Draw Obstacles
        obstacles.forEach(obs => {
            gCtx.fillStyle = obs.color;
            gCtx.shadowColor = obs.color;
            gCtx.shadowBlur = 8;
            gCtx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });

        gCtx.shadowBlur = 0; // Reset
    }

    function updateGameUI() {
        document.getElementById('game-score').textContent = score;
        document.getElementById('game-distance').textContent = `${distance}m`;
        document.getElementById('game-speed').textContent = `${speed.toFixed(1)}x`;
        document.getElementById('game-highscore').textContent = appState.player.bestScore;
    }

    function startGame() {
        initGame();
        isGaming = true;
        document.getElementById('game-overlay').classList.remove('active');
        gameLoopReq = requestAnimationFrame(updateGame);
    }

    function gameOver() {
        isGaming = false;
        cancelAnimationFrame(gameLoopReq);

        if (score > appState.player.bestScore) {
            appState.player.bestScore = score;
            showToast('New High Score!');
            updateLeaderboard('Wanderer', score);
        }

        // Gain XP
        const xpEarned = Math.floor(score / 5);
        addPlayerXP(xpEarned);

        saveStorageData();

        const overlay = document.getElementById('game-overlay');
        document.getElementById('overlay-title').textContent = 'GAME OVER';
        document.getElementById('overlay-subtitle').textContent = `Score: ${score} | Distance: ${distance}m`;
        document.getElementById('btn-game-start').textContent = 'RESTART RUN';
        overlay.classList.add('active');
    }

    // Controls Handling
    const btnStart = document.getElementById('btn-game-start');
    if (btnStart) btnStart.addEventListener('click', startGame);

    const btnLeft = document.getElementById('btn-ctrl-left');
    const btnRight = document.getElementById('btn-ctrl-right');
    const btnAction = document.getElementById('btn-ctrl-action');

    if (btnLeft) {
        btnLeft.addEventListener('pointerdown', () => {
            playerCar.targetX -= 50;
        });
    }
    if (btnRight) {
        btnRight.addEventListener('pointerdown', () => {
            playerCar.targetX += 50;
        });
    }
    if (btnAction) {
        btnAction.addEventListener('pointerdown', () => {
            speed = Math.max(2, speed - 1.5); // Brake feature
        });
    }

    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
        if (!isGaming) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') playerCar.targetX -= 40;
        if (e.key === 'ArrowRight' || e.key === 'd') playerCar.targetX += 40;
        if (e.key === 'ArrowDown' || e.key === 's') speed = Math.max(2, speed - 1);
    });

    // Touch Swipe Controls
    let touchStartX = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    canvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        if (diff > 30) playerCar.targetX += 50;
        if (diff < -30) playerCar.targetX -= 50;
    });

    /* ==========================================================================
       8. PLAYER PROFILE, ACHIEVEMENTS, QUESTS & LEADERBOARD
       ========================================================================== */
    function addPlayerXP(amount) {
        appState.player.xp += amount;
        if (appState.player.xp >= appState.player.nextXp) {
            appState.player.level += 1;
            appState.player.xp -= appState.player.nextXp;
            appState.player.nextXp = Math.floor(appState.player.nextXp * 1.5);
            showToast(`LEVEL UP! You are now Level ${appState.player.level}`);
        }
        renderPlayerProfile();
    }

    function renderPlayerProfile() {
        document.getElementById('player-name').textContent = appState.player.name;
        document.getElementById('player-level').textContent = appState.player.level;
        document.getElementById('player-xp').textContent = appState.player.xp;
        document.getElementById('player-next-xp').textContent = appState.player.nextXp;

        const fillPercent = (appState.player.xp / appState.player.nextXp) * 100;
        document.getElementById('xp-bar-fill').style.width = `${fillPercent}%`;
    }
    renderPlayerProfile();

    function unlockAchievement(key, name) {
        if (!appState.achievements[key]) {
            appState.achievements[key] = true;
            showToast(`Achievement Unlocked: ${name}`);
            saveStorageData();
            renderAchievements();
        }
    }

    function renderAchievements() {
        const achMap = {
            first: 'First Journey',
            runner: 'Thorn Runner',
            driver: 'Shadow Driver',
            survivor: 'Forest Survivor',
            eternal: 'Eternal Wanderer'
        };

        Object.keys(achMap).forEach(key => {
            const el = document.querySelector(`[data-ach="${key}"]`);
            if (el && appState.achievements[key]) {
                el.classList.remove('locked');
                el.classList.add('unlocked');
            }
        });
    }
    renderAchievements();

    function updateQuestsProgress() {
        // Unlock Achievements based on conditions
        if (distance > 10) unlockAchievement('first', 'First Journey');
        if (distance >= 500) unlockAchievement('runner', 'Thorn Runner');
        if (score >= 1000) unlockAchievement('driver', 'Shadow Driver');
        if (distance >= 2000) unlockAchievement('survivor', 'Forest Survivor');
        if (appState.player.level >= 5) unlockAchievement('eternal', 'Eternal Wanderer');

        // Quest statuses UI update
        const q1 = document.getElementById('quest-1-status');
        const q2 = document.getElementById('quest-2-status');
        const q3 = document.getElementById('quest-3-status');

        if (q1) q1.textContent = `${Math.min(distance, 1000)}/1000m`;
        if (q2) q2.textContent = `${Math.min(score, 500)}/500`;
        if (q3) q3.textContent = `${Math.min(dodgedCars, 20)}/20`;
    }

    function updateLeaderboard(name, newScore) {
        appState.leaderboard.push({ name, score: newScore });
        appState.leaderboard.sort((a, b) => b.score - a.score);
        appState.leaderboard = appState.leaderboard.slice(0, 3); // Top 3
        renderLeaderboard();
    }

    function renderLeaderboard() {
        const listEl = document.getElementById('leaderboard-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        const board = appState.leaderboard.length ? appState.leaderboard : [
            { name: 'Wanderer', score: appState.player.bestScore }
        ];

        board.forEach((item, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="rank">#${idx + 1}</span> <span class="name">${item.name}</span> <span class="score">${item.score}</span>`;
            listEl.appendChild(li);
        });
    }
    renderLeaderboard();

    /* ==========================================================================
       9. TOAST NOTIFICATION SYSTEM
       ========================================================================== */
    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

});
