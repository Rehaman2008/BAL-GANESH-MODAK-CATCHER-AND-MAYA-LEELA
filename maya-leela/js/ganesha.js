// ganesha.js - Bal Ganesha Player Entity, Physics & Canvas Drawing
class GaneshaPlayer {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.reset();
        this.width = 34;
        this.height = 42;

        // Physics constants (Calibrated slower scampering with higher, floatier jump)
        this.accel = 0.28;
        this.maxSpeed = 1.8;
        this.friction = 0.72;
        this.gravity = 0.26;
        this.jumpForce = -8.8;
        this.terminalVel = 8.0;

        // Visual animation state
        this.walkCycle = 0;
        this.squishX = 1;
        this.squishY = 1;
        this.blinkTimer = 100;
        this.isBlinking = false;
        this.panicTimer = 0;
        this.trunkWave = 0;
        this.haloGlow = 0;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.facing = 1;
        this.coyoteTime = 0;
        this.jumpBuffer = 0;
        this.isDead = false;
        this.panicTimer = 0;
        this.gravityInverted = false;
    }

    setSpawn(x, y) {
        this.startX = x;
        this.startY = y;
        this.reset();
    }

    triggerPanic(duration = 45) {
        this.panicTimer = duration;
    }

    update(keys, level) {
        if (this.isDead) return;

        const gDir = this.gravityInverted ? -1 : 1;

        if (this.isGrounded) {
            this.coyoteTime = 12; // 12-frame generous ledge jump forgiveness
        } else if (this.coyoteTime > 0) {
            this.coyoteTime--;
        }

        if (keys.jumpJustPressed) {
            this.jumpBuffer = 12; // 12-frame pre-touch jump buffer
        } else if (this.jumpBuffer > 0) {
            this.jumpBuffer--;
        }

        // Dedicated to-and-fro movement: Left is ALWAYS Left, Right is ALWAYS Right
        let moveDir = 0;
        if (keys.left) moveDir -= 1;
        if (keys.right) moveDir += 1;

        if (moveDir !== 0) {
            this.vx += moveDir * this.accel;
            this.facing = moveDir;
            this.walkCycle += 0.08;
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 0.05) this.vx = 0;
            this.walkCycle = 0;
        }

        this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

        if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
            this.vy = this.jumpForce * gDir;
            this.jumpBuffer = 0;
            this.coyoteTime = 0;
            this.isGrounded = false;
            this.squishX = 0.75;
            this.squishY = 1.35;
            if (window.soundManager) window.soundManager.playJump();
        }

        if (!keys.jump && ((!this.gravityInverted && this.vy < -3) || (this.gravityInverted && this.vy > 3))) {
            this.vy *= 0.65;
        }

        this.vy += this.gravity * gDir;
        if (!this.gravityInverted && this.vy > this.terminalVel) this.vy = this.terminalVel;
        if (this.gravityInverted && this.vy < -this.terminalVel) this.vy = -this.terminalVel;

        this.squishX += (1 - this.squishX) * 0.15;
        this.squishY += (1 - this.squishY) * 0.15;

        if (this.panicTimer > 0) this.panicTimer--;
        this.trunkWave += 0.15;
        this.haloGlow = (Math.sin(Date.now() * 0.005) + 1) * 0.5;

        this.blinkTimer--;
        if (this.blinkTimer <= 0) {
            this.isBlinking = true;
            if (this.blinkTimer <= -8) {
                this.isBlinking = false;
                this.blinkTimer = 120 + Math.random() * 150;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.translate(centerX, centerY);
        if (this.gravityInverted) {
            ctx.scale(1, -1);
        }

        ctx.scale(this.facing * this.squishX, this.squishY);

        // 1. Divine Golden Halo Aura
        ctx.beginPath();
        const auraRadius = 24 + this.haloGlow * 3;
        const grad = ctx.createRadialGradient(0, -4, 6, 0, -4, auraRadius);
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.40)');
        grad.addColorStop(0.7, 'rgba(255, 180, 0, 0.15)');
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.arc(0, -4, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Expressive Swaying Mouse Tail
        const tailSway = Math.sin(this.walkCycle * 1.2) * 5;
        const tailJump = !this.isGrounded ? -6 : 0;
        ctx.strokeStyle = '#f472b6'; // Cute pink tail
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-10, 8);
        if (this.panicTimer > 0) {
            // Panic: tail sticks straight up with an alert kink!
            ctx.bezierCurveTo(-14, 2, -16, -14, -12, -22);
        } else {
            // Calm sway behind Mooshak
            ctx.bezierCurveTo(
                -17, 12 + tailSway * 0.4,
                -22, 4 + tailSway + tailJump,
                -25, -5 + tailSway * 1.2 + tailJump
            );
        }
        ctx.stroke();

        // 3. Paws / Feet (animated pitter-patter walk)
        const walkBob = Math.sin(this.walkCycle) * 3;
        ctx.fillStyle = '#f472b6';
        // Back paw
        ctx.beginPath();
        ctx.ellipse(-7, 16 - (this.vx !== 0 ? walkBob : 0), 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Front paw
        ctx.beginPath();
        ctx.ellipse(7, 16 + (this.vx !== 0 ? walkBob : 0), 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Chubby Mouse Body
        ctx.fillStyle = '#94a3b8'; // Slate grey mouse fur
        ctx.beginPath();
        ctx.ellipse(-1, 6, 12, 11, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Soft pink belly patch
        ctx.fillStyle = '#fce7f3';
        ctx.beginPath();
        ctx.ellipse(2, 7, 7, 8, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 5. Divine Necklace with Tiny Golden Bell
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, -1, 9, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 6. Mouse Head
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(3, -6, 11, 10, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 7. Cute Round Mouse Ears
        const earTwitch = Math.sin(Date.now() * 0.008) * 1.2;
        // Back Ear
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(-6, -16 + earTwitch, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(-6, -16 + earTwitch, 5.2, 0, Math.PI * 2);
        ctx.fill();

        // Front Ear
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(4, -17 - earTwitch, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(4, -17 - earTwitch, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // 8. Sacred Tilak
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(3, -14);
        ctx.lineTo(5, -14);
        ctx.lineTo(4, -10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(4, -12, 1, 0, Math.PI * 2);
        ctx.fill();

        // 9. Big Sparkling Eyes & Expressions
        if (this.panicTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6, -6, 4.5, 0, Math.PI * 2);
            ctx.arc(0, -6, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(6, -6, 1.8, 0, Math.PI * 2);
            ctx.arc(0, -6, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Sweat drop
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(10, -14, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.isBlinking) {
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(5, -6, 3, Math.PI * 0.1, Math.PI * 0.9);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(5, -6, 3.2, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6, -7.5, 1.3, 0, Math.PI * 2);
            ctx.arc(4.2, -4.8, 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        // 10. Cute Pink Snout & Nose
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(12, -4, 2.4, 1.9, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Cheerful pink cheek blush
        ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
        ctx.beginPath();
        ctx.arc(5, -2, 3, 0, Math.PI * 2);
        ctx.fill();

        // 11. Delicate Twitching Whiskers
        const whiskerTwitch = Math.sin(Date.now() * 0.015) * 0.8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(11, -5);
        ctx.lineTo(20, -8 + whiskerTwitch);
        ctx.moveTo(11, -4);
        ctx.lineTo(22, -4);
        ctx.moveTo(11, -3);
        ctx.lineTo(19, 0 - whiskerTwitch);
        ctx.stroke();

        // 12. Little Paws Holding a Tiny Sacred Modak
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(7, 3, 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(9, -1);
        ctx.quadraticCurveTo(12, 0, 12, 4);
        ctx.lineTo(7, 4);
        ctx.quadraticCurveTo(6, 0, 9, -1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(9, -1, 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

window.GaneshaPlayer = GaneshaPlayer;