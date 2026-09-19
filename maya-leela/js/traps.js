// traps.js - Level Devil Style Troll Traps & Interactive Objects
class TrapFactory {
    static create(config) {
        switch (config.type) {
            case 'door':
                return new TrollDoor(config.x, config.y, config.behavior);
            case 'falling_floor':
                return new FallingFloor(config.x, config.y, config.w, config.h, config.triggerDist, config.delay);
            case 'hidden_spike':
                return new HiddenSpike(config.x, config.y, config.w, config.h, config.triggerX, config.dir);
            case 'falling_bell':
                return new FallingBell(config.x, config.y, config.w, config.h, config.triggerDist);
            case 'running_key':
                return new RunningKey(config.x, config.y);
            case 'modak':
                return new SacredModak(config.x, config.y, config.trollType);
            case 'moving_platform':
                return new MovingPlatform(config.x, config.y, config.w, config.h, config.rangeX, config.rangeY, config.speed, config.behavior);
            case 'bouncy_lotus':
                return new BouncyLotus(config.x, config.y, config.w, config.h, config.bounceForce);
            case 'fake_platform':
                return new FakePlatform(config.x, config.y, config.w, config.h);
            case 'rolling_laddu':
                return new RollingLaddu(config.x, config.y, config.r, config.speed, config.minX, config.maxX, config.triggerDist);
            case 'crushing_pillar':
                return new CrushingPillar(config.x, config.y, config.w, config.h, config.triggerDist);
            case 'portal':
                return new PortalPair(config.x, config.y, config.targetX, config.targetY);
            default:
                console.warn('Unknown trap type:', config.type);
                return null;
        }
    }
}

class TrapManager {
    constructor() {
        this.traps = [];
    }

    clear() {
        this.traps = [];
    }

    add(trap) {
        if (trap) this.traps.push(trap);
    }

    update(player, game) {
        for (const trap of this.traps) {
            trap.update(player, game);
        }
    }

    draw(ctx) {
        for (const trap of this.traps) {
            trap.draw(ctx);
        }
    }
}

// 1. Falling Floor
class FallingFloor {
    constructor(x, y, w = 40, h = 40, triggerDist = 45, delay = 20) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.triggerDist = triggerDist;
        this.delay = delay;
        this.triggered = false;
        this.falling = false;
        this.vy = 0;
        this.shake = 0;
        this.isSolid = true;
    }

    update(player, game) {
        if (!this.triggered) {
            const pCenterX = player.x + player.width / 2;
            const pBottomY = player.y + player.height;
            const dist = Math.abs(pCenterX - (this.x + this.w / 2));

            if (dist < this.triggerDist && Math.abs(pBottomY - this.y) < 15) {
                this.triggered = true;
                player.triggerPanic(30);
                if (window.soundManager) window.soundManager.playTrapTrigger();
            }
        } else if (!this.falling) {
            this.delay--;
            this.shake = (Math.random() - 0.5) * 4;
            if (this.delay <= 0) {
                this.falling = true;
                this.isSolid = false;
            }
        } else {
            this.vy += 0.8;
            this.y += this.vy;
            this.shake = 0;
        }
    }

    draw(ctx) {
        if (this.y > 700) return;
        ctx.save();
        ctx.translate(this.x + this.shake, this.y);

        ctx.fillStyle = this.triggered ? '#b45309' : '#78350f';
        ctx.fillRect(0, 0, this.w, this.h);

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, this.w - 2, this.h - 2);

        if (this.triggered) {
            ctx.strokeStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(4, 4);
            ctx.lineTo(this.w / 2, this.h / 2);
            ctx.lineTo(this.w - 4, this.h - 4);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// 2. Hidden Trishul Spikes
class HiddenSpike {
    constructor(x, y, w = 36, h = 36, triggerX = 100, dir = 'up') {
        this.x = x;
        this.y = y;
        this.targetY = y;
        this.w = w;
        this.h = h;
        this.triggerX = triggerX;
        this.dir = dir;
        this.active = false;
        this.popProgress = 0;

        if (dir === 'up') {
            this.hiddenY = y + h - 4;
            this.curY = this.hiddenY;
        } else if (dir === 'down') {
            this.hiddenY = y - h + 4;
            this.curY = this.hiddenY;
        }
    }

    update(player, game) {
        if (!this.active) {
            const dist = Math.abs((player.x + player.width / 2) - (this.x + this.w / 2));
            if (dist < this.triggerX) {
                this.active = true;
                player.triggerPanic(30);
                if (window.soundManager) window.soundManager.playTrapTrigger();
            }
        } else if (this.popProgress < 1) {
            this.popProgress = Math.min(1, this.popProgress + 0.14);
            this.curY = this.hiddenY + (this.targetY - this.hiddenY) * this.popProgress;
        }

        if (this.popProgress > 0.3 && !player.isDead) {
            const spikeHitbox = {
                x: this.x + 8,
                y: this.curY + 6,
                w: this.w - 16,
                h: this.h - 10
            };
            if (game.checkHazard ? game.checkHazard(player, spikeHitbox) : game.checkCollision(player, spikeHitbox)) {
                game.killPlayer("A surprise Trishul struck! Watch your step!");
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.curY);

        const count = Math.max(1, Math.floor(this.w / 18));
        const segW = this.w / count;

        for (let i = 0; i < count; i++) {
            const sx = i * segW;
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            if (this.dir === 'up') {
                ctx.moveTo(sx, this.h);
                ctx.lineTo(sx + segW / 2, 2);
                ctx.lineTo(sx + segW, this.h);
            } else {
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx + segW / 2, this.h - 2);
                ctx.lineTo(sx + segW, 0);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(sx + segW / 2, this.h / 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// 3. Troll Door
class TrollDoor {
    constructor(x, y, behavior = 'normal') {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.w = 44;
        this.h = 60;
        this.behavior = behavior;
        this.triggered = false;
        this.vx = 0;
        this.vy = 0;
        this.locked = behavior === 'locked';
        this.jumped = false;
        this.glow = 0;
        this.fleeReturning = false;
        this.fleeTimer = 0;
        this.exhausted = false;
    }

    update(player, game) {
        this.glow = (Math.sin(Date.now() * 0.006) + 1) * 0.5;
        const pCenterX = player.x + player.width / 2;
        const dCenterX = this.x + this.w / 2;
        const dist = Math.abs(pCenterX - dCenterX);

        if (this.behavior === 'jump_over' && !this.jumped) {
            if (dist < 90) {
                this.jumped = true;
                this.triggered = true;
                this.vy = -7.5;
                this.vx = -3.2;
                player.triggerPanic(45);
                if (window.soundManager) {
                    window.soundManager.playDoorFlee();
                    window.soundManager.playTrapTrigger();
                }
                game.showTrollMessage("Wait, the Door is running away?! Catch it!");
            }
        } else if (this.behavior === 'flee') {
            if (this.fleeReturning) {
                this.fleeTimer--;
                this.vx = -2.2;
                if (this.fleeTimer <= 0) {
                    this.fleeReturning = false;
                    this.vx = 0;
                    this.exhausted = true;
                    game.showTrollMessage("Phew! The Sanctum is caught! Step inside!");
                }
            } else if (!this.exhausted) {
                if (dist < 110) {
                    this.triggered = true;
                    this.vx = (pCenterX < dCenterX) ? 2.2 : -2.2;
                } else {
                    this.vx *= 0.8;
                }

                // If door reaches the right boundary (end of room), it bounces back toward the player!
                if (this.x >= 665 && this.vx > 0) {
                    this.x = 665;
                    this.fleeReturning = true;
                    this.fleeTimer = 75; // Runs back toward the player for ~1.25s
                    this.vy = -4.5; // Playful hop back
                    this.vx = -2.2;
                    player.triggerPanic(30);
                    if (window.soundManager) {
                        window.soundManager.playDoorFlee();
                        window.soundManager.playTrapTrigger();
                    }
                    game.showTrollMessage("Cornered! The Sanctum bounces back!");
                } else if (this.x <= 70 && this.vx < 0) {
                    this.x = 70;
                    this.fleeReturning = true;
                    this.fleeTimer = 75;
                    this.vy = -4.5;
                    this.vx = 2.2;
                    player.triggerPanic(30);
                    if (window.soundManager) {
                        window.soundManager.playDoorFlee();
                        window.soundManager.playTrapTrigger();
                    }
                    game.showTrollMessage("Cornered! The Sanctum dashes back!");
                }
            } else {
                this.vx *= 0.8;
            }
        } else if (this.behavior === 'drop') {
            if (dist < 75 && !this.triggered) {
                this.triggered = true;
                this.vy = 8;
                player.triggerPanic(40);
                if (window.soundManager) window.soundManager.playDoorFlee();
                game.showTrollMessage("Down it goes! Take the leap of faith!");
            }
        } else if (this.behavior === 'fake_teleport') {
            if (dist < 65 && !this.triggered) {
                this.triggered = true;
                game.spawnParticles(this.x + this.w / 2, this.y + this.h / 2, '#fbbf24', 20);
                this.x = 80;
                this.y = 160;
                player.triggerPanic(45);
                if (window.soundManager) window.soundManager.playTrapTrigger();
                game.showTrollMessage("Maya teleportation! The temple plays tricks on you!");
            }
        } else if (this.behavior === 'reverse_jump' && !this.jumped) {
            if (dist < 85) {
                this.jumped = true;
                this.triggered = true;
                this.vy = -10;
                this.vx = (pCenterX < dCenterX) ? 4.5 : -4.5;
                player.triggerPanic(45);
                if (window.soundManager) {
                    window.soundManager.playDoorFlee();
                    window.soundManager.playTrapTrigger();
                }
                game.showTrollMessage("The Door leaps away into the distance!");
            }
        } else if (this.behavior === 'fly_away' && !this.triggered) {
            if (dist < 80) {
                this.triggered = true;
                this.vy = -4.5;
                player.triggerPanic(40);
                if (window.soundManager) window.soundManager.playDoorFlee();
                game.showTrollMessage("To the heavens! The Door is floating away! Catch it!");
            }
        } else if (this.behavior === 'shrink') {
            if (dist < 100) {
                this.w = Math.max(16, this.w * 0.96);
                this.h = Math.max(22, this.h * 0.96);
            }
        } else if (this.behavior === 'decoy' && !this.triggered) {
            if (dist < 60) {
                this.triggered = true;
                game.spawnParticles(this.x + this.w / 2, this.y + this.h / 2, '#ef4444', 25);
                this.x = -999;
                const realDoor = new TrollDoor(80, 370, 'normal');
                game.trapManager.add(realDoor);
                player.triggerPanic(50);
                if (window.soundManager) window.soundManager.playTrapTrigger();
                game.showTrollMessage("FOOLED! That was a mirage! The real Sanctum is at the start!");
            }
        }

        if (this.vx !== 0 || this.vy !== 0) {
            this.x += this.vx;
            this.y += this.vy;

            // Clamping x within playable arena so door NEVER escapes off-screen
            if (this.x < 50) this.x = 50;
            if (this.x > 675) this.x = 675;

            if (this.behavior === 'jump_over' || this.behavior === 'reverse_jump' || (this.behavior === 'flee' && this.fleeReturning)) {
                this.vy += 0.45;
                if (this.y >= this.baseY) {
                    this.y = this.baseY;
                    this.vy = 0;
                    if (this.behavior !== 'flee') {
                        this.vx *= 0.85;
                    }
                }
            }
        }

        if (!player.isDead && game.checkCollision(player, this)) {
            if (this.locked) {
                game.showTrollMessage("The Sanctum is locked! Find the golden Mushak Key!");
            } else {
                game.winLevel();
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = `rgba(251, 191, 36, ${0.15 + this.glow * 0.15})`;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(-6, -6, this.w + 12, this.h + 12, 10);
        } else {
            ctx.rect(-6, -6, this.w + 12, this.h + 12);
        }
        ctx.fill();

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(0, 0, this.w, this.h, [16, 16, 2, 2]);
        } else {
            ctx.rect(0, 0, this.w, this.h);
        }
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = this.locked ? '#450a0a' : '#1e1b4b';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(5, 8, this.w - 10, this.h - 8, [12, 12, 0, 0]);
        } else {
            ctx.rect(5, 8, this.w - 10, this.h - 8);
        }
        ctx.fill();

        if (this.locked) {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(this.w / 2, this.h / 2, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1c1917';
            ctx.beginPath();
            ctx.arc(this.w / 2, this.h / 2 + 1, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Golden Om symbol on arch
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 14px "Segoe UI", "Mangal", "Arial Unicode MS", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u0950', this.w / 2, 16);
        } else {
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(this.w / 2, this.h / 2 + 6, 6 + this.glow * 2, 0, Math.PI * 2);
            ctx.fill();

            // Divine glowing OM Symbol on the door arch
            ctx.save();
            ctx.fillStyle = '#fde047';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 6 + this.glow * 4;
            ctx.font = 'bold 16px "Segoe UI", "Mangal", "Arial Unicode MS", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u0950', this.w / 2, 16);
            ctx.restore();
        }

        ctx.restore();
    }
}

// 4. Falling Bell
class FallingBell {
    constructor(x, y, w = 44, h = 48, triggerDist = 45) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.triggerDist = triggerDist;
        this.triggered = false;
        this.vy = 0;
        this.landed = false;
    }

    update(player, game) {
        if (!this.triggered) {
            const pCenterX = player.x + player.width / 2;
            const bCenterX = this.x + this.w / 2;
            if (Math.abs(pCenterX - bCenterX) < this.triggerDist && player.y > this.y) {
                this.triggered = true;
                player.triggerPanic(35);
                if (window.soundManager) {
                    window.soundManager.playBell();
                    window.soundManager.playTrapTrigger();
                }
            }
        } else if (!this.landed) {
            this.vy += 0.9;
            this.y += this.vy;

            if (this.y >= 380) {
                this.y = 380;
                this.landed = true;
                game.shakeScreen(6);
                if (window.soundManager) window.soundManager.playBell();
            }

            if (!player.isDead) {
                const bellHitbox = { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 8 };
                if (game.checkHazard ? game.checkHazard(player, bellHitbox) : game.checkCollision(player, bellHitbox)) {
                    game.killPlayer("BONG! A heavy sacred temple bell crushed Bal Ganesha!");
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.w / 2, -40);
        ctx.lineTo(this.w / 2, 0);
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(this.w / 2 - 8, 4);
        ctx.quadraticCurveTo(this.w / 2 - 18, 20, 2, this.h - 6);
        ctx.lineTo(this.w - 2, this.h - 6);
        ctx.quadraticCurveTo(this.w / 2 + 18, 20, this.w / 2 + 8, 4);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(this.w / 2, this.h - 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// 5. Sacred Modak
class SacredModak {
    constructor(x, y, trollType = 'none') {
        this.x = x;
        this.y = y;
        this.w = 26;
        this.h = 26;
        this.trollType = trollType;
        this.collected = false;
        this.bob = 0;
    }

    update(player, game) {
        if (this.collected) return;
        this.bob += 0.08;

        if (game.checkCollision(player, this)) {
            this.collected = true;
            game.modaksCollected++;
            try {
                localStorage.setItem('maya_leela_modaks_collected', game.modaksCollected.toString());
            } catch(e) {}
            game.updateHUD();
            if (window.soundManager) window.soundManager.playModak();
            game.spawnParticles(this.x + this.w / 2, this.y + this.h / 2, '#fef08a', 15);

            if (this.trollType === 'invert_gravity') {
                player.gravityInverted = !player.gravityInverted;
                player.triggerPanic(45);
                game.showTrollMessage("Mmm, heavenly Modak! But wait... gravity flipped upside down?!");
                if (window.soundManager) window.soundManager.playBell();
            } else if (this.trollType === 'collapse_floor') {
                game.collapseAllFloors();
                player.triggerPanic(45);
                game.showTrollMessage("A greedy grab! The floor collapses beneath your feet!");
            } else {
                game.showTrollMessage("Delicious Modak collected! +1 Divine Blessing!");
            }
        }
    }

    draw(ctx) {
        if (this.collected) return;
        ctx.save();
        const curY = this.y + Math.sin(this.bob) * 3;
        ctx.translate(this.x, curY);

        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.arc(this.w / 2, this.h / 2, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(this.w / 2, 2);
        ctx.quadraticCurveTo(this.w + 2, this.h / 2 + 4, this.w / 2 + 8, this.h - 2);
        ctx.lineTo(this.w / 2 - 8, this.h - 2);
        ctx.quadraticCurveTo(-2, this.h / 2 + 4, this.w / 2, 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(this.w / 2, 3, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// 6. Running Key
class RunningKey {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 30;
        this.h = 24;
        this.vx = 0;
        this.collected = false;
    }

    update(player, game) {
        if (this.collected) return;

        const pCenterX = player.x + player.width / 2;
        const kCenterX = this.x + this.w / 2;
        const dist = Math.abs(pCenterX - kCenterX);

        if (dist < 110) {
            this.vx = (pCenterX < kCenterX) ? 2.4 : -2.4;
        } else {
            this.vx *= 0.85;
        }

        this.x += this.vx;
        if (this.x < 60) {
            this.x = 60;
            this.vx = 0;
        }
        if (this.x > 720) {
            this.x = 720;
            this.vx = 0;
        }

        if (game.checkCollision(player, this)) {
            this.collected = true;
            if (window.soundManager) window.soundManager.playModak();
            game.spawnParticles(this.x + this.w / 2, this.y + this.h / 2, '#38bdf8', 15);
            game.unlockDoors();
            game.showTrollMessage("Gotcha! The Sacred Temple Sanctum is now unlocked!");
        }
    }

    draw(ctx) {
        if (this.collected) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(8, 12, 6, 0, Math.PI * 2);
        ctx.rect(12, 10, 14, 4);
        ctx.rect(22, 14, 4, 4);
        ctx.fill();

        const legSwing = Math.sin(Date.now() * 0.02) * 5;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 18);
        ctx.lineTo(8 + (this.vx !== 0 ? legSwing : 0), 24);
        ctx.moveTo(18, 18);
        ctx.lineTo(18 - (this.vx !== 0 ? legSwing : 0), 24);
        ctx.stroke();

        ctx.restore();
    }
}

// 7. Moving Platform
class MovingPlatform {
    constructor(x, y, w = 80, h = 25, rangeX = 120, rangeY = 0, speed = 2, behavior = 'patrol') {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rangeX = rangeX;
        this.rangeY = rangeY;
        this.speed = (speed || 2) * 0.72; // Slower, calmer platform ride
        this.behavior = behavior;
        this.dir = 1;
        this.isSolid = true;
        this.isMovingPlatform = true;
        this.dx = 0;
        this.dy = 0;
    }

    update(player, game) {
        const prevX = this.x;
        const prevY = this.y;

        if (this.behavior === 'patrol') {
            if (this.rangeX > 0) {
                this.x += this.speed * this.dir;
                if (Math.abs(this.x - this.startX) >= this.rangeX) {
                    this.dir *= -1;
                }
            }
            if (this.rangeY > 0) {
                this.y += this.speed * this.dir;
                if (Math.abs(this.y - this.startY) >= this.rangeY) {
                    this.dir *= -1;
                }
            }
        } else if (this.behavior === 'flee') {
            const pCenterX = player.x + player.width / 2;
            const dist = Math.abs(pCenterX - (this.x + this.w / 2));
            if (dist < 110) {
                this.x += (pCenterX < this.x + this.w / 2 ? 3.5 : -3.5);
                if (this.x < 40) this.x = 40;
                if (this.x + this.w > 760) this.x = 760 - this.w;
            }
        }

        this.dx = this.x - prevX;
        this.dy = this.y - prevY;

        // Carry player if on top
        if (player.isGrounded && Math.abs((player.y + player.height) - this.y) < 5 &&
            player.x + player.width > this.x && player.x < this.x + this.w) {
            player.x += this.dx;
            player.y += this.dy;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.w, this.h);
        ctx.fillStyle = '#fde047';
        for (let i = 4; i < this.w - 4; i += 16) {
            ctx.fillRect(i, 4, 8, 4);
        }
        ctx.restore();
    }
}

// 8. Bouncy Lotus Pad
class BouncyLotus {
    constructor(x, y, w = 42, h = 22, bounceForce = -14) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.bounceForce = bounceForce;
        this.squish = 1;
    }

    update(player, game) {
        this.squish += (1 - this.squish) * 0.15;
        if (!player.isDead && game.checkCollision(player, this)) {
            if (player.vy > 0 && player.y + player.height <= this.y + 14) {
                player.vy = this.bounceForce;
                player.isGrounded = false;
                this.squish = 0.45;
                if (window.soundManager) window.soundManager.playTrapTrigger();
                game.spawnParticles(this.x + this.w / 2, this.y, '#f472b6', 15);
                game.showTrollMessage("BOING! Super Bouncy Sacred Lotus!");
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h);
        ctx.scale(1 / this.squish, this.squish);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.ellipse(0, -this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.ellipse(0, -this.h / 2, this.w / 3, this.h / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 9. Fake Platform (Pass-Through Illusion)
class FakePlatform {
    constructor(x, y, w = 80, h = 25) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.revealed = false;
    }

    update(player, game) {
        if (!this.revealed && game.checkCollision(player, this)) {
            this.revealed = true;
            player.triggerPanic(30);
            if (window.soundManager) window.soundManager.playTrapTrigger();
            game.showTrollMessage("An optical illusion! The platform was fake!");
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.revealed ? 'rgba(120, 53, 15, 0.25)' : '#78350f';
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.strokeStyle = this.revealed ? 'rgba(245, 158, 11, 0.3)' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.w, this.h);
        ctx.restore();
    }
}

// 10. Rolling Motichoor Laddu Hazard
class RollingLaddu {
    constructor(x, y, r = 24, speed = 3.5, minX = 40, maxX = 760, triggerDist = 200) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.w = r * 2;
        this.h = r * 2;
        this.speed = (speed || 3) * 0.70; // Calibrated slower for calm dodging
        this.minX = minX;
        this.maxX = maxX;
        this.triggerDist = triggerDist;
        this.active = false;
        this.rot = 0;
    }

    update(player, game) {
        if (!this.active) {
            const dist = Math.abs((player.x + player.width / 2) - this.x);
            if (dist < this.triggerDist) {
                this.active = true;
                player.triggerPanic(40);
                if (window.soundManager) window.soundManager.playTrapTrigger();
                game.showTrollMessage("GIANT MOTICHOOR LADDU! RUN, BAL GANESHA!");
            }
        } else {
            this.x += this.speed;
            this.rot += this.speed * 0.05;
            if (this.x < this.minX || this.x > this.maxX) {
                this.speed *= -1;
            }

            if (!player.isDead) {
                const safeR = this.r * 0.8;
                const ladduBox = { x: this.x - safeR, y: this.y - safeR, w: safeR * 2, h: safeR * 2 };
                if (game.checkHazard ? game.checkHazard(player, ladduBox) : game.checkCollision(player, ladduBox)) {
                    game.killPlayer("Squashed by a colossal Motichoor Laddu!");
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fef08a';
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI * 2) / 8;
            ctx.fillRect(Math.cos(a) * (this.r * 0.5), Math.sin(a) * (this.r * 0.5), 4, 4);
        }
        ctx.restore();
    }
}

// 11. Crushing Pillar
class CrushingPillar {
    constructor(x, y = 40, w = 60, h = 260, triggerDist = 70) {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.targetY = 220;
        this.w = w;
        this.h = h;
        this.triggerDist = triggerDist;
        this.state = 'idle';
        this.vy = 0;
    }

    update(player, game) {
        if (this.state === 'idle') {
            const pCenterX = player.x + player.width / 2;
            if (Math.abs(pCenterX - (this.x + this.w / 2)) < this.triggerDist && player.y > this.y) {
                this.state = 'dropping';
                this.vy = 9;
                player.triggerPanic(35);
                if (window.soundManager) window.soundManager.playTrapTrigger();
            }
        } else if (this.state === 'dropping') {
            this.y += this.vy;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.state = 'rising';
                game.shakeScreen(7);
                if (window.soundManager) window.soundManager.playBell();
            }
            if (!player.isDead) {
                const pillarBox = { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 8 };
                if (game.checkHazard ? game.checkHazard(player, pillarBox) : game.checkCollision(player, pillarBox)) {
                    game.killPlayer("Crushed under the golden temple pillar!");
                }
            }
        } else if (this.state === 'rising') {
            this.y -= 2.5;
            if (this.y <= this.startY) {
                this.y = this.startY;
                this.state = 'idle';
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, this.w, this.h);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, 10, this.w - 8, this.h - 20);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', this.w / 2, this.h - 20);
        ctx.restore();
    }
}

// 12. Cosmic Portal Pair
class PortalPair {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.w = 36;
        this.h = 50;
        this.cooldown = 0;
        this.rot = 0;
    }

    update(player, game) {
        this.rot += 0.05;
        if (this.cooldown > 0) this.cooldown--;

        if (this.cooldown === 0 && !player.isDead && game.checkCollision(player, this)) {
            player.x = this.targetX;
            player.y = this.targetY;
            this.cooldown = 45;
            player.triggerPanic(30);
            game.spawnParticles(this.x + this.w / 2, this.y + this.h / 2, '#38bdf8', 20);
            game.spawnParticles(this.targetX, this.targetY, '#a855f7', 20);
            if (window.soundManager) window.soundManager.playDoorFlee();
            game.showTrollMessage("Cosmic Maya Portal warped space and time!");
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.rot);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(this.targetX + this.w / 2, this.targetY + this.h / 2);
        ctx.rotate(-this.rot);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.fill();
        ctx.restore();
    }
}

window.TrapFactory = TrapFactory;
window.TrapManager = TrapManager;
window.FallingFloor = FallingFloor;
window.HiddenSpike = HiddenSpike;
window.TrollDoor = TrollDoor;
window.FallingBell = FallingBell;
window.SacredModak = SacredModak;
window.RunningKey = RunningKey;
window.MovingPlatform = MovingPlatform;
window.BouncyLotus = BouncyLotus;
window.FakePlatform = FakePlatform;
window.RollingLaddu = RollingLaddu;
window.CrushingPillar = CrushingPillar;
window.PortalPair = PortalPair;