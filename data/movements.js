//=============================================================================
// movements.js
//
// Tipos de movimento para os objetos do jogo
//=============================================================================
"use strict";
//=============================================================================
// ** static
//-----------------------------------------------------------------------------
// Fica parado na posição inicial
//=============================================================================
Game.createMovement('static', []);
//=============================================================================
// ** straightUp
//-----------------------------------------------------------------------------
// Move-se em linha reta para cima a uma velocidade de 8px/frame
//=============================================================================
Game.createMovement('straightUp', [
    new Velocity(8, -Math.PI / 2)
]);
//=============================================================================
// ** straightLeft
//-----------------------------------------------------------------------------
// Move-se em linha reta para a esquerda a 4px/frame
//=============================================================================
Game.createMovement('straightLeft', [
    new Velocity(4, Math.PI)
]);
//=============================================================================
// ** straightRight
//-----------------------------------------------------------------------------
// Move-se em linha reta para a direita a 4px/frame
//=============================================================================
Game.createMovement('straightRight', [
    new Velocity(4, 0)
]);
//=============================================================================
// ** rightLeft
//-----------------------------------------------------------------------------
// Move-se para a direita e para a esquerda a 4px/frame, alternando a cada 
// um segundo e meio
//=============================================================================
Game.createMovement('rightLeft', [
        new Velocity(4, 0)
    ],

    function() {
        if (!this._timer) this._timer = 0;
        this._timer++;
        this._timer %= 90;
        if (this._timer == 0)
            this._velocities[0].angle += Math.PI;
    }
);
//=============================================================================
// ** leftRight
//-----------------------------------------------------------------------------
// Move-se para a esquerda e para a direita a 4px/frame, alternando a cada 
// um segundo e meio
//=============================================================================
Game.createMovement('leftRight', [
        new Velocity(4, Math.PI)
    ],
    function() {
        if (!this._timer) 
            this._timer = 0;
        this._timer++;
        this._timer %= 90;
        if (this._timer == 0)
            this._velocities[0].angle += Math.PI;
    }
);
//=============================================================================
// ** circleRight
//-----------------------------------------------------------------------------
// Move-se em círculos no sentido horário, a uma velocidade escalar de 
// 4px/frame
//=============================================================================
Game.createMovement('circleRight', [
        new Velocity(2, 0)
    ],
    function() {
        this._velocities[0].angle += 0.1;
    }
);
//=============================================================================
// ** circleLeft
//-----------------------------------------------------------------------------
// Move-se em círculos no sentido anti-horário, a uma velocidade escalar de 
// 4px/frame
//=============================================================================
Game.createMovement('circleLeft', [
        new Velocity(2, -Math.PI)
    ],
    function() {
        this._velocities[0].angle -= 0.1;
    }
);
//=============================================================================
// ** spiralUp
//-----------------------------------------------------------------------------
// Move-se numa espiral no sentido horário para cima 
//=============================================================================
Game.createMovement('spiralUp', [
        new Velocity(4, 0), 
        new Velocity(4, -Math.PI / 2)
    ],
    function() {
        this._velocities[0].angle += 0.1;
    }
);
//=============================================================================
// ** spiralDown
//-----------------------------------------------------------------------------
// Move-se numa espiral no sentido anti-horário para baixo
//=============================================================================
Game.createMovement('spiralDown', [
        new Velocity(4, Math.PI),
        new Velocity(4, Math.PI / 2)
    ],
    function() {
        this._velocities[0].angle -= 0.1;
    }
);
//=============================================================================
// ** chasePlayer
//-----------------------------------------------------------------------------
// Persegue o jogador a 4px/frame
//=============================================================================
Game.createMovement('chasePlayer', [
        new Velocity(4, 0)
    ],
    function() {
        var dy = this._object.hitbox.y - Game.player.hitbox.y,
            dx = this._object.hitbox.x - Game.player.hitbox.x;
        var theta = Math.atan2(dy, dx);
        this._velocities[0].angle = theta + Math.PI;
    }
);
//=============================================================================
// ** targetPlayer
//-----------------------------------------------------------------------------
// Vai na direção do jogador a 4px/frame, diferente do `chasePlayer`, esse
// movimento nunca muda de ângulo
//=============================================================================
Game.createMovement('targetPlayer', [
        new Velocity(4, 0)
    ], 
    function() {
        if (this._targeted) 
            return;
        this._targeted = true;
        var dy = this._object.hitbox.y - Game.player.hitbox.y,
            dx = this._object.hitbox.x - Game.player.hitbox.x;
        var theta = Math.atan2(dy, dx);
        this._velocities[0].angle = theta + Math.PI;
    });
//=============================================================================
// ** player
//-----------------------------------------------------------------------------
// Movimento do jogador, controlado pelo teclado
//=============================================================================
Game.createMovement('player', [new Velocity(0, 0)],
    function() {
        if (!isTouchDevice()) {
            this._velocities[0].module = Input.shiftPressed() ? 1.25 : 3;
            var t = ([
                0,
                Math.PI * 3 / 4,    Math.PI / 2,        Math.PI / 4,
                Math.PI,            0,                  Math.PI * 2,
                Math.PI * 5 / 4,    Math.PI * 3 / 2,    Math.PI * 7 / 4
            ])[Input.dir8()];
            if (t == 0)
                this._velocities[0].module = 0;
            this._velocities[0].angle = t;
        } else {
            this._velocities[0].module = TouchInput.getModule(2);
            this._velocities[0].angle = TouchInput.getAngle();
        }
    }
);