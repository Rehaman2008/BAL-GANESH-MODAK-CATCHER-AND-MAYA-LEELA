/* =========================================================
   BAL GANESH MODAK CATCHER - GAMEPLAY ENGINE
   Pure Vanilla JavaScript & Web Audio API
   ========================================================= */

// Audio Synthesizer (Zero External Dependencies)
class DivineAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    playChime(freq = 660, type = 'sine', duration = 0.25, gainVal = 0.15) {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    }

    playCatch() {
        // Crisp musical ding
        this.playChime(587.33, 'triangle', 0.25, 0.2); // D5
        setTimeout(() => this.playChime(880, 'sine', 0.3, 0.15), 50); // A5
    }

    playLadduCatch() {
        this.playChime(659.25, 'triangle', 0.25, 0.2); // E5
        setTimeout(() => this.playChime(987.77, 'sine', 0.3, 0.18), 60); // B5
    }

    playGoldenModak() {
        // Celestial tri-tone arpeggio
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            setTimeout(() => this.playChime(freq, 'sine', 0.45, 0.18), idx * 80);
        });
    }

    playPowerup() {
        // Rising ethereal chime
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            setTimeout(() => this.playChime(freq, 'triangle', 0.35, 0.15), idx * 60);
        });
    }

    playHazard() {
        // Low comical thud / buzz
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(70, this.ctx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.35);
        } catch(e) {}
    }

    playTempleBell() {
        // Rich deep bell resonance
        if (this.isMuted || !this.ctx) return;
        [220, 440, 880, 1320].forEach((f, i) => {
            setTimeout(() => this.playChime(f, 'sine', 1.2 - i * 0.2, 0.12 / (i + 1)), i * 20);
        });
    }
}

const divineAudio = new DivineAudio();

// Game State Class
class ModakCatcherGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.active = false;
        this.paused = false;

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('bal_ganesh_high_score') || '0', 10);
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalCaught = 0;

        this.player = {
            x: 0,
            y: 0,
            width: 130,
            height: 120,
            speed: 8,
            targetX: 0,
            vx: 0,
            blinkTimer: 0,
            isBlinking: false,
            joyTimer: 0
        };

        this.items = [];
        this.particles = [];
        this.floatingTexts = [];
        this.spawnTimer = 0;
        this.magnetActive = false;
        this.magnetTime = 0;

        this.keys = {};
        this.touchLeft = false;
        this.touchRight = false;

        this.unlocked3000 = false;
        this.milestoneTriggeredThisRun = false;

        this.lastTime = 0;
        this.bindEvents();
        this.resize();
        this.updateHUD();
    }

    resize() {
        if (!this.canvas) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.player.y = this.height - this.player.height - 35;
        if (!this.active) {
            this.player.x = this.width / 2 - this.player.width / 2;
            this.player.targetX = this.player.x;
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyP' || e.code === 'Space') {
                if (this.active) this.togglePause();
            }
            if (e.code === 'KeyT') {
                cheatAddPoints(500);
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse & Touch Movement on Canvas
        const handlePointer = (clientX) => {
            if (!this.active || this.paused) return;
            const target = clientX - this.player.width / 2;
            this.player.targetX = Math.max(10, Math.min(this.width - this.player.width - 10, target));
        };

        window.addEventListener('mousemove', (e) => {
            if (this.active && !this.paused) {
                handlePointer(e.clientX);
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.active && !this.paused && e.touches.length > 0) {
                handlePointer(e.touches[0].clientX);
            }
        }, { passive: true });

        // Touch Control Buttons
        const leftBtn = document.getElementById('touchLeft');
        const rightBtn = document.getElementById('touchRight');
        if (leftBtn && rightBtn) {
            leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchLeft = true; });
            leftBtn.addEventListener('touchend', () => { this.touchLeft = false; });
            rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchRight = true; });
            rightBtn.addEventListener('touchend', () => { this.touchRight = false; });
        }
    }

    start() {
        divineAudio.init();
        divineAudio.playTempleBell();

        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalCaught = 0;
        this.items = [];
        this.particles = [];
        this.floatingTexts = [];
        this.magnetActive = false;

        this.active = true;
        this.paused = false;
        this.player.x = this.width / 2 - this.player.width / 2;
        this.player.targetX = this.player.x;

        document.getElementById('gameArena').classList.add('active');
        document.getElementById('gameOverModal').classList.remove('show');
        document.getElementById('gameInfo').style.opacity = '0';

        this.updateHUD();
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    togglePause() {
        this.paused = !this.paused;
        const btn = document.getElementById('btnPause');
        if (btn) btn.innerHTML = this.paused ? '▶️ Resume' : '⏸️ Pause';
    }

    updateHUD() {
        const scoreEl = document.getElementById('hudScore');
        const highEl = document.getElementById('hudHigh');
        const levelEl = document.getElementById('hudLevel');
        const comboEl = document.getElementById('hudCombo');

        if (scoreEl) scoreEl.textContent = this.score;
        if (highEl) highEl.textContent = this.highScore;
        if (levelEl) levelEl.textContent = this.level;

        // Diyas
        for (let i = 1; i <= 3; i++) {
            const diya = document.getElementById(`diya${i}`);
            if (diya) {
                if (i <= this.lives) {
                    diya.classList.remove('lost');
                } else {
                    diya.classList.add('lost');
                }
            }
        }

        // Combo
        if (comboEl) {
            if (this.combo >= 2) {
                comboEl.classList.add('active');
                comboEl.textContent = `Combo x${this.combo}!`;
            } else {
                comboEl.classList.remove('active');
            }
        }

        // 3000 Target Progress
        const fillEl = document.getElementById('milestoneFill');
        if (fillEl) {
            const pct = Math.min(100, Math.floor((this.score / 3000) * 100));
            fillEl.style.width = pct + '%';
        }

        // Check 3000 Milestone
        this.checkMilestone3000();
    }

    checkMilestone3000() {
        const hudGameBtn = document.getElementById('hudGameBtn');
        const topGameBtn = document.getElementById('topGameBtn');
        const modalGameBtn = document.getElementById('modalGameBtn');

        if (this.score >= 3000) {
            if (hudGameBtn) hudGameBtn.style.display = 'inline-flex';
            if (topGameBtn) topGameBtn.style.display = 'inline-flex';
            if (modalGameBtn) modalGameBtn.style.display = 'inline-flex';

            // Trigger on reaching 3000 for the first time
            if (!this.milestoneTriggeredThisRun) {
                this.milestoneTriggeredThisRun = true;
                this.unlocked3000 = true;

                divineAudio.playGoldenModak();
                setTimeout(() => divineAudio.playTempleBell(), 350);

                this.addParticles(this.width / 2, this.height * 0.45, '#ffd700', 45);
                this.addFloatingText('🌟 3000 UNLOCKED: MAYA LEELA! 🌟', this.width / 2, this.height * 0.35, '#ffea00');

                const modal = document.getElementById('milestoneModal');
                if (modal) {
                    modal.classList.add('show');
                    this.paused = true;
                    const pauseBtn = document.getElementById('btnPause');
                    if (pauseBtn) pauseBtn.innerHTML = '▶️ Resume';
                }
            }
        } else {
            // Strictly hide buttons until player reaches 3000 points
            if (hudGameBtn) hudGameBtn.style.display = 'none';
            if (topGameBtn) topGameBtn.style.display = 'none';
            if (modalGameBtn) modalGameBtn.style.display = 'none';
        }
    }

    spawnItem() {
        const rand = Math.random();
        let type = 'modak';
        let speed = 1.8 + (this.level * 0.32) + Math.random() * 0.8;

        if (rand < 0.50) {
            type = 'modak'; // Common (+10)
        } else if (rand < 0.72) {
            type = 'laddu'; // Sweet (+20)
            speed += 0.4;
        } else if (rand < 0.82) {
            type = 'gold_modak'; // Rare (+50)
            speed += 0.8;
        } else if (rand < 0.90) {
            type = 'lotus'; // Power-up (+1 Life / 30 pts)
            speed *= 0.85;
        } else {
            type = 'chilli'; // Hazard (-1 Life)
            speed += 0.7;
        }

        const size = type === 'lotus' ? 44 : (type === 'gold_modak' ? 42 : 36);
        const x = Math.random() * (this.width - size - 60) + 30;

        this.items.push({
            type,
            x,
            y: -50,
            size,
            speed,
            wobbleSpeed: Math.random() * 0.04 + 0.02,
            wobbleOffset: Math.random() * Math.PI * 2,
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 0.04
        });
    }

    addParticles(x, y, color = '#ffd700', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                color,
                size: Math.random() * 5 + 2,
                alpha: 1,
                life: 1
            });
        }
    }

    addFloatingText(text, x, y, color = '#ffd700') {
        this.floatingTexts.push({
            text,
            x,
            y,
            color,
            alpha: 1,
            vy: -1.8
        });
    }

    onItemCatch(item) {
        const catchX = item.x + item.size / 2;
        const catchY = item.y;

        this.player.joyTimer = 18; // Joyful face!
        this.totalCaught++;

        if (item.type === 'chilli') {
            divineAudio.playHazard();
            this.lives--;
            this.combo = 0;
            this.addParticles(catchX, catchY, '#ff2200', 20);
            this.addFloatingText('-1 🪔 OUCH!', catchX, catchY - 10, '#ff4444');

            if (this.lives <= 0) {
                this.gameOver();
                return;
            }
        } else {
            let pts = 10;
            let soundFn = () => divineAudio.playCatch();
            let sparkColor = '#ffd700';

            if (item.type === 'laddu') {
                pts = 20;
                soundFn = () => divineAudio.playLadduCatch();
                sparkColor = '#ff9900';
            } else if (item.type === 'gold_modak') {
                pts = 50;
                soundFn = () => divineAudio.playGoldenModak();
                sparkColor = '#fff275';
            } else if (item.type === 'lotus') {
                if (this.lives < 3) {
                    this.lives++;
                    this.addFloatingText('+1 🪔 DIVINE LIFE', catchX, catchY - 20, '#ff69b4');
                } else {
                    pts = 35;
                    this.addFloatingText('+35 LOTUS BLESSING', catchX, catchY - 20, '#ff69b4');
                }
                soundFn = () => divineAudio.playPowerup();
                sparkColor = '#ff69b4';
            }

            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            const multiplier = Math.min(5, Math.floor((this.combo - 1) / 3) + 1);
            const totalPts = pts * multiplier;
            this.score += totalPts;

            soundFn();
            this.addParticles(catchX, catchY, sparkColor, item.type === 'gold_modak' ? 25 : 12);
            
            let label = `+${totalPts}`;
            if (multiplier > 1) label += ` (x${multiplier})`;
            this.addFloatingText(label, catchX, catchY - 10, sparkColor);

            // Level progression
            const newLevel = Math.floor(this.score / 120) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                divineAudio.playTempleBell();
                this.addFloatingText(`⭐ LEVEL ${this.level}! ⭐`, this.width / 2, this.height * 0.4, '#ffd700');
            }

            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('bal_ganesh_high_score', this.highScore.toString());
            }
        }

        this.updateHUD();
    }

    onItemDrop(item) {
        if (item.type === 'gold_modak') {
            // Golden modak dropped breaks combo
            this.combo = 0;
            this.updateHUD();
        }
    }

    gameOver() {
        this.active = false;
        divineAudio.playTempleBell();

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('finalModaks').textContent = this.totalCaught;
        document.getElementById('finalCombo').textContent = `x${this.maxCombo}`;

        const modal = document.getElementById('gameOverModal');
        modal.classList.add('show');
    }

    update(dt) {
        if (!this.active || this.paused) return;

        // Player Movement Controls (Keys)
        if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft) {
            this.player.targetX -= this.player.speed * (dt / 16);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight) {
            this.player.targetX += this.player.speed * (dt / 16);
        }

        // Clamp target
        this.player.targetX = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.targetX));

        // Smooth Lerp movement (gentle and controlled)
        this.player.x += (this.player.targetX - this.player.x) * 0.15;

        // Blink & Joy timers
        this.player.blinkTimer += dt;
        if (this.player.blinkTimer > 3200) {
            this.player.isBlinking = true;
            if (this.player.blinkTimer > 3400) {
                this.player.isBlinking = false;
                this.player.blinkTimer = 0;
            }
        }
        if (this.player.joyTimer > 0) this.player.joyTimer -= 1;

        // Spawn items
        this.spawnTimer += dt;
        const spawnInterval = Math.max(500, 1100 - (this.level * 80));
        if (this.spawnTimer > spawnInterval) {
            this.spawnTimer = 0;
            this.spawnItem();
        }

        // Catch zone: Plate at the top of Ganesha
        const plateX = this.player.x + 15;
        const plateY = this.player.y + 15;
        const plateW = this.player.width - 30;
        const plateH = 28;

        // Update Items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            it.y += it.speed * (dt / 16);
            it.x += Math.sin(it.y * it.wobbleSpeed + it.wobbleOffset) * 1.2;
            it.rotation += it.rotSpeed;

            // Collision with plate
            if (
                it.x + it.size > plateX &&
                it.x < plateX + plateW &&
                it.y + it.size > plateY &&
                it.y < plateY + plateH
            ) {
                this.onItemCatch(it);
                this.items.splice(i, 1);
                continue;
            }

            // Floor drop
            if (it.y > this.height) {
                this.onItemDrop(it);
                this.items.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.025;
            p.alpha = Math.max(0, p.life);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update Floating Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= 0.022;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Temple Altar Ground Line
        this.ctx.save();
        const groundY = this.height - 25;
        const grad = this.ctx.createLinearGradient(0, groundY - 10, 0, this.height);
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
        grad.addColorStop(1, 'rgba(20, 10, 3, 0.9)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, groundY, this.width, 25);
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.width, groundY);
        this.ctx.stroke();
        this.ctx.restore();

        // 2. Render Falling Items
        for (const it of this.items) {
            this.renderItem(it);
        }

        // 3. Render Particles
        for (const p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 4. Render Bal Ganesha
        this.renderGanesha();

        // 5. Render Floating Scores
        for (const ft of this.floatingTexts) {
            this.ctx.save();
            this.ctx.globalAlpha = ft.alpha;
            this.ctx.font = 'bold 16px "Cinzel Decorative", serif';
            this.ctx.fillStyle = ft.color;
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = '#000';
            this.ctx.shadowBlur = 6;
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.restore();
        }
    }

    renderItem(it) {
        this.ctx.save();
        this.ctx.translate(it.x + it.size / 2, it.y + it.size / 2);
        this.ctx.rotate(it.rotation);

        const r = it.size / 2;

        if (it.type === 'modak' || it.type === 'gold_modak') {
            const isGold = it.type === 'gold_modak';
            
            // Aura glow for golden modak
            if (isGold) {
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 18;
            }

            // Modak Base & Teardrop/Cone Shape
            this.ctx.beginPath();
            this.ctx.moveTo(0, -r);
            this.ctx.bezierCurveTo(r * 0.9, -r * 0.2, r * 0.95, r * 0.6, 0, r * 0.9);
            this.ctx.bezierCurveTo(-r * 0.95, r * 0.6, -r * 0.9, -r * 0.2, 0, -r);

            if (isGold) {
                const goldGrad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, r);
                goldGrad.addColorStop(0, '#fff');
                goldGrad.addColorStop(0.3, '#ffeb3b');
                goldGrad.addColorStop(0.8, '#ff9800');
                goldGrad.addColorStop(1, '#b26a00');
                this.ctx.fillStyle = goldGrad;
            } else {
                // Classic Steamed Ukadiche Modak (Pearly White & Saffron Streak)
                const whiteGrad = this.ctx.createLinearGradient(0, -r, 0, r);
                whiteGrad.addColorStop(0, '#ffffff');
                whiteGrad.addColorStop(0.7, '#fbf8f0');
                whiteGrad.addColorStop(1, '#dfd5be');
                this.ctx.fillStyle = whiteGrad;
            }
            this.ctx.fill();
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeStyle = isGold ? '#ffd700' : '#c8b99d';
            this.ctx.stroke();

            // Modak Pleats / Creases (Kalya)
            this.ctx.beginPath();
            this.ctx.moveTo(0, -r);
            this.ctx.lineTo(0, r * 0.85);
            this.ctx.moveTo(0, -r);
            this.ctx.quadraticCurveTo(r * 0.45, 0, r * 0.35, r * 0.7);
            this.ctx.moveTo(0, -r);
            this.ctx.quadraticCurveTo(-r * 0.45, 0, -r * 0.35, r * 0.7);
            this.ctx.strokeStyle = isGold ? 'rgba(255,255,255,0.7)' : 'rgba(200, 180, 150, 0.6)';
            this.ctx.stroke();

            // Saffron Kesar tip
            this.ctx.beginPath();
            this.ctx.arc(0, -r * 0.75, 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff5722';
            this.ctx.fill();

        } else if (it.type === 'laddu') {
            // Motichoor Laddu (Golden Orange Pearl texture)
            this.ctx.beginPath();
            this.ctx.arc(0, 0, r, 0, Math.PI * 2);
            const ladduGrad = this.ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
            ladduGrad.addColorStop(0, '#ffe066');
            ladduGrad.addColorStop(0.5, '#ff9900');
            ladduGrad.addColorStop(1, '#cc5500');
            this.ctx.fillStyle = ladduGrad;
            this.ctx.fill();
            this.ctx.strokeStyle = '#e65100';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            // Sweet Magaz / Pistachio bits
            this.ctx.fillStyle = '#7cb342';
            this.ctx.fillRect(-r * 0.2, -r * 0.4, 4, 3);
            this.ctx.fillRect(r * 0.3, r * 0.2, 3, 4);

        } else if (it.type === 'lotus') {
            // Sacred Pink Lotus Flower
            this.ctx.shadowColor = '#ff69b4';
            this.ctx.shadowBlur = 12;
            this.ctx.fillStyle = '#ff69b4';
            // 5 Petals
            for (let p = 0; p < 5; p++) {
                this.ctx.save();
                this.ctx.rotate((p * Math.PI * 2) / 5);
                this.ctx.beginPath();
                this.ctx.ellipse(0, -r * 0.5, r * 0.35, r * 0.6, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
            // Center golden pollen
            this.ctx.beginPath();
            this.ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fill();

        } else if (it.type === 'chilli') {
            // Fiery Red Chilli Hazard
            this.ctx.shadowColor = '#ff1100';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -r);
            this.ctx.quadraticCurveTo(r * 0.8, -r * 0.2, r * 0.4, r * 0.9);
            this.ctx.quadraticCurveTo(-r * 0.6, r * 0.3, 0, -r);
            this.ctx.fillStyle = '#d32f2f';
            this.ctx.fill();

            // Stem
            this.ctx.beginPath();
            this.ctx.moveTo(0, -r);
            this.ctx.quadraticCurveTo(-r * 0.3, -r * 1.3, -r * 0.5, -r * 1.4);
            this.ctx.strokeStyle = '#388e3c';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    renderGanesha() {
        const p = this.player;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);

        const w = p.width;
        const h = p.height;
        const cx = w / 2;

        // 1. Divine Aura behind Ganesha
        const auraGrad = this.ctx.createRadialGradient(cx, h * 0.55, 10, cx, h * 0.55, w * 0.7);
        auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
        auraGrad.addColorStop(0.6, 'rgba(255, 140, 0, 0.15)');
        auraGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = auraGrad;
        this.ctx.beginPath();
        this.ctx.arc(cx, h * 0.55, w * 0.65, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. Golden Thali / Offering Plate at top (The Catcher!)
        const plateY = 22;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 12;
        const thaliGrad = this.ctx.createLinearGradient(10, plateY, w - 10, plateY);
        thaliGrad.addColorStop(0, '#d4af37');
        thaliGrad.addColorStop(0.5, '#fff6b0');
        thaliGrad.addColorStop(1, '#aa8210');
        this.ctx.fillStyle = thaliGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, plateY, w * 0.46, 11, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffe066';
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // 3. Cute Bal Ganesha Body & Dhoti
        // Body (Divine radiant yellow/peach)
        this.ctx.fillStyle = '#ffbe76';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, h * 0.78, 30, 24, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Yellow Silk Pitambar / Dhoti
        this.ctx.fillStyle = '#f9ca24';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, h * 0.85, 26, 16, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#e056fd';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 4. Large Flapping Cute Ears
        this.ctx.fillStyle = '#ffbe76';
        this.ctx.strokeStyle = '#f0932b';
        this.ctx.lineWidth = 2;

        // Left Ear
        this.ctx.beginPath();
        this.ctx.ellipse(cx - 36, h * 0.52, 18, 22, -0.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // Inner ear pink
        this.ctx.fillStyle = '#ff7979';
        this.ctx.beginPath();
        this.ctx.ellipse(cx - 36, h * 0.52, 11, 14, -0.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Right Ear
        this.ctx.fillStyle = '#ffbe76';
        this.ctx.beginPath();
        this.ctx.ellipse(cx + 36, h * 0.52, 18, 22, 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // Inner ear pink
        this.ctx.fillStyle = '#ff7979';
        this.ctx.beginPath();
        this.ctx.ellipse(cx + 36, h * 0.52, 11, 14, 0.2, 0, Math.PI * 2);
        this.ctx.fill();

        // 5. Cute Face & Head
        this.ctx.fillStyle = '#ffbe76';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, h * 0.52, 28, 26, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#f0932b';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 6. Mukut (Golden Divine Crown)
        this.ctx.fillStyle = '#f6e58d';
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 20, h * 0.38);
        this.ctx.lineTo(cx - 14, h * 0.22);
        this.ctx.lineTo(cx, h * 0.14); // peak
        this.ctx.lineTo(cx + 14, h * 0.22);
        this.ctx.lineTo(cx + 20, h * 0.38);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Crown Jewel Ruby
        this.ctx.beginPath();
        this.ctx.arc(cx, h * 0.26, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#eb4d4b';
        this.ctx.fill();

        // 7. Sacred Chandan Tilak on Forehead
        this.ctx.strokeStyle = '#d63031';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(cx, h * 0.43, 6, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        this.ctx.fillStyle = '#f0932b';
        this.ctx.beginPath();
        this.ctx.arc(cx, h * 0.42, 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        // 8. Playful Trunk (Sond)
        this.ctx.strokeStyle = '#f0932b';
        this.ctx.fillStyle = '#ffbe76';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 6, h * 0.55);
        this.ctx.bezierCurveTo(cx - 8, h * 0.68, cx + 18, h * 0.72, cx + 16, h * 0.62);
        this.ctx.bezierCurveTo(cx + 14, h * 0.58, cx + 2, h * 0.56, cx + 6, h * 0.55);
        this.ctx.fill();
        this.ctx.stroke();

        // 9. Expressive Large Eyes
        if (p.isBlinking) {
            // Closed blinking arcs
            this.ctx.strokeStyle = '#2d3436';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.arc(cx - 10, h * 0.48, 5, 0.1, Math.PI - 0.1);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(cx + 10, h * 0.48, 5, 0.1, Math.PI - 0.1);
            this.ctx.stroke();
        } else if (p.joyTimer > 0) {
            // Happy squint eyes ^ ^
            this.ctx.strokeStyle = '#2d3436';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.arc(cx - 10, h * 0.50, 6, Math.PI + 0.2, -0.2);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(cx + 10, h * 0.50, 6, Math.PI + 0.2, -0.2);
            this.ctx.stroke();
        } else {
            // Open cute doe eyes
            this.ctx.fillStyle = '#2d3436';
            this.ctx.beginPath();
            this.ctx.ellipse(cx - 10, h * 0.48, 4.5, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(cx + 10, h * 0.48, 4.5, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Sparkle highlights
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(cx - 8.5, h * 0.46, 1.8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(cx + 11.5, h * 0.46, 1.8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 10. Cute Mooshak (Little Mouse friend) on the left
        const mx = cx - 48;
        const my = h * 0.86;
        this.ctx.fillStyle = '#b2bec3';
        this.ctx.beginPath();
        this.ctx.ellipse(mx, my, 8, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // Mouse ear
        this.ctx.fillStyle = '#ff7675';
        this.ctx.beginPath();
        this.ctx.arc(mx - 3, my - 6, 3.5, 0, Math.PI * 2);
        this.ctx.fill();
        // Mouse snout & eye
        this.ctx.fillStyle = '#2d3436';
        this.ctx.fillRect(mx + 6, my - 1, 2, 2);

        this.ctx.restore();
    }

    loop(currentTime) {
        if (!this.active) return;
        const dt = Math.min(currentTime - this.lastTime, 60);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}

let game = null;

function initGameInstance() {
    if (!game) {
        game = new ModakCatcherGame();
    }
}

// Global UI Trigger Functions
function startGame() {
    initGameInstance();
    // Fade out UI layer
    const ui = document.getElementById('uiLayer');
    if (ui) ui.style.display = 'none';

    // Softly dim the intro camera rig
    const rig = document.getElementById('cameraRig');
    if (rig) rig.style.opacity = '0.4';

    game.start();
}

function returnToIntro() {
    const arena = document.getElementById('gameArena');
    if (arena) arena.classList.remove('active');
    
    const modal = document.getElementById('gameOverModal');
    if (modal) modal.classList.remove('show');

    const ui = document.getElementById('uiLayer');
    if (ui) {
        ui.style.display = 'flex';
        ui.style.opacity = '1';
        ui.style.pointerEvents = 'auto';
        ui.style.animation = 'none';
    }

    const rig = document.getElementById('cameraRig');
    if (rig) rig.style.opacity = '1';

    const info = document.getElementById('gameInfo');
    if (info) info.style.opacity = '1';

    if (game) game.active = false;
}

function toggleAudio() {
    const muted = divineAudio.toggleMute();
    const btn = document.getElementById('btnAudio');
    if (btn) btn.innerHTML = muted ? '🔇 Unmute' : '🔊 Sound';
}

function togglePause() {
    if (game) game.togglePause();
}

function launchNextGame() {
    // Navigate seamlessly to Maya Leela trial using relative path
    window.location.href = 'maya-leela/index.html';
}

function closeMilestoneModal() {
    const modal = document.getElementById('milestoneModal');
    if (modal) modal.classList.remove('show');
    if (game && game.active) {
        game.paused = false;
        const pauseBtn = document.getElementById('btnPause');
        if (pauseBtn) pauseBtn.innerHTML = '⏸️ Pause';
    }
}

function cheatAddPoints(pts = 500) {
    initGameInstance();
    if (game) {
        game.score += pts;
        game.updateHUD();
    }
}

// Keep game buttons hidden on page load until player scores 3000 points
window.addEventListener('DOMContentLoaded', () => {
    const topBtn = document.getElementById('topGameBtn');
    if (topBtn) topBtn.style.display = 'none';
    const hudBtn = document.getElementById('hudGameBtn');
    if (hudBtn) hudBtn.style.display = 'none';
    const modalBtn = document.getElementById('modalGameBtn');
    if (modalBtn) modalBtn.style.display = 'none';
});

