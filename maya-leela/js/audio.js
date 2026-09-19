// audio.js - Procedural Web Audio Synthesizer for Bal Ganesha: Maya Leela
class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicPlaying = false;
        this.bgmTimer = null;
        this.tempo = 125;
        this.step = 0;
        this.masterGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.4;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 0.4;
        }
        return this.muted;
    }

    // Comedic Jump Sound
    playJump() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.14);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    // Comedic Death / Bonk Sound
    playDie() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.28);

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
    }

    // Trap Trigger Surprise Alert ("Uh-oh!")
    playTrapTrigger() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.setValueAtTime(1050, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Cartoon slide whistle when door flees
    playDoorFlee() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Modak Collection Sparkle
    playModak() {
        if (this.muted) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.2);
        });
    }

    // Realistic multi-harmonic temple bell
    playBell() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [440, 440 * 1.5, 440 * 2.05, 440 * 3.1];
        const decays = [1.2, 0.9, 0.6, 0.4];

        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0.18 / (i + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + decays[i]);
        });
    }

    // Sacred Shankh (Conch) & Fanfare on Victory
    playWin() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.linearRampToValueAtTime(235, now + 0.3);
        osc1.frequency.linearRampToValueAtTime(220, now + 0.8);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.linearRampToValueAtTime(700, now + 0.4);
        filter.frequency.linearRampToValueAtTime(350, now + 0.9);

        gain1.gain.setValueAtTime(0.01, now);
        gain1.gain.linearRampToValueAtTime(0.35, now + 0.2);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(filter);
        filter.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + 1.2);

        const fanfare = [392, 523.25, 659.25, 783.99, 1046.5];
        fanfare.forEach((freq, idx) => {
            const time = now + 0.4 + idx * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.28, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.4);
        });
    }

    // Catchy Retro Chiptune Loop
    startMusic() {
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        this.step = 0;

        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        const melody = [
            0, 1, 2, 4, 3, 2, 1, 0,
            2, 3, 4, 5, 4, 3, 2, 0,
            4, 5, 7, 5, 4, 3, 2, 1,
            3, 2, 1, 0, 1, 2, 0, null
        ];
        const bassPattern = [130.81, null, 130.81, 164.81, 196.00, null, 130.81, 196.00];
        const stepTimeMs = 140;

        this.bgmTimer = setInterval(() => {
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const mNote = melody[this.step % melody.length];
            const bNote = bassPattern[this.step % bassPattern.length];

            if (mNote !== null && mNote !== undefined) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(scale[mNote], now);

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 0.12);
            }

            if (bNote) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'sine';
                bOsc.frequency.setValueAtTime(bNote, now);
                bOsc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

                bGain.gain.setValueAtTime(0.12, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                bOsc.connect(bGain);
                bGain.connect(this.masterGain);
                bOsc.start(now);
                bOsc.stop(now + 0.12);
            }

            if (this.step % 4 === 0) {
                const bellOsc = this.ctx.createOscillator();
                const bellGain = this.ctx.createGain();
                bellOsc.type = 'sine';
                bellOsc.frequency.setValueAtTime(1760, now);
                bellGain.gain.setValueAtTime(0.03, now);
                bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                bellOsc.connect(bellGain);
                bellGain.connect(this.masterGain);
                bellOsc.start(now);
                bellOsc.stop(now + 0.15);
            }

            this.step++;
        }, stepTimeMs);
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundManager = new SoundManager();