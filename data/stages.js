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
    bgm: ["audio/badapple.mp3"],

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