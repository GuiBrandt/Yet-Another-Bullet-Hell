//=============================================================================
// data.js
//
// Declaração das variáveis de dados usadas pelo resto das classes
//=============================================================================
"use strict";
//=============================================================================
// Movimentos
//=============================================================================
//---------------------------------------------------------------------------
// Parado
//---------------------------------------------------------------------------
Game.createMovement('static', []);
//---------------------------------------------------------------------------
// Movimento em linha reta para cima
//---------------------------------------------------------------------------
Game.createMovement('straightUp', [new Velocity(8, -Math.PI / 2)]);
//---------------------------------------------------------------------------
// Movimento em linha reta para a esquerda
//---------------------------------------------------------------------------
Game.createMovement('straightLeft', [new Velocity(4, Math.PI)]);
//---------------------------------------------------------------------------
// Movimento em linha reta para a direita
//---------------------------------------------------------------------------
Game.createMovement('straightRight', [new Velocity(4, 0)]);
//---------------------------------------------------------------------------
// Movimento para a direita e para a esquerda
//---------------------------------------------------------------------------
Game.createMovement('rightLeft', [new Velocity(4, 0)], 
    function() {
        if (!this._timer) this._timer = 0;
        this._timer++;
        this._timer %= 90;
        if (this._timer == 0)
            this._velocities[0].angle += Math.PI;
    }
);
//---------------------------------------------------------------------------
// Movimento para a esquerda e para a direita
//---------------------------------------------------------------------------
Game.createMovement('leftRight', [new Velocity(4, Math.PI)],
    function() {
        if (!this._timer) this._timer = 0;
        this._timer++;
        this._timer %= 90;
        if (this._timer == 0)
            this._velocities[0].angle += Math.PI;
    }
);
//---------------------------------------------------------------------------
// Movimento em círculos no sentido horário
//---------------------------------------------------------------------------
Game.createMovement('circleRight', [new Velocity(4, 0)],
    function() {
        this._velocities[0].angle += 0.1;
    }
);
//---------------------------------------------------------------------------
// Movimento em círculos no sentido anti-horário
//---------------------------------------------------------------------------
Game.createMovement('circleLeft', [new Velocity(4, -Math.PI)],
    function() {
        this._velocities[0].angle -= 0.1;
    }
);
//---------------------------------------------------------------------------
// Movimento circular para cima
//---------------------------------------------------------------------------
Game.createMovement('circleUp', [
        new Velocity(4, 0), 
        new Velocity(4, -Math.PI/2)
    ],
    function() {
        this._velocities[0].angle += 0.1;
    }
);
//---------------------------------------------------------------------------
// Movimento circular para baixo
//---------------------------------------------------------------------------
Game.createMovement('circleDown', [
        new Velocity(4, Math.PI),
        new Velocity(4, Math.PI/2)
    ],
    function() {
        this._velocities[0].angle -= 0.1;
    }
);
//---------------------------------------------------------------------------
// Movimento do jogador
//---------------------------------------------------------------------------
Game.createMovement('player', [new Velocity(0, 0)],
    function() {
        this._velocities[0].module = Input.shiftPressed() ? 2 : 4;
        var t = 0;
        switch (Input.dir8()) {
            case 1:
                t = Math.PI * 3 / 4;
                break;
            case 2:
                t = Math.PI / 2;
                break;
            case 3:
                t = Math.PI / 4;
                break;
            case 4:
                t = Math.PI;
                break;
            case 6:
                t = 0;
                break;
            case 7:
                t = Math.PI * 5 / 4;
                break;
            case 8:
                t = Math.PI * 3 / 2;
                break;
            case 9:
                t = Math.PI * 7 / 4;
                break;
            default:
                this._velocities[0].module = 0;
        } 
        this._velocities[0].angle = t;
    }
);
//=============================================================================
// Padrões de ação de inimigos
//=============================================================================
function explode() {
    this.dispose();
    for (var i = 0; i <= 54; i++)
        Game.createProjectile(
            this._hitbox.x, this._hitbox.y,
            new Movement([new Velocity(4, Math.PI * 2 / 54 * i)]),
            this
        );
    AudioManager.playSe("audio/enemyDeath.m4a", 0.2, 0.5);
}
//---------------------------------------------------------------------------
// Não faz nada
//---------------------------------------------------------------------------
Game.createActionPattern('still', {
    initialize: function() {},
    update: function() {},
    death: explode
});
//---------------------------------------------------------------------------
// Atira em círculos a cada 72 frames (1.2 segundos)
//---------------------------------------------------------------------------
Game.createActionPattern('circle', {
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        var density = 48;

        if (this._fireTimer % 72 == 0) {
            for (var i = 0; i <= density; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(2, Math.PI * 2 / density * i)]),
                    this
                );
            AudioManager.playSe("audio/enemyShot01.m4a", 0.05, 0.5);
        }
        this._fireTimer++;
    },

    death: explode
});
//---------------------------------------------------------------------------
// Atira em círculos a cada 72 frames (1.2 segundos)
//---------------------------------------------------------------------------
Game.createActionPattern('circle1', {
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        var density = 24;

        if (this._fireTimer % 72 == 0) {
            for (var i = 0; i <= density; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(2, Math.PI * 2 / density * i)]),
                    this
                );
            AudioManager.playSe("audio/enemyShot01.m4a", 0.05, 0.5);
        }
        this._fireTimer++;
    },

    death: explode
});
//---------------------------------------------------------------------------
// Atira em uma espiral no sentido anti-horário continuamente
//---------------------------------------------------------------------------
Game.createActionPattern('spiral1', {
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        if (this._fireTimer % 5 == 0)
            Game.createProjectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(2, -Math.PI * 2 / 240 * this._fireTimer)]),
                this
            );
        this._fireTimer++;
    },

    death: explode
});
//---------------------------------------------------------------------------
// Atira em uma espiral no sentido horário continuamente
//---------------------------------------------------------------------------
Game.createActionPattern('spiral2', {
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        if (this._fireTimer % 5 == 0)
            Game.createProjectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(2, Math.PI * 2 / 240 * this._fireTimer)]),
                this
            );
        this._fireTimer++;
    },

    death: explode
});
//---------------------------------------------------------------------------
// Atira em arco para a direita
//---------------------------------------------------------------------------
Game.createActionPattern('arc1', {
    initialize: function() {
        this._timer = 0;
    },

    update: function() {
        var n = 10;

        if (this._timer++ % 120 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1.5 - i / n / 2, Math.PI / 4 + Math.PI / 4 / n * i)]),
                    this
                );
        if (this._timer % 150 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1.5 - i / n / 2, Math.PI / 4 + Math.PI / 4 / n * i)]),
                    this
                );
    },

    death: explode
});
//---------------------------------------------------------------------------
// Atira em arco para a esquerda
//---------------------------------------------------------------------------
Game.createActionPattern('arc2', {
    initialize: function() {
        this._timer = 0;
    },

    update: function() {
        var n = 10;

        if (this._timer++ % 120 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1 + i / n / 2, Math.PI / 2 + Math.PI / 4 / n * i)]),
                    this
                );
        if (this._timer % 150 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1 + i / n / 2, Math.PI / 2 + Math.PI / 4 / n * i)]),
                    this
                );
    },

    death: explode
});
//---------------------------------------------------------------------------
// Padrão de ação dos dois primeiros bosses
//---------------------------------------------------------------------------
Game.createActionPattern('boss1-1', {
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        var dmg = this._maxHealth - this._health,
            pct = dmg / this._maxHealth;
        if (this._fireTimer % Math.floor(5 - pct * 4) == 0)
            Game.createProjectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([
                    new Velocity(2, -Math.PI * 2 / 240 * this._fireTimer)
                ]),
                this
            );
        var dmg = this._maxHealth - this._health;
        var r = 0xff, n = Math.floor(0xFF - pct * 0xFF) & 0xFF;
        this._color = (r << 16) + (n << 8) + n;
        this._fireTimer++;
    },

    death: explode
});
Game.createActionPattern('boss1-2', {
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        var dmg = this._maxHealth - this._health,
            pct = dmg / this._maxHealth;
        if (this._fireTimer % Math.floor(5 - pct * 4) == 0)
            Game.createProjectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(2, -Math.PI * 2 / 240 * this._fireTimer)]),
                this
            );
        var r = 0xFF, n = Math.floor(0xFF - pct * 0xFF) & 0xFF;
        this._color = (r << 16) + (n << 8) + n;
        this._fireTimer++;
    },

    death: explode
});
//=============================================================================
// Primeira fase
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
    initialize: function() {
        Game.createEnemies(
            [Graphics.width / 3,     32, 'rightLeft',   10, 'circle'],
            [Graphics.width * 2 / 3, 32, 'leftRight',   10, 'circle'],
            [Graphics.width / 2,     96, 'static',      40, 'spiral1']
        );
    },

    // Finalização do estágio
    terminate: function() {}
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
    initialize: function() {
        Game.createEnemies(
            [Graphics.width / 6, 32, 'static', 15, 'spiral1'],
            [Graphics.width * 5 / 6, 32, 'static', 15, 'spiral2']
        );

        this._i1 = setInterval(function() {
            Game.createEnemy(
                Graphics.width - 1, 48, 
                'straightLeft', 
                1, 
                'circle');
        }, 3000);

        this._i2 = setInterval(function() {
            Game.createEnemy(1, 48, 'straightRight', 1, 'circle');
        }, 6000);
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
    /*
    backgroundColor:        0x190096,
    playerColor:            0xFFFFFF,
    enemyColor:             0xFF00FF,
    playerProjectileColor:  0x00FFFF,
    enemyProjectileColor:   0xB700FF,
    */
    
    // Música
    bgm: ["audio/badapple.mp3"],

    // Criação dos inimigos
    initialize: function() {
        var enemies = Game.createEnemies(
            [Graphics.width / 3,     96, 'circleLeft',  10, 'boss1-1'],
            [Graphics.width * 2 / 3, 96, 'circleRight', 10, 'boss1-2']
        );

        for (var i = 0; i < enemies.length; i++) {
            enemies[i].hitbox.width = enemies[i].hitbox.height = 16;
            enemies[i].color = 0xFFFFFF;
        }

        enemies = null;

        this._i1 = setInterval(function() {
            Game.createEnemies(
                [100, Graphics.height - 128, 'circleUp',   1, 'circle1'],
                [Graphics.width - 100, 128,  'circleDown', 1, 'circle1']
            );
        }, 3000);
        
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
    }
});
//=============================================================================
// Segunda fase
//=============================================================================
Game.createStage({
    // Cores legais
    backgroundColor:        0xffffff,
    playerColor:            0x00aaff,
    enemyColor:             0x000000,
    playerProjectileColor:  0x00ff00,
    enemyProjectileColor:   0xff0000,

    // Música
    bgm: ["audio/tetris.mp3"],

    // Criação dos inimigos
    initialize: function() {
        Game.createEnemies(
            [Graphics.width / 3, 96,     'static', 5, 'circle'],
            [Graphics.width * 2 / 3, 96, 'static', 5, 'circle'],
            [Graphics.width / 2, 192, 'static', 5, 'circle']
        );

        this._i1 = setInterval(function() {
            Game.createEnemy(0, 32, 'circleRight', 10, 'arc1');
        }, 2000);

        this._i2 = setInterval(function() {
            Game.createEnemy(Graphics.width - 1, 32, 'circleLeft', 10, 'arc2');
        }, 3000);
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
        clearInterval(this._i2);
    }
});