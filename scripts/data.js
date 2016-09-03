//=============================================================================
// data.js
//
// Declaração das variáveis de dados usadas pelo resto das classes
//=============================================================================
"use strict";
//=============================================================================
// Movimentos
//=============================================================================
var $gameMovements = {};
//---------------------------------------------------------------------------
// Parado
//---------------------------------------------------------------------------
$gameMovements['static'] = new Movement([]);
//---------------------------------------------------------------------------
// Movimento em linha reta para cima
//---------------------------------------------------------------------------
$gameMovements['straightUp'] = new Movement([
    new Velocity(8, -Math.PI / 2)
]);
//---------------------------------------------------------------------------
// Movimento em linha reta para a esquerda
//---------------------------------------------------------------------------
$gameMovements['straightLeft'] = new Movement([
    new Velocity(4, Math.PI)
]);
//---------------------------------------------------------------------------
// Movimento em linha reta para a direita
//---------------------------------------------------------------------------
$gameMovements['straightRight'] = new Movement([
    new Velocity(4, 0)
]);
//---------------------------------------------------------------------------
// Movimento para a esquerda e para a direita
//---------------------------------------------------------------------------
$gameMovements['rightLeft'] = new Movement([
    new Velocity(4, 0)
]);
$gameMovements['rightLeft'].onUpdate = function() {
    if (!this._timer) this._timer = 0;
    this._timer++;
    this._timer %= 120;
    if (this._timer == 0)
        this._velocities[0].angle += Math.PI;
};
//---------------------------------------------------------------------------
// Movimento em círculos
//---------------------------------------------------------------------------
$gameMovements['circle'] = new Movement([
    new Velocity(4, 0)
]);
$gameMovements['circle'].onUpdate = function() {
    this._velocities[0].angle += 0.05;
};
//---------------------------------------------------------------------------
// Movimento circular para cima
//---------------------------------------------------------------------------
$gameMovements['circleUp'] = new Movement([
    new Velocity(4, 0),
    new Velocity(4, -Math.PI/2)
]);
$gameMovements['circleUp'].onUpdate = function() {
    this._velocities[0].angle += 0.1;
};
//---------------------------------------------------------------------------
// Movimento circular para baixo
//---------------------------------------------------------------------------
$gameMovements['circleDown'] = new Movement([
    new Velocity(4, Math.PI),
    new Velocity(4, Math.PI/2)
]);
$gameMovements['circleDown'].onUpdate = function() {
    this._velocities[0].angle -= 0.1;
};
//---------------------------------------------------------------------------
// Movimento do jogador
//---------------------------------------------------------------------------
$gameMovements['player'] = new Movement([
    new Velocity(4, 0)
]);
$gameMovements['player'].onUpdate = function() {
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
};
//=============================================================================
// Padrões de ação de inimigos
//=============================================================================
var $gameActionPatterns = {};
//---------------------------------------------------------------------------
// Não faz nada
//---------------------------------------------------------------------------
$gameActionPatterns['still'] = new GameActions({
    initialize: function() {},
    update: function() {},
    death: function() {
        this.dispose();
        for (var i = 0; i <= 54; i++)
            new Projectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(4, Math.PI * 2 / 54 * i)]),
                this
            );
    }
});
//---------------------------------------------------------------------------
// Atira em círculos a cada 72 frames (1.2 segundos)
//---------------------------------------------------------------------------
$gameActionPatterns['circle'] = new GameActions({
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        if (this._fireTimer % 72 == 0)
            for (var i = 0; i <= 32; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(2, Math.PI * 2 / 32 * i)]),
                    this
                );
        this._fireTimer++;
    },

    death: function() {
        this.dispose();
        for (var i = 0; i <= 54; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(4, Math.PI * 2 / 54 * i)]),
                    this
                );
    }
});
//---------------------------------------------------------------------------
// Atira em uma espiral no sentido anti-horário continuamente
//---------------------------------------------------------------------------
$gameActionPatterns['spiral1'] = new GameActions({
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        if (this._fireTimer % 5 == 0)
            new Projectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(2, -Math.PI * 2 / 240 * this._fireTimer)]),
                this
            );
        this._fireTimer++;
    },

    death: function() {
        this.dispose();
        for (var i = 0; i <= 54; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(4, Math.PI * 2 / 54 * i)]),
                    this
                );
    }
});
//---------------------------------------------------------------------------
// Atira em uma espiral no sentido horário continuamente
//---------------------------------------------------------------------------
$gameActionPatterns['spiral2'] = new GameActions({
    initialize: function() {
        this._fireTimer = 0;
    },

    update: function() {
        if (this._fireTimer % 5 == 0)
            new Projectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(2, Math.PI * 2 / 240 * this._fireTimer)]),
                this
            );
        this._fireTimer++;
    },

    death: function() {
        this.dispose();
        for (var i = 0; i <= 54; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(4, Math.PI * 2 / 54 * i)]),
                    this
                );
    }
});
//---------------------------------------------------------------------------
// Atira em arco para a direita
//---------------------------------------------------------------------------
$gameActionPatterns['arc1'] = new GameActions({
    initialize: function() {
        this._timer = 0;
    },

    update: function() {
        var n = 10;

        if (this._timer++ % 120 == 0)
            for (var i = 0; i <= n; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1.5 - i / n / 2, Math.PI / 4 + Math.PI / 4 / n * i)]),
                    this
                );
        if (this._timer % 150 == 0)
            for (var i = 0; i <= n; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1.5 - i / n / 2, Math.PI / 4 + Math.PI / 4 / n * i)]),
                    this
                );
    },

    death: function() {
        this.dispose();
        for (var i = 0; i <= 54; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(4, Math.PI * 2 / 54 * i)]),
                    this
                );
    }
});
//---------------------------------------------------------------------------
// Atira em arco para a esquerda
//---------------------------------------------------------------------------
$gameActionPatterns['arc2'] = new GameActions({
    initialize: function() {
        this._timer = 0;
    },

    update: function() {
        var n = 10;

        if (this._timer++ % 120 == 0)
            for (var i = 0; i <= n; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1 + i / n / 2, Math.PI / 2 + Math.PI / 4 / n * i)]),
                    this
                );
        if (this._timer % 150 == 0)
            for (var i = 0; i <= n; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(1 + i / n / 2, Math.PI / 2 + Math.PI / 4 / n * i)]),
                    this
                );
    },

    death: function() {
        this.dispose();
        for (var i = 0; i <= 54; i++)
                new Projectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(4, Math.PI * 2 / 54 * i)]),
                    this
                );
    }
});
//=============================================================================
// Estágios
//=============================================================================
var $gameStages = [];
//---------------------------------------------------------------------------
// Primeiro
//---------------------------------------------------------------------------
$gameStages.push({
    // Cores legais
    backgroundColor:        0x000000,
    playerColor:            0x00ff00,
    enemyColor:             0xff0000,
    playerProjectileColor:  0x00ffff,
    enemyProjectileColor:   0xffff00,
    
    // Criação dos inimigos
    initialize: function() {
        new Enemy(800 / 3, 32, $gameMovements['rightLeft'], 10, $gameActionPatterns['circle']);
        new Enemy(1600 / 3, 32, $gameMovements['rightLeft'], 10, $gameActionPatterns['circle']);
    },

    // Finalização do estágio
    terminate: function() {}
});
//---------------------------------------------------------------------------
// Segundo
//---------------------------------------------------------------------------
$gameStages.push({
    // Cores legais
    backgroundColor:        0x000000,
    playerColor:            0x00ff00,
    enemyColor:             0xff0000,
    playerProjectileColor:  0x00ffff,
    enemyProjectileColor:   0xffff00,

    // Criação dos inimigos
    initialize: function() {
        new Enemy(800 / 6, 32, $gameMovements['static'], 20, $gameActionPatterns['spiral1']);
        new Enemy(800 * 5 / 6, 32, $gameMovements['static'], 20, $gameActionPatterns['spiral2']);

        this._i1 = setInterval(function() {
            new Enemy(799, 48, $gameMovements['straightLeft'], 1, $gameActionPatterns['circle']);
        }, 3000);

        this._i2 = setInterval(function() {
            new Enemy(1, 48, $gameMovements['straightRight'], 1, $gameActionPatterns['circle']);
        }, 6000);
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
        clearInterval(this._i2);
    }
});
//---------------------------------------------------------------------------
// Terceiro
//---------------------------------------------------------------------------
$gameStages.push({
    // Cores legais
    backgroundColor:        0xffffff,
    playerColor:            0x00aaff,
    enemyColor:             0x000000,
    playerProjectileColor:  0x00ff00,
    enemyProjectileColor:   0xff0000,
    
    // Criação dos inimigos
    initialize: function() {
        new Enemy(800 / 3 - 48, 96,  $gameMovements['circle'], 10, $gameActionPatterns['still']);
        new Enemy(1600 / 3 + 48, 96, $gameMovements['circle'], 10, $gameActionPatterns['still']);
        new Enemy(400, 256, $gameMovements['circle'], 10, $gameActionPatterns['still']);

        this._i1 = setInterval(function() {
            new Enemy(100, 600 - 128, $gameMovements['circleUp'], 5, $gameActionPatterns['circle']);
            new Enemy(700, 128, $gameMovements['circleDown'], 5, $gameActionPatterns['circle']);
        }, 3000);
        
    },

    // Finalização do estágio
    terminate: function() {
        clearInterval(this._i1);
    }
});