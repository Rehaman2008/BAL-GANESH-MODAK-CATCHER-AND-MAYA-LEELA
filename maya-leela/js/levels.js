// levels.js - 50 Hand-Crafted Level Devil Style Troll Levels for Bal Ganesha: Maya Leela
const GAME_LEVELS = [
    // ==========================================
    // CHAPTER 1: THE GATEWAY OF DECEPTION (1-10)
    // ==========================================
    {
        id: 1,
        title: "1. The Welcoming Door",
        subtitle: "A simple stroll to the Sanctum... or is it?",
        playerSpawn: { x: 80, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [{ type: 'door', x: 660, y: 370, behavior: 'jump_over' }],
        collectibles: [{ type: 'modak', x: 380, y: 390 }]
    },
    {
        id: 2,
        title: "2. The Modak Temptation",
        subtitle: "Delicious Modaks can be deceiving!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 200, h: 50 },
            { x: 520, y: 430, w: 240, h: 50 }
        ],
        traps: [
            { type: 'falling_floor', x: 260, y: 430, w: 80, h: 50, triggerDist: 40, delay: 10 },
            { type: 'falling_floor', x: 360, y: 430, w: 80, h: 50, triggerDist: 40, delay: 10 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 400, y: 350, trollType: 'collapse_floor' }]
    },
    {
        id: 3,
        title: "3. Surprise Trishuls",
        subtitle: "Watch your step, Bal Ganesha!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'hidden_spike', x: 260, y: 400, w: 40, h: 30, triggerX: 75, dir: 'up' },
            { type: 'hidden_spike', x: 420, y: 400, w: 40, h: 30, triggerX: 75, dir: 'up' },
            { type: 'hidden_spike', x: 540, y: 400, w: 40, h: 30, triggerX: 75, dir: 'up' },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 340, y: 380 }]
    },
    {
        id: 4,
        title: "4. The Shy Door",
        subtitle: "Why won't the door stay still?! Corner it!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 560, y: 280, w: 180, h: 25 },
            { x: 320, y: 330, w: 120, h: 25 }
        ],
        traps: [
            { type: 'hidden_spike', x: 620, y: 400, w: 40, h: 30, triggerX: 80, dir: 'up' },
            { type: 'door', x: 540, y: 370, behavior: 'flee' }
        ],
        collectibles: [{ type: 'modak', x: 380, y: 280 }]
    },
    {
        id: 5,
        title: "5. Ringing Temple Bells",
        subtitle: "Hear the bells toll... look up!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'falling_bell', x: 220, y: 80, w: 44, h: 48, triggerDist: 45 },
            { type: 'falling_bell', x: 380, y: 80, w: 44, h: 48, triggerDist: 45 },
            { type: 'falling_bell', x: 540, y: 80, w: 44, h: 48, triggerDist: 45 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 300, y: 380 },
            { type: 'modak', x: 460, y: 380 }
        ]
    },
    {
        id: 6,
        title: "6. The Vanishing Steps",
        subtitle: "Trust is a delicate thing in Maya...",
        playerSpawn: { x: 60, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 140, h: 50 },
            { x: 380, y: 340, w: 100, h: 25 },
            { x: 620, y: 430, w: 140, h: 50 }
        ],
        traps: [
            { type: 'falling_floor', x: 220, y: 380, w: 80, h: 25, triggerDist: 45, delay: 6 },
            { type: 'falling_floor', x: 510, y: 380, w: 80, h: 25, triggerDist: 45, delay: 6 },
            { type: 'hidden_spike', x: 260, y: 450, w: 260, h: 30, triggerX: 999, dir: 'up' },
            { type: 'door', x: 670, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 430, y: 290 }]
    },
    {
        id: 7,
        title: "7. The Gravity Leela",
        subtitle: "The world turns upside down!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 320, h: 50 },
            { x: 40, y: 70, w: 720, h: 40 }
        ],
        traps: [
            { type: 'hidden_spike', x: 360, y: 110, w: 80, h: 30, triggerX: 999, dir: 'down' },
            { type: 'door', x: 660, y: 110, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 260, y: 370, trollType: 'invert_gravity' }]
    },
    {
        id: 8,
        title: "8. The Elusive Mushak Key",
        subtitle: "Catch the running key before it escapes!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 260, y: 330, w: 100, h: 25 },
            { x: 480, y: 330, w: 100, h: 25 }
        ],
        traps: [
            { type: 'running_key', x: 300, y: 300 },
            { type: 'hidden_spike', x: 420, y: 400, w: 40, h: 30, triggerX: 60, dir: 'up' },
            { type: 'door', x: 680, y: 370, behavior: 'locked' }
        ],
        collectibles: [{ type: 'modak', x: 530, y: 280 }]
    },
    {
        id: 9,
        title: "9. Inverted Maya",
        subtitle: "Right is Left, Left is Right! A test of pure focus.",
        invertControls: true,
        playerSpawn: { x: 80, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 300, y: 320, w: 80, h: 25 },
            { x: 460, y: 320, w: 80, h: 25 }
        ],
        traps: [
            { type: 'hidden_spike', x: 220, y: 400, w: 40, h: 30, triggerX: 70, dir: 'up' },
            { type: 'hidden_spike', x: 580, y: 400, w: 40, h: 30, triggerX: 70, dir: 'up' },
            { type: 'door', x: 670, y: 370, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 340, y: 270 },
            { type: 'modak', x: 500, y: 270 }
        ]
    },
    {
        id: 10,
        title: "10. The Grand Maya Gauntlet",
        subtitle: "Exciting Chapter 1 finale! Leap across stepping stones and timed steps!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 140, h: 50 },
            { x: 210, y: 380, w: 100, h: 25 },
            { x: 460, y: 330, w: 110, h: 25 },
            { x: 620, y: 410, w: 150, h: 50 }
        ],
        traps: [
            { type: 'falling_floor', x: 330, y: 360, w: 100, h: 25, triggerDist: 35, delay: 26 },
            { type: 'falling_bell', x: 500, y: 80, w: 38, h: 42, triggerDist: 25 },
            { type: 'door', x: 680, y: 350, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 255, y: 330 },
            { type: 'modak', x: 495, y: 280 }
        ]
    },

    // ==========================================
    // CHAPTER 2: THE ALTAR OF UNSEEN HAZARDS (11-20)
    // ==========================================
    {
        id: 11,
        title: "11. The Escaping Platform",
        subtitle: "Solid ground below! Hop along or catch the fleeing bridge!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 40, y: 350, w: 140, h: 25 },
            { x: 580, y: 350, w: 180, h: 25 }
        ],
        traps: [
            { type: 'moving_platform', x: 270, y: 350, w: 140, h: 25, behavior: 'flee' },
            { type: 'door', x: 660, y: 290, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 340, y: 300 }]
    },
    {
        id: 12,
        title: "12. Bouncy Lotus Bait",
        subtitle: "Gentle lotus bounce with wide ceiling clearance!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 330, y: 60, w: 140, h: 30 }
        ],
        traps: [
            { type: 'bouncy_lotus', x: 230, y: 410, w: 55, h: 20, bounceForce: -10.5 },
            { type: 'hidden_spike', x: 360, y: 90, w: 80, h: 25, triggerX: 999, dir: 'down' },
            { type: 'door', x: 660, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 580, y: 380 }]
    },
    {
        id: 13,
        title: "13. The Rolling Laddu of Doom",
        subtitle: "Indiana Ganesha! Outrun the sacred sweet!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'rolling_laddu', x: 680, y: 406, r: 24, speed: -4, minX: 60, maxX: 720, triggerDist: 280 },
            { type: 'door', x: 670, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 380, y: 380 }]
    },
    {
        id: 14,
        title: "14. The Pillar of Doom",
        subtitle: "The temple ceiling is feeling heavy...",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'crushing_pillar', x: 260, y: 40, w: 60, h: 260, triggerDist: 75 },
            { type: 'crushing_pillar', x: 460, y: 40, w: 60, h: 260, triggerDist: 75 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 360, y: 380 }]
    },
    {
        id: 15,
        title: "15. The Phantom Bridge",
        subtitle: "Safe floor below! Step across the phantom bridge or walk underneath!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 40, y: 340, w: 150, h: 25 },
            { x: 550, y: 340, w: 210, h: 25 }
        ],
        traps: [
            { type: 'fake_platform', x: 220, y: 340, w: 130, h: 25 },
            { type: 'falling_floor', x: 380, y: 340, w: 140, h: 25, triggerDist: 40, delay: 35 },
            { type: 'door', x: 660, y: 280, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 440, y: 280 }]
    },
    {
        id: 16,
        title: "16. Door in the Sky",
        subtitle: "Bounce on the holy lotus and ascend the floating clouds to the Sky Sanctum!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 200, h: 50 },
            { x: 310, y: 310, w: 110, h: 25 },
            { x: 470, y: 230, w: 110, h: 25 },
            { x: 610, y: 160, w: 150, h: 25 },
            { x: 350, y: 460, w: 410, h: 20 }
        ],
        traps: [
            { type: 'bouncy_lotus', x: 190, y: 410, w: 60, h: 20, bounceForce: -13 },
            { type: 'door', x: 670, y: 100, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 360, y: 260 },
            { type: 'modak', x: 520, y: 180 }
        ]
    },
    {
        id: 17,
        title: "17. The Reverse Leap",
        subtitle: "The Door decided to jump BACKWARDS!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 400, y: 280, w: 140, h: 25 }
        ],
        traps: [
            { type: 'door', x: 640, y: 370, behavior: 'reverse_jump' }
        ],
        collectibles: [{ type: 'modak', x: 470, y: 230 }]
    },
    {
        id: 18,
        title: "18. Floor of Fiery Thorns",
        subtitle: "Hot hot hot! Hop across the floating stepping stones!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 100, h: 50 },
            { x: 680, y: 430, w: 80, h: 50 }
        ],
        traps: [
            { type: 'hidden_spike', x: 140, y: 450, w: 540, h: 30, triggerX: 999, dir: 'up' },
            { type: 'moving_platform', x: 180, y: 360, w: 90, h: 25, rangeX: 120, speed: 2, behavior: 'patrol' },
            { type: 'moving_platform', x: 440, y: 340, w: 90, h: 25, rangeX: 110, speed: 2.5, behavior: 'patrol' },
            { type: 'door', x: 700, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 360, y: 280 }]
    },
    {
        id: 19,
        title: "19. Double Gravity Flip",
        subtitle: "Solid ground below! Flip to the ceiling, then flip safely back down!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 40, y: 60, w: 720, h: 30 }
        ],
        traps: [
            { type: 'door', x: 660, y: 370, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 180, y: 370, trollType: 'invert_gravity' },
            { type: 'modak', x: 440, y: 110, trollType: 'invert_gravity' }
        ]
    },
    {
        id: 20,
        title: "20. The Cosmic Portal",
        subtitle: "Step through the Maya wormhole to a wide terrace!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 260, y: 240, w: 240, h: 25 },
            { x: 500, y: 330, w: 120, h: 25 }
        ],
        traps: [
            { type: 'portal', x: 220, y: 370, targetX: 370, targetY: 180 },
            { type: 'door', x: 660, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 400, y: 190 }]
    },

    // ==========================================
    // CHAPTER 3: THE UPSIDE-DOWN HEAVENS (21-30)
    // ==========================================
    {
        id: 21,
        title: "21. Don't Jump!",
        subtitle: "Sacred silence! Mind your head on high jumps!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'hidden_spike', x: 200, y: 30, w: 400, h: 25, triggerX: 999, dir: 'down' },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 380, y: 390 }]
    },
    {
        id: 22,
        title: "22. The Shrinking Door",
        subtitle: "The door is getting a bit shy, but still within reach!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [{ type: 'door', x: 670, y: 370, behavior: 'shrink' }],
        collectibles: [{ type: 'modak', x: 380, y: 380 }]
    },
    {
        id: 23,
        title: "23. Two Doors, One Lie",
        subtitle: "One Sanctum is a false decoy! Check the start if it poofs!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [{ type: 'door', x: 660, y: 370, behavior: 'decoy' }],
        collectibles: [{ type: 'modak', x: 380, y: 380 }]
    },
    {
        id: 24,
        title: "24. The Moving Bell Chime",
        subtitle: "The ceiling bells toll gently! Plenty of room to slip by!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 250, y: 320, w: 180, h: 25 }
        ],
        traps: [
            { type: 'falling_bell', x: 320, y: 80, w: 40, h: 44, triggerDist: 35 },
            { type: 'falling_bell', x: 520, y: 80, w: 40, h: 44, triggerDist: 35 },
            { type: 'door', x: 670, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 340, y: 270 }]
    },
    {
        id: 25,
        title: "25. Key on the High Altar",
        subtitle: "Wide upper ledges! Catch the key with ease!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 200, y: 290, w: 150, h: 25 },
            { x: 400, y: 210, w: 180, h: 25 }
        ],
        traps: [
            { type: 'bouncy_lotus', x: 100, y: 410, w: 55, h: 20, bounceForce: -13 },
            { type: 'running_key', x: 460, y: 170 },
            { type: 'door', x: 680, y: 370, behavior: 'locked' }
        ],
        collectibles: [{ type: 'modak', x: 270, y: 240 }]
    },
    {
        id: 26,
        title: "26. Rhythm of the Pillars",
        subtitle: "Generous safe zones between the falling pillars!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'crushing_pillar', x: 220, y: 40, w: 42, h: 240, triggerDist: 42 },
            { type: 'crushing_pillar', x: 420, y: 40, w: 42, h: 240, triggerDist: 42 },
            { type: 'crushing_pillar', x: 600, y: 40, w: 42, h: 240, triggerDist: 42 },
            { type: 'door', x: 690, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 320, y: 380 }]
    },
    {
        id: 27,
        title: "27. Laddu Pinball Alley",
        subtitle: "Slow rolling sweets with a cozy safe platform in the middle!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 340, y: 310, w: 120, h: 25 }
        ],
        traps: [
            { type: 'rolling_laddu', x: 420, y: 406, r: 20, speed: 2.0, minX: 180, maxX: 680, triggerDist: 200 },
            { type: 'rolling_laddu', x: 660, y: 406, r: 20, speed: -2.2, minX: 250, maxX: 700, triggerDist: 200 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 400, y: 260 }]
    },
    {
        id: 28,
        title: "28. The Skyward Flight",
        subtitle: "Ride the moving lift, hop across the clouds, and enter the Sky Sanctum!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 160, h: 50 },
            { x: 400, y: 280, w: 100, h: 25 },
            { x: 550, y: 190, w: 160, h: 25 },
            { x: 230, y: 460, w: 450, h: 20 }
        ],
        traps: [
            { type: 'moving_platform', x: 240, y: 370, w: 120, h: 25, rangeY: 130, speed: 1.6, behavior: 'patrol' },
            { type: 'door', x: 630, y: 130, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 300, y: 280 },
            { type: 'modak', x: 440, y: 230 }
        ]
    },
    {
        id: 29,
        title: "29. Sacred Stairway",
        subtitle: "Big, wide platforms! Hop calmly up to the Sanctum!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 160, h: 50 },
            { x: 230, y: 370, w: 130, h: 25 },
            { x: 390, y: 320, w: 130, h: 25 },
            { x: 560, y: 430, w: 200, h: 50 }
        ],
        traps: [
            { type: 'hidden_spike', x: 360, y: 460, w: 180, h: 25, triggerX: 999, dir: 'up' },
            { type: 'door', x: 670, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 450, y: 270 }]
    },
    {
        id: 30,
        title: "30. The Teleporting Door",
        subtitle: "Step onto the central terrace to meet the teleported door!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 70, y: 230, w: 160, h: 25 },
            { x: 250, y: 330, w: 140, h: 25 }
        ],
        traps: [
            { type: 'door', x: 660, y: 370, behavior: 'fake_teleport' }
        ],
        collectibles: [{ type: 'modak', x: 380, y: 380 }]
    },

    // ==========================================
    // CHAPTER 4: THE TRIALS OF MOOSHAK (31-40)
    // ==========================================
    {
        id: 31,
        title: "31. The Upside-Down Sanctum",
        subtitle: "Full ceiling runway! Stroll along the top in style!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 220, h: 50 },
            { x: 40, y: 60, w: 720, h: 35 }
        ],
        traps: [
            { type: 'door', x: 670, y: 100, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 180, y: 370, trollType: 'invert_gravity' }]
    },
    {
        id: 32,
        title: "32. The Elevator Scam",
        subtitle: "Hop onto the temple elevators and ride them up to the upper shrine!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 150, h: 50 },
            { x: 380, y: 290, w: 100, h: 25 },
            { x: 640, y: 190, w: 130, h: 25 },
            { x: 220, y: 460, w: 460, h: 20 }
        ],
        traps: [
            { type: 'moving_platform', x: 230, y: 390, w: 110, h: 25, rangeY: 130, speed: 1.6, behavior: 'patrol' },
            { type: 'moving_platform', x: 510, y: 260, w: 110, h: 25, rangeY: 80, speed: 1.5, behavior: 'patrol' },
            { type: 'door', x: 680, y: 130, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 285, y: 310 },
            { type: 'modak', x: 430, y: 240 }
        ]
    },
    {
        id: 33,
        title: "33. Stairway of False Hope",
        subtitle: "Generous 22-frame crumble delay! Hop calmly across the steps!",
        playerSpawn: { x: 60, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 120, h: 50 },
            { x: 640, y: 210, w: 120, h: 25 }
        ],
        traps: [
            { type: 'falling_floor', x: 180, y: 380, w: 90, h: 25, triggerDist: 35, delay: 22 },
            { type: 'falling_floor', x: 300, y: 330, w: 90, h: 25, triggerDist: 35, delay: 22 },
            { type: 'falling_floor', x: 420, y: 280, w: 90, h: 25, triggerDist: 35, delay: 22 },
            { type: 'falling_floor', x: 530, y: 240, w: 90, h: 25, triggerDist: 35, delay: 22 },
            { type: 'hidden_spike', x: 180, y: 460, w: 440, h: 25, triggerX: 999, dir: 'up' },
            { type: 'door', x: 680, y: 150, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 460, y: 220 }]
    },
    {
        id: 34,
        title: "34. Double Portal Loop",
        subtitle: "Continuous temple floor! Step through the portal onto the upper terrace!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 240, y: 220, w: 280, h: 25 }
        ],
        traps: [
            { type: 'portal', x: 640, y: 370, targetX: 360, targetY: 160 },
            { type: 'door', x: 420, y: 160, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 330, y: 170 }]
    },
    {
        id: 35,
        title: "35. The Fast Mooshak",
        subtitle: "Gentle mouse key! Broad platforms make cornering it simple!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 180, y: 310, w: 150, h: 25 },
            { x: 460, y: 310, w: 150, h: 25 }
        ],
        traps: [
            { type: 'running_key', x: 380, y: 390 },
            { type: 'hidden_spike', x: 360, y: 400, w: 30, h: 30, triggerX: 45, dir: 'up' },
            { type: 'door', x: 680, y: 370, behavior: 'locked' }
        ],
        collectibles: [{ type: 'modak', x: 260, y: 260 }]
    },
    {
        id: 36,
        title: "36. The Leap into Darkness",
        subtitle: "Big landing zone! Just a simple hop across!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 180, h: 50 },
            { x: 300, y: 370, w: 140, h: 25 },
            { x: 560, y: 430, w: 200, h: 50 }
        ],
        traps: [
            { type: 'fake_platform', x: 210, y: 430, w: 80, h: 25 },
            { type: 'door', x: 670, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 370, y: 320 }]
    },
    {
        id: 37,
        title: "37. The Bouncing Door",
        subtitle: "Wide level ground! Time your entrance with ease!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'bouncy_lotus', x: 580, y: 410, w: 55, h: 20, bounceForce: -13 },
            { type: 'door', x: 580, y: 370, behavior: 'flee' }
        ],
        collectibles: [{ type: 'modak', x: 340, y: 380 }]
    },
    {
        id: 38,
        title: "38. Sinking Temple Floor",
        subtitle: "Huge 90-frame delay & stepping stones! Walk safely across!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 460, w: 720, h: 20 },
            { x: 230, y: 340, w: 100, h: 25 },
            { x: 440, y: 340, w: 100, h: 25 },
            { x: 620, y: 430, w: 140, h: 50 }
        ],
        traps: [
            { type: 'falling_floor', x: 40, y: 430, w: 190, h: 30, triggerDist: 80, delay: 90 },
            { type: 'falling_floor', x: 235, y: 430, w: 190, h: 30, triggerDist: 80, delay: 90 },
            { type: 'falling_floor', x: 430, y: 430, w: 185, h: 30, triggerDist: 80, delay: 90 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 330, y: 300 }]
    },
    {
        id: 39,
        title: "39. Low Ceiling Sprint",
        subtitle: "High ceiling clearance! Walk right under!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 180, y: 190, w: 420, h: 30 }
        ],
        traps: [
            { type: 'falling_bell', x: 270, y: 220, w: 38, h: 42, triggerDist: 30 },
            { type: 'falling_bell', x: 450, y: 220, w: 38, h: 42, triggerDist: 30 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 350, y: 380 }]
    },
    {
        id: 40,
        title: "40. Quadruple Trishul Dance",
        subtitle: "Spaced-out spikes with wide safe stepping zones!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [{ x: 40, y: 430, w: 720, h: 50 }],
        traps: [
            { type: 'hidden_spike', x: 200, y: 400, w: 25, h: 30, triggerX: 50, dir: 'up' },
            { type: 'hidden_spike', x: 330, y: 400, w: 25, h: 30, triggerX: 50, dir: 'up' },
            { type: 'hidden_spike', x: 460, y: 400, w: 25, h: 30, triggerX: 50, dir: 'up' },
            { type: 'hidden_spike', x: 580, y: 400, w: 25, h: 30, triggerX: 50, dir: 'up' },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 395, y: 340 }]
    },

    // ==========================================
    // CHAPTER 5: THE ULTIMATE MAYA GAUNTLET (41-50)
    // ==========================================
    {
        id: 41,
        title: "41. Sky High Leela",
        subtitle: "A majestic sky climb! Ride the cloud lifts all the way to the heavens!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 150, h: 50 },
            { x: 360, y: 290, w: 100, h: 25 },
            { x: 620, y: 150, w: 140, h: 25 },
            { x: 210, y: 460, w: 450, h: 20 }
        ],
        traps: [
            { type: 'moving_platform', x: 220, y: 370, w: 110, h: 25, rangeY: 90, speed: 1.5, behavior: 'patrol' },
            { type: 'moving_platform', x: 480, y: 230, w: 110, h: 25, rangeY: 90, speed: 1.6, behavior: 'patrol' },
            { type: 'door', x: 670, y: 90, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 275, y: 300 },
            { type: 'modak', x: 410, y: 240 }
        ]
    },
    {
        id: 42,
        title: "42. Laddu Pinball & Flying Door",
        subtitle: "Slow-motion laddu and extra stepping stones!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 100, y: 340, w: 90, h: 25 },
            { x: 190, y: 280, w: 370, h: 25 }
        ],
        traps: [
            { type: 'rolling_laddu', x: 600, y: 406, r: 20, speed: -1.2, minX: 100, maxX: 700, triggerDist: 200 },
            { type: 'door', x: 380, y: 220, behavior: 'flee' }
        ],
        collectibles: [{ type: 'modak', x: 380, y: 170 }]
    },
    {
        id: 43,
        title: "43. The Decoy Floor",
        subtitle: "Lower path is wide and completely clear! Stroll through!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 180, y: 250, w: 400, h: 25 }
        ],
        traps: [
            { type: 'crushing_pillar', x: 280, y: 20, w: 45, h: 200, triggerDist: 45 },
            { type: 'crushing_pillar', x: 460, y: 20, w: 45, h: 200, triggerDist: 45 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 380, y: 380 }]
    },
    {
        id: 44,
        title: "44. The Jumping Gatekeeper",
        subtitle: "A solid middle stepping stone makes crossing easy!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 220, h: 50 },
            { x: 340, y: 390, w: 110, h: 25 },
            { x: 520, y: 430, w: 240, h: 50 }
        ],
        traps: [
            { type: 'hidden_spike', x: 260, y: 460, w: 80, h: 25, triggerX: 999, dir: 'up' },
            { type: 'hidden_spike', x: 450, y: 460, w: 70, h: 25, triggerX: 999, dir: 'up' },
            { type: 'door', x: 620, y: 370, behavior: 'jump_over' }
        ],
        collectibles: [{ type: 'modak', x: 395, y: 340 }]
    },
    {
        id: 45,
        title: "45. Needle Thin Pillars",
        subtitle: "Pillars widened to a comfortable 85px! Easy leaps!",
        playerSpawn: { x: 60, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 90, h: 50 },
            { x: 200, y: 410, w: 85, h: 70 },
            { x: 360, y: 390, w: 85, h: 90 },
            { x: 520, y: 370, w: 85, h: 110 },
            { x: 670, y: 350, w: 90, h: 130 }
        ],
        traps: [
            { type: 'hidden_spike', x: 130, y: 460, w: 530, h: 25, triggerX: 999, dir: 'up' },
            { type: 'door', x: 700, y: 290, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 402, y: 330 }]
    },
    {
        id: 46,
        title: "46. Celestial Ceiling Run",
        subtitle: "Broad ceiling runway for upside-down walking!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 220, h: 50 },
            { x: 40, y: 60, w: 720, h: 35 }
        ],
        traps: [
            { type: 'door', x: 670, y: 100, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 180, y: 370, trollType: 'invert_gravity' }]
    },
    {
        id: 47,
        title: "47. The Triple Fakeout",
        subtitle: "Spacious platforms! Watch the bell, then catch the door!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 240, y: 290, w: 160, h: 25 },
            { x: 460, y: 290, w: 160, h: 25 }
        ],
        traps: [
            { type: 'falling_bell', x: 320, y: 70, w: 38, h: 42, triggerDist: 35 },
            { type: 'door', x: 660, y: 370, behavior: 'jump_over' }
        ],
        collectibles: [{ type: 'modak', x: 530, y: 240 }]
    },
    {
        id: 48,
        title: "48. Temple of Rolling Sweets",
        subtitle: "Gentle rolling sweet with a safe elevated middle platform!",
        playerSpawn: { x: 70, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },
            { x: 300, y: 300, w: 140, h: 25 }
        ],
        traps: [
            { type: 'rolling_laddu', x: 650, y: 406, r: 20, speed: -2.3, minX: 120, maxX: 700, triggerDist: 220 },
            { type: 'falling_bell', x: 340, y: 80, w: 38, h: 42, triggerDist: 35 },
            { type: 'door', x: 680, y: 370, behavior: 'normal' }
        ],
        collectibles: [{ type: 'modak', x: 370, y: 250 }]
    },
    {
        id: 49,
        title: "49. Maya's Penultimate Trial",
        subtitle: "Collapsing steps with generous 22-frame delays!",
        playerSpawn: { x: 60, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 120, h: 50 },
            { x: 660, y: 430, w: 100, h: 50 }
        ],
        traps: [
            { type: 'falling_floor', x: 180, y: 380, w: 110, h: 25, triggerDist: 35, delay: 22 },
            { type: 'falling_floor', x: 330, y: 340, w: 110, h: 25, triggerDist: 35, delay: 22 },
            { type: 'falling_floor', x: 480, y: 380, w: 110, h: 25, triggerDist: 35, delay: 22 },
            { type: 'running_key', x: 380, y: 300 },
            { type: 'hidden_spike', x: 160, y: 460, w: 500, h: 25, triggerX: 999, dir: 'up' },
            { type: 'door', x: 700, y: 370, behavior: 'locked' }
        ],
        collectibles: [{ type: 'modak', x: 385, y: 250 }]
    },
    {
        id: 50,
        title: "50. The Sanctum of Moksha (Grand Finale)",
        subtitle: "The Divine Celebration! Ascend the golden stairs to reach Moksha!",
        playerSpawn: { x: 60, y: 380 },
        platforms: [
            { x: 40, y: 430, w: 720, h: 50 },  // Safe, continuous temple floor
            { x: 170, y: 350, w: 130, h: 25 }, // Gentle first step
            { x: 490, y: 210, w: 130, h: 25 }, // Gentle upper step
            { x: 630, y: 140, w: 130, h: 30 }  // Grand Sanctum Throne platform
        ],
        traps: [
            { type: 'bouncy_lotus', x: 90, y: 410, w: 60, h: 20, bounceForce: -9.5 },
            { type: 'moving_platform', x: 320, y: 280, w: 150, h: 25, rangeX: 35, speed: 0.8, behavior: 'patrol' },
            { type: 'door', x: 675, y: 80, behavior: 'normal' }
        ],
        collectibles: [
            { type: 'modak', x: 235, y: 300 },
            { type: 'modak', x: 395, y: 230 },
            { type: 'modak', x: 555, y: 160 }
        ]
    }
];

window.GAME_LEVELS = GAME_LEVELS;