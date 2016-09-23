//=============================================================================
// stages.js
//
// Fases do jogo
//=============================================================================
"use strict";
//=============================================================================
// Primeira fase
//  BGM: Touhou - Bad Apple (audio/badapple.mp3)
//=============================================================================
Game.createStage({
    // Cores legais
    backgroundColor:        0x000000,
    playerColor:            0x00FF00,
    enemyColor:             0xFF0000,
    playerProjectileColor:  0x00FFFF,
    enemyProjectileColor:   0xFFFF00,

    // Música
    bgm: ["audio/badapple.mp3"],
    
    // Criação dos inimigos
    initialize: function(noText) {
        if (!noText)
            TextManager.createStageText(
                Game.currentStageID, 'Yet Another Bullet Hell'
            );
        else
            __checkType(noText, 'boolean', 'text');

        var m = Game.createEnemy(Graphics.width / 2, 128, 'static', 40, 'circle1');

        this._i1 = setInterval(function() {
            if (m.health <= 0) return;
            var e = Game.createEnemy(
                Math.random() * Graphics.width, 0,
                new Movement([new Velocity(3, Math.random() * Math.PI / 4 + Math.PI / 4)]), 
                1, 
                'shootPlayer');
        }, 1000);
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
    }
});
Game.createStage({
    // Cores legais
    backgroundColor:        0x000000,
    playerColor:            0x00FF00,
    enemyColor:             0xFF0000,
    playerProjectileColor:  0x00FFFF,
    enemyProjectileColor:   0xFFFF00,

    // Música
    bgm: ["audio/badapple.mp3"],

    // Criação dos inimigos
    initialize: function(noText) {
        if (!noText)
            TextManager.createStageText(Game.currentStageID, 'Shooting Star');
        else
            __checkType(noText, 'boolean', 'text');

        this._enemies = Game.createEnemies(
            [Graphics.width / 6, 32,     'static', 15, 'arc1'],
            [Graphics.width * 5 / 6, 32, 'static', 15, 'arc2']
        );

        this._i1 = setInterval(function() {
            if (!this._enemies.some(function (e) { return e.health > 0; }))
                return;
            Game.createEnemy(
                Graphics.width - 1, Math.random() * 64 + 32, 
                'straightLeft', 
                1, 
                'spiral2');
        }.bind(this), 3000);

        this._i2 = setInterval(function() {
            if (!this._enemies.some(function (e) { return e.health > 0; }))
                return;
            Game.createEnemy(1, Math.random() * 64 + 32, 'straightRight', 1, 'spiral2');
        }.bind(this), 6000);
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
        clearInterval(this._i2);
    }
});
//-----------------------------------------------------------------------------
// Boss
//-----------------------------------------------------------------------------
Game.createStage({
    // Cores legais
    backgroundColor:        0x000000,
    playerColor:            0x00FF00,
    enemyColor:             0xFF0000,
    playerProjectileColor:  0x00FFFF,
    enemyProjectileColor:   0xFFFF00,
    
    // Música
    bgm: ["audio/megalovania.mp3"],

    // Criação dos inimigos
    initialize: function(noText) {
        if (!noText)
            TextManager.createStageText('BOSS', 'Starry Night');
        else
            __checkType(noText, 'boolean', 'text');

        var boss = Game.createEnemy(Graphics.width / 3, 96, 'static',  60, 'boss1');
        boss.hitbox.width = boss.hitbox.height = 16;
        boss.color = 0xFFFFFF;
    },

    // Finalização do estágio
    terminate: function() {}
});
//=============================================================================
// Segunda fase
//  BGM:    Tetris (audio/tetris.mp3)
//=============================================================================
Game.createStage({
    // Cores legais
    backgroundColor:        0xFFFFFF,
    playerColor:            0x00AAFF,
    enemyColor:             0x000000,
    playerProjectileColor:  0x00FF00,
    enemyProjectileColor:   0xFF0000,

    // Música
    bgm: ["audio/tetris.mp3"],

    // Criação dos inimigos
    initialize: function(noText) {
        if (!noText)
            TextManager.createStageText(Game.currentStageID, 'Holy Trinity');
        else
            __checkType(noText, 'boolean', 'text');

        this._enemies = Game.createEnemies(
            [Graphics.width / 3, 96,     'static', 5, 'circle1'],
            [Graphics.width * 2 / 3, 96, 'static', 5, 'circle1'],
            [Graphics.width / 2, 192,    'static', 5, 'circle1']
        );

        this._i1 = setInterval(function() {
            if (!this._enemies.some(function (e) { return e.health > 0; }))
                return;
            Game.createEnemy(0, 32, 'circleRight', 10, 'arc1');
        }.bind(this), 2000);

        this._i2 = setInterval(function() {
            if (!this._enemies.some(function (e) { return e.health > 0; }))
                return;
            Game.createEnemy(Graphics.width - 1, 32, 'circleLeft', 10, 'arc2');
        }.bind(this), 3000);
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
        clearInterval(this._i2);
    }
});

Game.createStage({
    // Cores legais
    backgroundColor:        0xFFFFFF,
    playerColor:            0x00AAFF,
    enemyColor:             0x000000,
    playerProjectileColor:  0x00FF00,
    enemyProjectileColor:   0xFF0000,
    
    // Música
    bgm: ["audio/tetris.mp3"],
    
    // Criação dos inimigos
    initialize: function(noText) {
        if (!noText)
            TextManager.createStageText(Game.currentStageID, 'Spirals');
        else
            __checkType(noText, 'boolean', 'text');

        this._touts = [];
        this._e = Game.createEnemy(Graphics.width / 5, 32, 'rightLeft', 10, 'spiral1');
        this._i1 = setInterval(function() {
            if (this._e.health <= 0)
                return;
            Game.createEnemy(64, Graphics.height - 64, 'spiralUp', 5, 'circle1');
            this._touts.push(setTimeout(function() {
                Game.createEnemy(Graphics.width - 64, 64, 'spiralDown', 5, 'circle1');
            }, 1000));
        }.bind(this), 3000);
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
        for (var i = 0; i < this._touts.length; i++)
            clearTimeout(this._touts[i]);
    }
});
//-----------------------------------------------------------------------------
// Boss
//-----------------------------------------------------------------------------
Game.createStage({
    // Cores legais
    backgroundColor:        0xFFFFFF,
    playerColor:            0x00AAFF,
    enemyColor:             0x000000,
    playerProjectileColor:  0x00FF00,
    enemyProjectileColor:   0xFF0000,
    
    // Música
    bgm: ["audio/unowenwasher.mp3", 0.8],

    // Criação dos inimigos
    initialize: function(noText) {
        if (!noText)
            TextManager.createStageText('BOSS', 'There Will Be Blood');
        else
            __checkType(noText, 'boolean', 'text');

        this._boss = Game.createEnemy(Graphics.width / 6, Graphics.height / 3, 'rightLeft', 36, 'boss2');
        this._boss.hitbox.width = this._boss.hitbox.height = 32;

        this._colors = [
            0xFF0000, 0x00FF00, 0x0000FF, 
            0xFFFF00, 0x00FFFF, 0xFF7700, 
            0x7700FF
        ];

        this._tetrisInterval = null;
    },

    startTetris: function() {
        if (this._tetrisInterval)
            this.endTetris();
        var tetris = function() {
            if (this._boss.health <= 0) return;

            var r = Math.random(),
                c = this._colors[Math.floor(r * this._colors.length)],
                x = Math.floor(Math.random() * Graphics.width) / 12;

            var t = function(x, y) {
                var e = new Enemy(x*12, y*12, 'straightDown', 12, 'noexplode');
                e.color = c;
                e.hitbox.width = e.hitbox.height = 12;
                Game.add(e);
            }

            switch (Math.floor(r * 7)) {
                case 0:
                    t(x-2, 0); t(x-1, 0); t(x, 0); t(x+1, 0);
                    break;
                case 1:
                    t(x-1, 0);
                    t(x-1, 1); t(x, 1); t(x+1, 1);
                    break;
                case 2:
                                        t(x+1, 0);
                    t(x-1, 1); t(x, 1); t(x+1, 1);
                    break;
                case 3:
                    t(x-1, 0); t(x, 0); 
                    t(x-1, 1); t(x, 1);
                    break;
                case 4:
                               t(x, 0); t(x+1, 0); 
                    t(x-1, 1); t(x, 1);
                    break;
                case 5:
                               t(x, 0);
                    t(x-1, 1); t(x, 1); t(x+1, 1);
                    break;
                case 6:
                    t(x-1, 0); t(x, 0); 
                               t(x, 1); t(x+1, 1);
            }
        }.bind(this);
        this._tetrisInterval = setInterval(tetris, 75);
    },

    endTetris: function() {
        clearInterval(this._tetrisInterval);
        this._tetrisInterval = null;
    },

    // Finalização do estágio
    terminate: function() {
        this.endTetris();
    }
});
//=============================================================================
// Créditos
//=============================================================================
Game.createStage({
    // Cores legais
    backgroundColor:        0x000000,
    playerColor:            0xffffff,
    enemyColor:             0x000000,
    playerProjectileColor:  0xff0000,
    enemyProjectileColor:   0x000000,

    // Música
    bgm: ["audio/badapple.mp3"],

    // Criação dos inimigos
    initialize: function(noText) {
        var e = Game.createEnemy(0, 0, 'static', 1, 'noexplode');
        e.hitbox.width = e.hitbox.height = 0;

        var id = TextManager.createText('Yet Another Bullet Hell', '50%', '50%', {
            transform: 'translateX(-50%) translateY(-50%)',
            fontSize: '32pt',
            opacity: 1.0
        }),
        t = TextManager.getText(id);

        setTimeout(function() {
            var fadeout = setInterval(function() {
                t.style.opacity -= 0.06;
                if (t.style.opacity <= 0.0) {
                    TextManager.removeText(id);
                    clearInterval(fadeout);

                    id = TextManager.createText('<strong>Programação</strong><br>Guilherme Guidotti Brandt', 
                        '50%', '50%', {
                            transform: 'translateX(-50%) translateY(-50%)',
                            fontSize: '24pt',
                            textAlign: 'center',
                            opacity: 0.0
                        }
                    ), t = TextManager.getText(id);

                    var fadein = setInterval(function() {
                        t.style.opacity -= -0.06;
                        if (t.style.opacity >= 1.0) {
                            setTimeout(function() {
                                var fadeout = setInterval(function() {
                                    t.style.opacity -= 0.06;
                                    if (t.style.opacity <= 0.0) {
                                        TextManager.removeText(id);
                                        clearInterval(fadeout);

                                        id = TextManager.createText('<strong>Música</strong><br>Bad Apple & U.N. Owen Was Her ~ 東方 (Touhou), ZUN<br>Tetris Type-A ~ Tetris<br>Megalovania ~ Undertale, Toby "Radiation" Fox',
                                            '50%', '50%', {
                                                transform: 'translateX(-50%) translateY(-50%)',
                                                fontSize: '24pt',
                                                textAlign: 'center',
                                                opacity: 0.0
                                            }
                                        ), t = TextManager.getText(id);

                                        fadein = setInterval(function() {
                                            t.style.opacity -= -0.06;
                                            if (t.style.opacity >= 1.0) {
                                                setTimeout(function() {
                                                    fadeout = setInterval(function() {
                                                        t.style.opacity -= 0.06;
                                                        if (t.style.opacity <= 0.0) {
                                                            TextManager.removeText(id);
                                                            clearInterval(fadeout);
                                                            e.dispose();
                                                        }
                                                    }, 16);
                                                }, 6000);
                                                clearInterval(fadein);
                                            }
                                        }, 16);
                                    }
                                }, 16);
                            }, 4000);
                            clearInterval(fadein);
                        }
                    }, 16);
                }
            }, 16);
        }, 2000);
    },

    // Finalização do estágio
    terminate: function() {}
});