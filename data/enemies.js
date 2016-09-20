//=============================================================================
// enemies.js
//
// Padrões de ação de inimigos
//=============================================================================
//---------------------------------------------------------------------------
// Explode o inimigo em um círculo de projéteis
//---------------------------------------------------------------------------
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
//=============================================================================
// ** still
//-----------------------------------------------------------------------------
// Não faz nada, só explode em vários projéteis quando morre
//=============================================================================
Game.createActionPattern('still', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {},
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {},
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: explode
});
//=============================================================================
// ** noexplode
//-----------------------------------------------------------------------------
// Não faz nada, nem mesmo explode em vários projéteis quando morre
//=============================================================================
Game.createActionPattern('noexplode', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {},
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {},
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: function() {
        this.dispose();
    }
});
//=============================================================================
// ** straightUp
//-----------------------------------------------------------------------------
// Atira para cima
//=============================================================================
Game.createActionPattern('straightUp', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._fireTimer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {
        if (this._fireTimer % 5 == 0)
            Game.createProjectile(this._hitbox.x, this._hitbox.y, 'straightUp', this);
        this._fireTimer++;
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: function() {}
});
//=============================================================================
// ** shootPlayer
//-----------------------------------------------------------------------------
// Atira em direção do jogador
//=============================================================================
Game.createActionPattern('shootPlayer', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._timer = 0;
        this._timeouts = [];
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {
        this._timer++;
        if (this._timer % 60 == 0 && this._hitbox.y + 64 < Game.player.hitbox.y)
            for (var i = 0; i < 1; i++)
                this._timeouts.push(setTimeout(function() {
                    Game.createProjectile(
                        this._hitbox.x, this._hitbox.y,
                        'targetPlayer',
                        this
                    );
                }.bind(this), i * 200 + 1));
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: function() {
        for (var i = 0; i < this._timeouts.length; i++)
            clearTimeout(this._timeouts[i]);
        this.dispose();
    }
});
//=============================================================================
// ** circle
//-----------------------------------------------------------------------------
// Atira em círculos a cada 1.2 segundo
//=============================================================================
Game.createActionPattern('circle', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._fireTimer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
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
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: explode
});
//=============================================================================
// ** circle1
//-----------------------------------------------------------------------------
// Atira em círculos a cada 1.2 segundo numa densidade menor que a do `circle`
//=============================================================================
Game.createActionPattern('circle1', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._fireTimer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
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
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: explode
});
//=============================================================================
// ** spiral1
//-----------------------------------------------------------------------------
// Atira em espiral no sentido anti-horário
//=============================================================================
Game.createActionPattern('spiral1', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._fireTimer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {
        if (this._fireTimer % 5 == 0)
            Game.createProjectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(2, -Math.PI * 2 / 240 * this._fireTimer)]),
                this
            );
        this._fireTimer++;
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: explode
});
//=============================================================================
// ** spiral2
//-----------------------------------------------------------------------------
// Atira em espiral no sentido horário
//=============================================================================
Game.createActionPattern('spiral2', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._fireTimer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {
        if (this._fireTimer % 5 == 0)
            Game.createProjectile(
                this._hitbox.x, this._hitbox.y,
                new Movement([new Velocity(2, Math.PI * 2 / 240 * this._fireTimer)]),
                this
            );
        this._fireTimer++;
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: explode
});
//=============================================================================
// ** arc1
//-----------------------------------------------------------------------------
// Atira em arco levemente para a direita
//=============================================================================
Game.createActionPattern('arc1', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._timer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {
        var n = 10;

        if (this._timer++ % 120 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(
                        1.5 - i / n / 2, Math.PI / 4 + Math.PI / 4 / n * i
                    )]),
                    this
                );
        if (this._timer % 150 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(
                        1.5 - i / n / 2, Math.PI / 4 + Math.PI / 4 / n * i
                    )]),
                    this
                );
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: explode
});
//=============================================================================
// ** arc2
//-----------------------------------------------------------------------------
// Atira em arco levemente para a esquerda
//=============================================================================
Game.createActionPattern('arc2', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._timer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {
        var n = 10;

        if (this._timer++ % 120 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([
                        new Velocity(
                            1 + i / n / 2, 
                            Math.PI / 2 + Math.PI / 4 / n * i
                        )
                    ]),
                    this
                );
        if (this._timer % 150 == 0)
            for (var i = 0; i <= n; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([
                        new Velocity(
                            1 + i / n / 2, 
                            Math.PI / 2 + Math.PI / 4 / n * i
                        )
                    ]),
                    this
                );
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: explode
});
//=============================================================================
// ** boss1
//-----------------------------------------------------------------------------
// Padrão de ação do primeiro boss. É muito complicado pra descrever nesse
// cabeçalho, então só olhe o código e deduza
//=============================================================================
Game.createActionPattern('boss1', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._fireTimer = 0;
        this._deathCount = 0;
        this._positioned = true;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {
        var dmg = this._maxHealth - this._health,
            pct = dmg / this._maxHealth;

        var shootSpiral = function(n) {
            var a = Math.PI / 120 * n;
            for (var i = 0; i < 2; i++) {
                var b = n * i * Math.PI / 16,
                angles = [
                    a * this._fireTimer + b,
                    Math.PI/2 + a * this._fireTimer + b,
                    Math.PI + a * this._fireTimer + b,
                    3/2*Math.PI + a * this._fireTimer + b
                ];
                
                for (var j = 0; j < angles.length; j++) {
                    Game.createProjectile(
                        this._hitbox.x, this._hitbox.y,
                        new Movement([
                            new Velocity(2, angles[j])
                        ]),
                        this
                    );
                }
            }
        }.bind(this);
        
        var shootCircle = function() {
            var density = 42;
            for (var i = 0; i < density; i++) {
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(2, Math.PI * 2 / density * i)]),
                    this
                );
            }
            AudioManager.playSe("audio/enemyShot01.m4a", 0.05, 0.5);
        }.bind(this);

        if (this._positioned)
            switch (this._deathCount) {
                case 1:
                case 2:
                    if (this._fireTimer % Math.floor(9 - pct * 2) == 0)
                        shootSpiral(-1);
                    if (this._deathCount == 1) {
                        if (this._fireTimer % 120 == 0)
                            shootCircle();
                        break;
                    }
                case 0:
                    if (this._fireTimer % Math.floor(9 - pct * 2) == 0)
                        shootSpiral(1);
                    if (this._fireTimer % 120 == 0)
                        shootCircle();
                    break;
                case 3:
                    if (this._fireTimer % 2 == 0)
                        for (var i = 0; i < 2; i++) {
                            Game.createProjectile(
                                this._hitbox.x, this._hitbox.y,
                                new Movement([
                                    new Velocity(2, Math.random() * Math.PI * 2)
                                ]),
                                this
                            );
                        }
            }

        var r = 0xff, n = Math.floor(0xFF - pct * 0xFF) & 0xFF;
        this._color = (r << 16) + (n << 8) + n;
        this._fireTimer++;
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: function() {
        this._deathCount++;
        
        switch (this._deathCount) {
            case 1:
                this._positioned = false;
                this.movement = new Movement([new Velocity(4, 0)]);
                this._onPosInterval = setInterval(function() {
                    if (this.hitbox.x >= Graphics.width * 2 / 3) {
                        this.movement = Game.movement('static');
                        clearInterval(this._onPosInterval);
                        this._positioned = true;
                    }
                }.bind(this), 10);
                break;
            case 2:
                this.movement = new Movement([new Velocity(0.3, Math.PI)]);
                this.movement.onUpdate = function() {
                    if (this._velocities[0].angle == 0 &&
                            this._object.hitbox.x >= (Graphics.width * 2 / 3))
                        this._velocities[0].angle = Math.PI;
                    else if (this._velocities[0].angle == Math.PI && 
                            this._object.hitbox.x <= (Graphics.width / 3))
                        this._velocities[0].angle = 0;
                };
                break;
            case 3:
                this.movement = Game.movement('circleRight');
                break;
        }

        if (this._deathCount == 4)
            this.dispose();
        else
            this._health = this._maxHealth;
    }
});
//=============================================================================
// ** boss2
//-----------------------------------------------------------------------------
// Padrão de ação do segundo boss. É muito complicado pra descrever nesse
// cabeçalho, então só olhe o código e deduza
//=============================================================================
Game.createActionPattern('boss2', {
    //-----------------------------------------------------------------------
    // * Inicialização
    //-----------------------------------------------------------------------
    initialize: function() {
        this._deathCount = 0;
        this._colors = [
            0xFF0000, 0x00FF00, 0x0000FF, 
            0xFFFF00, 0x00FFFF, 0xFF7700, 
            0x7700FF
        ];
        this._fireTimer = 0;
    },
    //-----------------------------------------------------------------------
    // * Atualização
    //-----------------------------------------------------------------------
    update: function() {

        function shootCircle(x, y) {
            if (this._fireTimer % 60 == 0) {
                var density = 21;
                for (var i = 0; i < density; i++) {
                    Game.createProjectile(
                        x, y,
                        new Movement([new Velocity(2, Math.PI * 2 / density * i)]),
                        this
                    );
                }
                AudioManager.playSe("audio/enemyShot01.m4a", 0.05, 0.5);
            }
        }

        if (this._deathCount == 0 && Math.floor(this._fireTimer / 15) % 3 == 0) {
            Game.createProjectile(this.hitbox.x, this.hitbox.y, 'spiralDown', this);
            Game.createProjectile(this.hitbox.x, this.hitbox.y, 'spiralUp', this);

            Game.createProjectile(Graphics.width - this.hitbox.x, 0, 'straightDown2', this);
            Game.createProjectile(this.hitbox.x, 0, 'straightDown2', this);
        }
        else if (this._deathCount == 1) {
            if (Math.floor(this._fireTimer / 120) % 2 == 0) {

                var x = Math.random() * Graphics.width;

                Game.createProjectile(x, Graphics.height / 6, 'targetPlayer', this);
                Game.createProjectile(Graphics.width - x, Graphics.height / 6, 'targetPlayer', this);
            }

            if (Math.floor(this._fireTimer / 10) % 4 == 0) {
                var x = Math.random() * Graphics.width;
                Game.createProjectile(x, Graphics.height / 8, 'targetPlayer', this);
                Game.createProjectile(Graphics.width - x, Graphics.height / 8, 'targetPlayer', this);
            }
        } else if (this._deathCount == 2) {
            if (this._fireTimer % 20 == 0) {
                function shootVertLine(x) {
                    var p = Game.createProjectile(x, 0, 'straightDown2', this);
                    p.hitbox.height = 128;
                }

                function shootHorzLine(y) {
                    var p = Game.createProjectile(0, y, 'straightRight2', this);
                    p.hitbox.width = 128;
                }

                var x = Math.random() * Graphics.width,
                    y = Math.random() * Graphics.height;
                shootVertLine.call(this, x);
                shootHorzLine.call(this, y);
            } 

            shootCircle.call(this, this.hitbox._x, this.hitbox._y);
        } else if (this._deathCount == 3) {
            shootCircle.call(this, this.hitbox._x, this.hitbox._y);
            
            if (this._fireTimer % 2 == 0 && this._fireTimer % 180 < 120) {
                Game.createProjectile(0, 0, 'targetPlayer', this);
                Game.createProjectile(Graphics.width, Graphics.height, 'targetPlayer', this);
                Game.createProjectile(0, Graphics.height, 'targetPlayer', this);
                Game.createProjectile(Graphics.width, 0, 'targetPlayer', this);
            }
        }
        this._fireTimer++;
    },
    //-----------------------------------------------------------------------
    // * Efeito de morte
    //-----------------------------------------------------------------------
    death: function() {
        this._deathCount++;

        switch (this._deathCount) {
            case 1:
                this._positioned = false;
                this.movement = new Movement([new Velocity(4, -Math.PI/2)]);
                this._onPosInterval = setInterval(function() {
                    if (this.hitbox.y <= Graphics.width / 6) {
                        this.movement = Game.movement('static');
                        clearInterval(this._onPosInterval);
                        this._positioned = true;
                    }
                }.bind(this), 10);

                this._onSzInterval = setInterval(function() {
                    if (this.hitbox.width <= 24)
                        clearInterval(this._onSzInterval);
                    else
                        this.hitbox.width = --this.hitbox.height;
                }.bind(this), 24);

                this._health = this._maxHealth;
                break;
            case 2:
                this._onSzInterval = setInterval(function() {
                    if (this.hitbox.width >= 12)
                        clearInterval(this._onSzInterval);
                    else
                        this.hitbox.width = ++this.hitbox.height;
                }.bind(this), 24);
                this.movement = Game.movement('circleRightLeft');
                this._health = this._maxHealth;
                break;
            case 3:
                this._onSzInterval = setInterval(function() {
                    if (this.hitbox.width >= 32)
                        clearInterval(this._onSzInterval);
                    else
                        this.hitbox.width = ++this.hitbox.height;
                }.bind(this), 16);
                this.movement = Game.movement('static');
                this._health = 50;
                break;
        }

        if (this._deathCount == 4)
            this.dispose();
    }
});