// Safe polyfill for Canvas roundRect
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        this.rect(x, y, w, h);
        return this;
    };
}

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Virtual resolution
        this.width = 800;
        this.height = 500;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game state
        this.currentLevelIndex = 0;
        this.deaths = 0;
        this.modaksCollected = 0;
        this.gameWon = false;
        this.screenShake = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.messageTimer = 0;
        this.messageText = '';

        // Input state
        this.keys = {
            left: false,
            right: false,
            jump: false,
            jumpJustPressed: false
        };

        // Entities & Managers
        this.player = new GaneshaPlayer(80, 380);
        this.trapManager = new TrapManager();
        this.particles = [];
        this.confetti = [];
        this.victoryTimeouts = [];
        this.deathTimeout = null;

        // Secret shortcut tracking ('D' and 'H' keys)
        this.activeKeys = new Set();
        this.lastDKeyTime = 0;
        this.lastHKeyTime = 0;
        this.secretKeyBuffer = '';

        // Comedic death quips for Mooshak the Mouse
        this.deathMessages = [
            "Maya (illusion) strikes again!",
            "Mooshak scampered into a trap! Squeak!",
            "Even the Modak was shocked!",
            "A test of divine patience for Mooshak!",
            "The door wanted some personal space!",
            "Who placed that Trishul there?!",
            "Gravity had other plans today!",
            "Close... but Maya was closer!"
        ];

        // Completed levels tracking (Set of 0-indexed completed levels)
        this.completedLevels = new Set();
        try {
            const savedCompleted = JSON.parse(localStorage.getItem('maya_leela_completed_levels') || '[]');
            if (Array.isArray(savedCompleted)) {
                this.completedLevels = new Set(savedCompleted);
            }
            const savedModaks = parseInt(localStorage.getItem('maya_leela_modaks_collected') || '0', 10);
            this.modaksCollected = isNaN(savedModaks) ? 0 : savedModaks;
        } catch(e) {}

        const urlParams = new URLSearchParams(window.location.search);
        let startLevel = 0;
        if (urlParams.has('level')) {
            const reqLvl = parseInt(urlParams.get('level'), 10) - 1;
            if (reqLvl >= 0 && reqLvl < GAME_LEVELS.length) {
                startLevel = reqLvl;
            }
        } else if (urlParams.has('start') || urlParams.has('reset')) {
            startLevel = 0;
            try {
                localStorage.removeItem('maya_leela_level');
            } catch(e) {}
        } else {
            const savedLevel = parseInt(localStorage.getItem('maya_leela_level') || '0', 10);
            if (savedLevel >= 0 && savedLevel < GAME_LEVELS.length) {
                startLevel = savedLevel;
            }
        }
        this.currentLevelIndex = startLevel;

        this.initInput();
        this.initLevelSelect();
        this.loadLevel(this.currentLevelIndex);
        this.startLoop();
    }

    getSkippedLevelsCount() {
        let count = 0;
        for (let i = 0; i < this.currentLevelIndex; i++) {
            if (!this.completedLevels.has(i)) {
                count++;
            }
        }
        return count;
    }

    initLevelSelect() {
        const sel = document.getElementById('levelSelect');
        if (!sel) return;
        this.refreshLevelSelect();

        // Manual level change from top dropdown: update level and immediately blur
        sel.addEventListener('change', (e) => {
            this.loadLevel(parseInt(e.target.value, 10));
            sel.blur();
        });

        // Intercept arrow keys so the dropdown never changes levels when pressing arrow keys
        sel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.code.startsWith('Arrow')) {
                e.preventDefault();
                e.stopPropagation();
                sel.blur();
            }
        });
    }

    refreshLevelSelect() {
        const sel = document.getElementById('levelSelect');
        if (!sel) return;
        sel.innerHTML = '';
        GAME_LEVELS.forEach((lvl, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            const cleanTitle = lvl.title.replace(/^\d+\.\s*/, '');
            if (this.completedLevels.has(idx)) {
                opt.textContent = `Lvl ${idx + 1}: ${cleanTitle} ✅`;
            } else if (idx < this.currentLevelIndex) {
                opt.textContent = `Lvl ${idx + 1}: ${cleanTitle} ⏭️ (Skipped)`;
            } else {
                opt.textContent = `Lvl ${idx + 1}: ${cleanTitle}`;
            }
            sel.appendChild(opt);
        });
        sel.value = this.currentLevelIndex;
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (window.soundManager && !window.soundManager.musicPlaying) {
                window.soundManager.init();
                window.soundManager.startMusic();
            }

            // Unfocus any active button or dropdown so arrow keys strictly move Bal Ganesha
            if (document.activeElement && document.activeElement !== document.body && document.activeElement !== this.canvas) {
                document.activeElement.blur();
            }

            const k = (e.key || '').toLowerCase();
            const code = e.code || '';

            this.activeKeys.add(code);
            this.activeKeys.add(k);

            if (k === 'd' || code === 'KeyD') {
                this.lastDKeyTime = Date.now();
            }
            if (k === 'h' || code === 'KeyH') {
                this.lastHKeyTime = Date.now();
            }

            this.secretKeyBuffer = (this.secretKeyBuffer + k).slice(-6);

            const now = Date.now();
            const isDHCombo =
                // Both keys held down:
                ((this.activeKeys.has('KeyD') || this.activeKeys.has('d')) && (this.activeKeys.has('KeyH') || this.activeKeys.has('h'))) ||
                // Pressed within 1.5 seconds of each other:
                (Math.abs(this.lastDKeyTime - this.lastHKeyTime) < 1500 && this.lastDKeyTime > 0 && this.lastHKeyTime > 0 && (now - Math.max(this.lastDKeyTime, this.lastHKeyTime) < 600)) ||
                // Sequenced in buffer:
                this.secretKeyBuffer.endsWith('dh') || this.secretKeyBuffer.endsWith('hd');

            if (isDHCombo) {
                this.lastDKeyTime = 0;
                this.lastHKeyTime = 0;
                this.secretKeyBuffer = '';
                this.keys.left = false;
                this.keys.right = false;
                this.keys.jump = false;
                this.triggerSecretComplete();
                return;
            }

            // Dedicated to-and-fro movement keys: NEVER change levels
            if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
                e.preventDefault();
            }
            if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
                e.preventDefault();
            }
            if (e.code === 'ArrowUp' || e.key === 'ArrowUp' || e.code === 'KeyW' || e.key === 'w' || e.key === 'W' || e.code === 'Space' || e.key === ' ') {
                if (!this.keys.jump) this.keys.jumpJustPressed = true;
                this.keys.jump = true;
                e.preventDefault();
            }
            if (e.code === 'ArrowDown' || e.key === 'ArrowDown') {
                e.preventDefault();
            }
            if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
                this.restartLevel();
            }
        });

        window.addEventListener('keyup', (e) => {
            const k = (e.key || '').toLowerCase();
            const code = e.code || '';
            this.activeKeys.delete(code);
            this.activeKeys.delete(k);

            if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
                e.preventDefault();
            }
            if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
                e.preventDefault();
            }
            if (e.code === 'ArrowUp' || e.key === 'ArrowUp' || e.code === 'KeyW' || e.key === 'w' || e.key === 'W' || e.code === 'Space' || e.key === ' ') {
                this.keys.jump = false;
                e.preventDefault();
            }
        });

        window.addEventListener('blur', () => {
            this.activeKeys.clear();
            this.keys.left = false;
            this.keys.right = false;
            this.keys.jump = false;
        });

        // Touch buttons for mobile support
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        const btnJump = document.getElementById('btnJump');

        const bindTouch = (btn, onDown, onUp) => {
            if (!btn) return;
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                if (window.soundManager && !window.soundManager.musicPlaying) {
                    window.soundManager.init();
                    window.soundManager.startMusic();
                }
                onDown();
            });
            btn.addEventListener('pointerup', (e) => {
                e.preventDefault();
                onUp();
            });
            btn.addEventListener('pointerleave', (e) => {
                e.preventDefault();
                onUp();
            });
        };

        bindTouch(btnLeft, () => this.keys.left = true, () => this.keys.left = false);
        bindTouch(btnRight, () => this.keys.right = true, () => this.keys.right = false);
        bindTouch(btnJump, () => {
            if (!this.keys.jump) this.keys.jumpJustPressed = true;
            this.keys.jump = true;
        }, () => this.keys.jump = false);
    }

    loadLevel(index) {
        if (index >= GAME_LEVELS.length) {
            this.triggerVictory();
            return;
        }

        this.levelWon = false;
        this.gameWon = false;
        this.clearVictoryTimeouts();
        this.confetti = [];
        this.particles = [];

        const nextBtn = document.getElementById('btnNextLevel');
        if (nextBtn) nextBtn.style.display = 'none';

        this.currentLevelIndex = index;
        this.currentLevel = GAME_LEVELS[index];

        try {
            localStorage.setItem('maya_leela_level', index.toString());
        } catch(e) {}

        this.refreshLevelSelect();

        const lvlSelect = document.getElementById('levelSelect');
        if (lvlSelect) {
            lvlSelect.value = index;
            lvlSelect.blur();
        }

        this.player.setSpawn(this.currentLevel.playerSpawn.x, this.currentLevel.playerSpawn.y);
        this.player.gravityInverted = false;

        // Reset traps & collectibles
        this.trapManager.clear();
        if (this.currentLevel.traps) {
            for (const trapCfg of this.currentLevel.traps) {
                const trap = TrapFactory.create(trapCfg);
                if (trap) this.trapManager.add(trap);
            }
        }

        this.collectibles = [];
        if (this.currentLevel.collectibles) {
            for (const colCfg of this.currentLevel.collectibles) {
                const col = TrapFactory.create(colCfg);
                if (col) this.collectibles.push(col);
            }
        }

        this.updateHUD();
        this.showTrollMessage(this.currentLevel.subtitle, 120);
    }

    updateHUD() {
        const lvlEl = document.getElementById('hudLevel');
        const compEl = document.getElementById('hudCompleted');
        const modakEl = document.getElementById('hudModaks');
        const skipEl = document.getElementById('hudSkipped');
        const deathEl = document.getElementById('hudDeaths');
        const titleEl = document.getElementById('hudTitle');

        if (lvlEl) lvlEl.innerText = `${this.currentLevelIndex + 1} / ${GAME_LEVELS.length}`;
        if (compEl) compEl.innerText = `${this.completedLevels.size} / ${GAME_LEVELS.length}`;
        if (modakEl) modakEl.innerText = this.modaksCollected;
        if (skipEl) skipEl.innerText = `${this.getSkippedLevelsCount()}`;
        if (deathEl) deathEl.innerText = this.deaths;
        if (titleEl) titleEl.innerText = this.currentLevel.title;
    }

    showTrollMessage(text, duration = 120) {
        this.messageText = text;
        this.messageTimer = duration;
        const msgEl = document.getElementById('trollBanner');
        if (msgEl) {
            msgEl.innerText = text;
            msgEl.classList.add('visible');
        }
    }

    hideTrollMessage() {
        const msgEl = document.getElementById('trollBanner');
        if (msgEl) msgEl.classList.remove('visible');
    }

    shakeScreen(intensity = 8) {
        this.screenShake = intensity;
    }

    spawnParticles(x, y, color = '#fef08a', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                color: color,
                size: 2 + Math.random() * 4
            });
        }
    }

    spawnFlowerShower() {
        const colors = ['#f59e0b', '#ef4444', '#fde047', '#f472b6', '#ffffff'];
        for (let i = 0; i < 90; i++) {
            this.confetti.push({
                x: Math.random() * this.width,
                y: -20 - Math.random() * 200,
                vx: (Math.random() - 0.5) * 2,
                vy: 2 + Math.random() * 3.5,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 6 + Math.random() * 8
            });
        }
    }

    killPlayer(customReason = null) {
        if (this.player.isDead || this.levelWon) return;
        this.player.isDead = true;
        this.deaths++;
        this.updateHUD();
        this.shakeScreen(10);

        if (window.soundManager) window.soundManager.playDie();

        this.spawnParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#fbbf24', 24);
        this.spawnParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ef4444', 16);

        const reason = customReason || this.deathMessages[Math.floor(Math.random() * this.deathMessages.length)];
        this.showTrollMessage(reason, 80);

        if (this.deathTimeout) clearTimeout(this.deathTimeout);
        this.deathTimeout = setTimeout(() => {
            if (!this.levelWon) {
                this.restartLevel();
            }
        }, 400);
    }

    triggerSecretComplete() {
        if (this.deathTimeout) {
            clearTimeout(this.deathTimeout);
            this.deathTimeout = null;
        }
        this.player.isDead = false;
        if (this.levelWon) {
            // If already won on this level, pressing DH advances to the next level and completes it
            if (this.currentLevelIndex < GAME_LEVELS.length - 1) {
                this.loadLevel(this.currentLevelIndex + 1);
            }
        }

        // Collect all sacred modaks in the level
        let modaksAdded = 0;
        if (this.collectibles && this.collectibles.length > 0) {
            for (const col of this.collectibles) {
                if (!col.collected) {
                    col.collected = true;
                    this.modaksCollected++;
                    modaksAdded++;
                    this.spawnParticles(col.x + (col.w || 26) / 2, col.y + (col.h || 26) / 2, '#fde047', 25);
                }
            }
        }
        if (modaksAdded === 0) {
            this.modaksCollected++;
            modaksAdded = 1;
        }

        try {
            localStorage.setItem('maya_leela_modaks_collected', this.modaksCollected.toString());
        } catch(e) {}

        if (window.soundManager) window.soundManager.playModak();

        this.levelWon = false;
        this.completedLevels.add(this.currentLevelIndex);
        try {
            localStorage.setItem('maya_leela_completed_levels', JSON.stringify([...this.completedLevels]));
        } catch(e) {}
        this.refreshLevelSelect();
        this.updateHUD();
        this.winLevel();
    }

    restartLevel() {
        this.loadLevel(this.currentLevelIndex);
    }

    collapseAllFloors() {
        for (const trap of this.trapManager.traps) {
            if (trap instanceof FallingFloor) {
                trap.triggered = true;
                trap.delay = 2;
            }
        }
    }

    unlockDoors() {
        for (const trap of this.trapManager.traps) {
            if (trap instanceof TrollDoor && trap.locked) {
                trap.locked = false;
            }
        }
    }

    winLevel() {
        if (this.levelWon) return;
        this.levelWon = true;

        if (window.soundManager) window.soundManager.playBell();
        this.spawnParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#22c55e', 35);

        // Mark current level as completed
        this.completedLevels.add(this.currentLevelIndex);
        try {
            localStorage.setItem('maya_leela_completed_levels', JSON.stringify([...this.completedLevels]));
        } catch(e) {}

        this.refreshLevelSelect();
        this.updateHUD();

        const nextBtn = document.getElementById('btnNextLevel');

        // Check if all 50 levels completed or final level conquered
        if (this.currentLevelIndex >= GAME_LEVELS.length - 1) {
            this.showTrollMessage("🏆 ALL 50 LEVELS CONQUERED & ALL MODAKS COLLECTED! GANPATI BAPPA MORYA! 🎉", 400);
            if (nextBtn) {
                nextBtn.innerHTML = "🏆 VICTORY CEREMONY 🎉";
                nextBtn.style.display = 'inline-flex';
            }
            // Automatically launch grand victory ceremony
            setTimeout(() => {
                this.triggerVictory();
            }, 600);
        } else {
            this.showTrollMessage("🎉 Level Conquered & Modaks Collected! Click NEXT LEVEL ➡️ above!", 300);
            if (nextBtn) {
                nextBtn.innerHTML = `✨ NEXT LEVEL (Lvl ${this.currentLevelIndex + 2}) ➡️`;
                nextBtn.style.display = 'inline-flex';
            }
        }
    }

    nextLevel() {
        const nextBtn = document.getElementById('btnNextLevel');
        if (nextBtn) nextBtn.style.display = 'none';

        if (this.currentLevelIndex >= GAME_LEVELS.length - 1) {
            this.triggerVictory();
        } else {
            this.loadLevel(this.currentLevelIndex + 1);
        }
    }

    clearVictoryTimeouts() {
        if (this.victoryTimeouts) {
            for (const t of this.victoryTimeouts) clearTimeout(t);
            this.victoryTimeouts = [];
        }
    }

    closeVictoryModal() {
        this.clearVictoryTimeouts();
        this.gameWon = false;
        this.confetti = [];
        this.particles = [];
        const victoryModal = document.getElementById('victoryModal');
        if (victoryModal) victoryModal.classList.remove('visible');
    }

    resetAllProgress() {
        this.clearVictoryTimeouts();
        this.gameWon = false;
        this.confetti = [];
        this.particles = [];
        this.modaksCollected = 0;

        try {
            localStorage.setItem('maya_leela_level', '0');
            localStorage.removeItem('maya_leela_completed_levels');
            localStorage.removeItem('maya_leela_modaks_collected');
        } catch(e) {}

        const targetUrl = window.location.pathname + '?level=1';
        if (window.location.search === '?level=1') {
            window.location.reload();
        } else {
            window.location.href = targetUrl;
        }
    }

    triggerVictory() {
        this.gameWon = true;
        if (window.soundManager) window.soundManager.playWin();
        
        this.clearVictoryTimeouts();
        // Multi-wave flower showers
        this.spawnFlowerShower();
        for (let i = 1; i <= 3; i++) {
            const t = setTimeout(() => {
                if (this.gameWon) this.spawnFlowerShower();
            }, i * 350);
            this.victoryTimeouts.push(t);
        }

        const victoryModal = document.getElementById('victoryModal');
        if (victoryModal) {
            const finalCompleted = document.getElementById('finalCompleted');
            const finalSkipped = document.getElementById('finalSkipped');
            const finalDeaths = document.getElementById('finalDeaths');
            const finalModaks = document.getElementById('finalModaks');

            if (finalCompleted) finalCompleted.innerText = `${this.completedLevels.size} / ${GAME_LEVELS.length}`;
            if (finalSkipped) finalSkipped.innerText = `${this.getSkippedLevelsCount()}`;
            if (finalDeaths) finalDeaths.innerText = this.deaths;
            if (finalModaks) finalModaks.innerText = `${this.modaksCollected} Sacred Modaks ✨`;
            victoryModal.classList.add('visible');
        }
    }

    checkCollision(rect1, rect2) {
        const w1 = rect1.width !== undefined ? rect1.width : rect1.w;
        const h1 = rect1.height !== undefined ? rect1.height : rect1.h;
        const w2 = rect2.width !== undefined ? rect2.width : rect2.w;
        const h2 = rect2.height !== undefined ? rect2.height : rect2.h;
        return (
            rect1.x < rect2.x + w2 &&
            rect1.x + w1 > rect2.x &&
            rect1.y < rect2.y + h2 &&
            rect1.y + h1 > rect2.y
        );
    }

    // Forgiving hazard hurtbox for Bal Ganesha (6px inset horizontally, 4px vertically)
    // Eliminates unfair 1-pixel deaths from spike edges or near-misses
    checkHazard(player, hazard) {
        const insetX = 6;
        const insetY = 4;
        const pLeft = player.x + insetX;
        const pRight = player.x + player.width - insetX;
        const pTop = player.y + insetY;
        const pBottom = player.y + player.height - insetY;
        const hw = hazard.width !== undefined ? hazard.width : hazard.w;
        const hh = hazard.height !== undefined ? hazard.height : hazard.h;

        return (
            pLeft < hazard.x + hw &&
            pRight > hazard.x &&
            pTop < hazard.y + hh &&
            pBottom > hazard.y
        );
    }

    updatePhysics() {
        const p = this.player;
        p.update(this.keys, this.currentLevel);
        this.keys.jumpJustPressed = false;

        const platforms = [...(this.currentLevel.platforms || [])];
        for (const trap of this.trapManager.traps) {
            if (trap instanceof FallingFloor && trap.isSolid) {
                platforms.push(trap);
            }
            if (trap instanceof MovingPlatform && trap.isSolid) {
                platforms.push(trap);
            }
        }

        // Horizontal Movement
        p.x += p.vx;
        for (const plat of platforms) {
            if (this.checkCollision(p, plat)) {
                if (p.vx > 0) {
                    p.x = plat.x - p.width;
                } else if (p.vx < 0) {
                    p.x = plat.x + plat.w;
                }
                p.vx = 0;
            }
        }

        // Vertical Movement
        p.y += p.vy;
        p.isGrounded = false;

        for (const plat of platforms) {
            if (this.checkCollision(p, plat)) {
                if (!p.gravityInverted) {
                    if (p.vy > 0) {
                        p.y = plat.y - p.height;
                        p.vy = 0;
                        p.isGrounded = true;
                    } else if (p.vy < 0) {
                        p.y = plat.y + plat.h;
                        p.vy = 0;
                    }
                } else {
                    if (p.vy < 0) {
                        p.y = plat.y + plat.h;
                        p.vy = 0;
                        p.isGrounded = true;
                    } else if (p.vy > 0) {
                        p.y = plat.y - p.height;
                        p.vy = 0;
                    }
                }
            }
        }

        if (p.y > 520 || (p.gravityInverted && p.y < -50)) {
            this.killPlayer("Mooshak slipped into the cosmic abyss!");
        }

        if (p.x < 10) p.x = 10;
        if (p.x > this.width - p.width - 10) p.x = this.width - p.width - 10;

        this.trapManager.update(p, this);
        if (this.collectibles) {
            for (const col of this.collectibles) {
                col.update(p, this);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life--;
            if (pt.life <= 0) this.particles.splice(i, 1);
        }

        if (!this.gameWon) {
            this.confetti = [];
        } else {
            for (let i = this.confetti.length - 1; i >= 0; i--) {
                const c = this.confetti[i];
                c.y += c.vy;
                c.x += c.vx;
                c.rot += c.rotSpeed;
                if (c.y > this.height + 20) {
                    c.y = -10;
                    c.x = Math.random() * this.width;
                }
            }
        }

        if (this.messageTimer > 0) {
            this.messageTimer--;
            if (this.messageTimer <= 0) {
                this.hideTrollMessage();
            }
        }

        if (this.screenShake > 0) {
            this.shakeX = (Math.random() - 0.5) * this.screenShake;
            this.shakeY = (Math.random() - 0.5) * this.screenShake;
            this.screenShake *= 0.86;
            if (this.screenShake < 0.3) {
                this.screenShake = 0;
                this.shakeX = 0;
                this.shakeY = 0;
            }
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.translate(this.shakeX, this.shakeY);

        this.drawBackground(ctx);

        if (this.currentLevel && this.currentLevel.platforms) {
            for (const plat of this.currentLevel.platforms) {
                this.drawPlatform(ctx, plat);
            }
        }

        this.trapManager.draw(ctx);

        if (this.collectibles) {
            for (const col of this.collectibles) {
                col.draw(ctx);
            }
        }

        if (!this.player.isDead) {
            this.player.draw(ctx);
        }

        for (const pt of this.particles) {
            ctx.save();
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = pt.life / pt.maxLife;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        for (const c of this.confetti) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rot);
            ctx.fillStyle = c.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, c.size, c.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    drawBackground(ctx) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.6, '#3b0764');
        bgGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.fillStyle = 'rgba(30, 27, 75, 0.45)';
        for (let x = 60; x < this.width; x += 150) {
            ctx.fillRect(x, 60, 28, this.height - 60);
            ctx.fillRect(x - 6, 60, 40, 12);
        }

        ctx.fillStyle = '#f59e0b';
        for (let x = 20; x < this.width; x += 30) {
            const drop = Math.sin(x * 0.05) * 8 + 14;
            ctx.beginPath();
            ctx.arc(x, drop, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#ef4444';
        for (let x = 35; x < this.width; x += 30) {
            const drop = Math.sin(x * 0.05) * 8 + 14;
            ctx.beginPath();
            ctx.arc(x, drop, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPlatform(ctx, plat) {
        ctx.save();
        ctx.translate(plat.x, plat.y);

        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, plat.w, plat.h);

        ctx.fillStyle = '#d97706';
        ctx.fillRect(0, 0, plat.w, 4);

        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(1, 1, plat.w - 2, plat.h - 2);

        ctx.strokeStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.lineWidth = 1;
        for (let bx = 10; bx < plat.w - 10; bx += 24) {
            ctx.strokeRect(bx, 8, 16, Math.min(18, plat.h - 12));
        }

        ctx.restore();
    }

    startLoop() {
        const loop = () => {
            this.updatePhysics();
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
    window.gameEngine = window.game;

    const muteBtn = document.getElementById('btnMute');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const isMuted = window.soundManager.toggleMute();
            muteBtn.innerText = isMuted ? '🔇' : '🔊';
        });
    }

    const btnPlayAgain = document.getElementById('btnPlayAgain');
    if (btnPlayAgain) {
        btnPlayAgain.addEventListener('click', () => {
            if (window.game) window.game.resetAllProgress();
        });
    }
});