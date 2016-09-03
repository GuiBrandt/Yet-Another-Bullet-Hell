//=============================================================================
// objects.js
//
// Classes dos objetos do jogo, usadas para controle interno
//=============================================================================
"use strict";
//=============================================================================
// Globais
//=============================================================================
var $gameObjects;
//=============================================================================
// ** Hitbox
//-----------------------------------------------------------------------------
// Classe da caixa de colisão dos objetos do jogo
//=============================================================================
__class('Hitbox', null, {
    //-----------------------------------------------------------------------
    // * Construtor
    //      x   : Coordenada X da hitbox
    //      y   : Coordenada Y da hitbox
    //      w   : Largura da hitbox
    //      h   : Altura da hitbox
    //-----------------------------------------------------------------------
    initialize: function(x, y, w, h) {
        __checkType(x, 'number', 'x');
        __checkType(x, 'number', 'y');
        __checkType(x, 'number', 'w');
        __checkType(x, 'number', 'h');

        if (w <= 0)
            throw new Error('A largura da hitbox deve ser maior que zero');
        else if (h <= 0)
            throw new Error('A altura da hitbox deve ser maior que zero');

        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;

        this._sprite = null;
    },
    //-----------------------------------------------------------------------
    // * Verifica se a hitbox colidiu com outra
    //      other   : Outra hitbox
    //-----------------------------------------------------------------------
    collidesWith: function(other) {
        __checkClass(other, Hitbox, 'other');

        var i = 0;
        
        if (this.right.between(other.left, other.right))     i++;
        else if (this.left.between(other.left, other.right)) i++;
        
        if (this.bottom.between(other.top, other.bottom))   i++;
        else if (this.top.between(other.top, other.bottom)) i++;
        
        return i > 1;
    }
}, {
    //-----------------------------------------------------------------------
    // * Sprite relacionado à hitbox
    //-----------------------------------------------------------------------
    sprite: {
        get: function() { return this._sprite; },
        set: function(value) {
            this._sprite = value;
        }
    },
    //-----------------------------------------------------------------------
    // * Coordenada X da hitbox
    //-----------------------------------------------------------------------
    x: {
        get: function() { return this._x; },
        set: function(value) { 
            __checkType(value, 'number', 'value');
            this._x = value;
            if (!!this._sprite)
                this._sprite.x = this.left;
        }
    },
    //-----------------------------------------------------------------------
    // * Coordenada Y da hitbox
    //-----------------------------------------------------------------------
    y: {
        get: function() { return this._y; },
        set: function(value) { 
            __checkType(value, 'number', 'value');
            this._y = value;
            if (!!this._sprite)
                this._sprite.y = this.top;
        }
    },
    //-----------------------------------------------------------------------
    // * Largura da hitbox
    //-----------------------------------------------------------------------
    width: {
        get: function() { return this._w; },
        set: function(value) { 
            __checkType(value, 'number', 'value');
            
            if (value < 0)
                throw new Error('A largura deve ser maior que zero');

            this._w = value;
            this.x = this._x;
            if (!!this._sprite)
                this._sprite.redraw(this.width, this.height);
        }
    },
    //-----------------------------------------------------------------------
    // * Altura da hitbox
    //-----------------------------------------------------------------------
    height: {
        get: function() { return this._h; },
        set: function(value) { 
            __checkType(value, 'number', 'value');

            if (value < 0)
                throw new Error('A altura deve ser maior que zero');

            this._h = value;
            this.y = this._y;
            if (!!this._sprite)
                this._sprite.redraw(this.width, this.height);
        }
    },
    //-----------------------------------------------------------------------
    // * Posição da margem esquerda da hitbox
    //-----------------------------------------------------------------------
    left: {
        get: function() { return this._x - this._w / 2; },
        set: function(value) { 
            this.x = value + this._w / 2;
        }
    },
    //-----------------------------------------------------------------------
    // * Posição da margem direita da hitbox
    //-----------------------------------------------------------------------
    right: {
        get: function() { return this._x + this._w / 2; },
        set: function(value) { 
            this.x = value - this._w / 2; 
        }
    },
    //-----------------------------------------------------------------------
    // * Posição do topo da hitbox
    //-----------------------------------------------------------------------
    top: {
        get: function() { return this._y - this._h / 2; },
        set: function(value) { 
            this.y = value + this._h / 2; 
        }
    },
    //-----------------------------------------------------------------------
    // * Posição do fundo da hitbox
    //-----------------------------------------------------------------------
    bottom: {
        get: function() { return this._y + this._h / 2; },
        set: function(value) {
            this.y = value - this._h / 2; 
        }
    }
});
//=============================================================================
// ** GameObject
//-----------------------------------------------------------------------------
// Classe básica para os objetos do jogo, relaciona todos os objetos a uma
// hitbox e a um movimento
//=============================================================================
__class('GameObject', null, {
    //-----------------------------------------------------------------------
    // * Construtor
    //      x           : Coordenada X do objeto
    //      y           : Coordenada Y do objeto
    //      movement    : Objeto representando o movimento do objeto
    //-----------------------------------------------------------------------
    initialize: function(x, y, movement) {
        this._hitbox = new Hitbox(x, y, 1, 1);
        __checkClass(movement, Movement, 'movement');
        this._movement = movement.bind(this);
        
        this._sprite = null;

        addObject(this);
    },
    //-----------------------------------------------------------------------
    // * Atualização do objeto
    //   Deve ser chamada a cada frame
    //-----------------------------------------------------------------------
    update: function() {
        this._movement.update();
        this._movement.apply();
        this._checkDispose();
    },
    //-----------------------------------------------------------------------
    // * Atualiza a cor do sprite do objeto
    //-----------------------------------------------------------------------
    updateSpriteColor: function() {
        if (this instanceof Player)
            this._sprite.color = $gameStages[$stage].playerColor;
        else if (this instanceof Enemy)
            this._sprite.color = $gameStages[$stage].enemyColor;
        else if (this instanceof Projectile && this._shooter instanceof Player)
            this._sprite.color = $gameStages[$stage].playerProjectileColor;
        else if (this instanceof Projectile && this._shooter instanceof Enemy)
            this._sprite.color = $gameStages[$stage].enemyProjectileColor;
        this._sprite.redraw(this.hitbox.width, this.hitbox.height);
    },
    //-----------------------------------------------------------------------
    // * Verifica se o objeto deveria ser apagado
    //-----------------------------------------------------------------------
    _checkDispose: function() {
        if (!this.hitbox.x.between(0, $canvas.width - 1) || 
            !this.hitbox.y.between(0, $canvas.height - 1))
                this.dispose();
    },
    //-----------------------------------------------------------------------
    // * Apaga o objeto
    //-----------------------------------------------------------------------
    dispose: function() {
        $gameObjects.remove(this);
        if (!!this._sprite)
            $scene.removeChild(this._sprite);
    }
}, {
    //-----------------------------------------------------------------------
    // * Hitbox do objeto
    //-----------------------------------------------------------------------
    hitbox: {
        get: function() { return this._hitbox; },
        set: function(value) {
            __checkClass(value, Hitbox, 'value');
            this._hitbox = value;
        }
    },
    //-----------------------------------------------------------------------
    // * Sprite do objeto
    //-----------------------------------------------------------------------
    sprite: {
        get: function() { return this._sprite; },
        set: function(value) {
            this._sprite = value;
            this._hitbox.sprite = this._sprite;
        }
    },
    //-----------------------------------------------------------------------
    // * Movimento do objeto
    //-----------------------------------------------------------------------
    movement: {
        get: function() { return this._movement; },
        set: function(value) {
            __checkClass(value, Movement, 'value');
            this._movement = value.bind(this);
        }
    }
});
//=============================================================================
// ** Velocity
//-----------------------------------------------------------------------------
// Classe usada para representar uma velocidade vetorial bidimensional
//=============================================================================
__class('Velocity', null, {
    //-----------------------------------------------------------------------
    // * Construtor
    //      module  : Módulo da velocidade
    //      angle   : Ângulo em radianos da velocidade em relação ao 
    //                topo da tela
    //-----------------------------------------------------------------------
    initialize: function(module, angle) {
        __checkType(module, 'number', 'module');
        __checkType(angle,  'number', 'module');

        this._x = module * Math.cos(angle);
        this._y = module * Math.sin(angle);
    },
    //-----------------------------------------------------------------------
    // * Aplica a velocidade a um objeto do jogo
    //      object  : Objeto do jogo para aplicar o movimento
    //-----------------------------------------------------------------------
    apply: function(object) {
        __checkClass(object, GameObject, 'object');

        object.hitbox.x += this._x;
        object.hitbox.y += this._y;
    }
}, {
    //-----------------------------------------------------------------------
    // * Componente X da velocidade
    //-----------------------------------------------------------------------
    x: {
        get: function() { return this._x; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this._x = value;
        }
    },
    //-----------------------------------------------------------------------
    // * Componente Y da velocidade
    //-----------------------------------------------------------------------
    y: {
        get: function() { return this._y; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this._y = value;
        }
    },
    //-----------------------------------------------------------------------
    // * Módulo da velocidade
    //-----------------------------------------------------------------------
    module: {
        get: function() { return this._x / Math.cos(this.angle); },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this.initialize(value, this.angle);
        }
    },
    //-----------------------------------------------------------------------
    // * Ângulo da velocidade
    //-----------------------------------------------------------------------
    angle: {
        get: function() { return Math.atan2(this._y, this._x) || 0.0; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this.initialize(this.module, value);
        }
    },
});
//=============================================================================
// ** Bindable
//-----------------------------------------------------------------------------
// Classe abstrata para objetos ligáveis a um GameObject
//=============================================================================
__class('Bindable', null, {
    //-----------------------------------------------------------------------
    // * Construtor
    //-----------------------------------------------------------------------
    initialize: function() {
        throw new Error("`Bindable' é uma classe abstrata");
    },
    //-----------------------------------------------------------------------
    // * Construtor privado (Chame esse nas classes filhas)
    //-----------------------------------------------------------------------
    _initialize: function() {
        this._object = null;
    },
    //-----------------------------------------------------------------------
    // * Liga a um objeto do jogo
    //      object  : Objeto com o qual ligar
    //-----------------------------------------------------------------------
    bind: function(object) {
        var bound = this.clone();
        bound._object = object;
        return bound;
    }
});
//=============================================================================
// ** Movement
//-----------------------------------------------------------------------------
// Classe para os objetos de movimento
// Um objeto de movimento na verdade é só um modelo para criar um objeto que
// pode mover um GameObject, gerado usando o método bind do Movement
//=============================================================================
__class('Movement', 'Bindable', {
    //-----------------------------------------------------------------------
    // * Construtor
    //      velocities  : Array de velocidades que são aplicadas ao objeto
    //                    quando o movimento é chamado
    //-----------------------------------------------------------------------
    initialize: function(velocities) {
        this.__super__._initialize.call(this);
        if (!!velocities) {
            __checkClass(velocities, Array);
            this._velocities = velocities;
        }
        this._onUpdate = null;
    },
    //-----------------------------------------------------------------------
    // * Atualização do movimento
    //   Deve ser chamada a cada frame
    //-----------------------------------------------------------------------
    update: function() {
        if (!this._object)
            throw new Error('Não é possível atualizar o movimento antes ' + 
                'de ligá-lo a um objeto');
        if (!!this._onUpdate)
            this._onUpdate();
    },
    //-----------------------------------------------------------------------
    // * Liga a um objeto do jogo
    //      object  : Objeto com o qual ligar
    //-----------------------------------------------------------------------
    bind: function(object) {
        var bound = this.__super__.bind.call(this, object);
        if (!!bound._onUpdate)
            bound._onUpdate = bound._onUpdate.bind(object);
        return bound;
    },
    //-----------------------------------------------------------------------
    // * Aplica o movimento o objeto ao qual ele está ligado
    //-----------------------------------------------------------------------
    apply: function() {
        for (var i = 0; i < this._velocities.length; i++)
            this._velocities[i].apply(this._object);
    }
}, {
    //-----------------------------------------------------------------------
    // * Função chamada durante a atualização do movimento
    //-----------------------------------------------------------------------
    onUpdate: {
        get: function() { return this._onUpdate; },
        set: function(value) {
            __checkType(value, 'function', 'value');
            this._onUpdate = value.bind(this);
        }
    }
});
//=============================================================================
// ** Projectile
//-----------------------------------------------------------------------------
// Classe dos projéteis do jogo
//=============================================================================
__class('Projectile', 'GameObject', {
    //-----------------------------------------------------------------------
    // * Construtor
    //      x           : Coordenada X
    //      y           : Coordenada Y
    //      movement    : Objeto do movimento do projétil
    //      shooter     : Objeto que atirou o projétil
    //-----------------------------------------------------------------------
    initialize: function(x, y, movement, shooter) {
        __checkClass(shooter, GameObject, 'shooter');
        this._shooter = shooter;
        
        this.__super__.initialize.call(this, x, y, movement);
        this._hitbox.width = this._hitbox.height = 4;
    },
    //-----------------------------------------------------------------------
    // * Atualização do objeto
    //-----------------------------------------------------------------------
    update: function() {
        this.__super__.update.call(this);

        $gameObjects.forEach(function(obj) {
            if (this._shooter instanceof Enemy) {
                if (obj instanceof Player &&
                        this._hitbox.collidesWith(obj.hitbox)) {
                            setTimeout(restart, 20);
                            this.dispose();
                        }
            } else {
                if (obj instanceof Enemy &&
                        this._hitbox.collidesWith(obj.hitbox)) {
                            obj.applyDamage();
                            this.dispose();
                        }
            }

        }.bind(this));
    }
}, {
    //-----------------------------------------------------------------------
    // * Objeto do jogo que atirou o projétil
    //-----------------------------------------------------------------------
    shooter: {
        get: function() { return this._shooter; }
    }
});
//=============================================================================
// ** Enemy
//-----------------------------------------------------------------------------
// Classe dos inimigos do jogo
//=============================================================================
__class('Enemy', 'GameObject', {
    //-----------------------------------------------------------------------
    // * Construtor
    //      x           : Coordenada X
    //      y           : Coordenada Y
    //      movement    : Objeto do movimento do projétil
    //      health      : Vida do inimigo
    //      actions     : Ações predefinidas do inimigo
    //-----------------------------------------------------------------------
    initialize: function(x, y, movement, health, actions) {
        this.__super__.initialize.call(this, x, y, movement);
        
        this._hitbox.width = this._hitbox.height = 10;

        __checkType(health, 'number', 'health');
        __checkClass(actions, GameActions, 'actions');
        
        this._health = health;
        this._actions = actions.bind(this);
        
        this._actions.on('initialize')();
    },
    //-----------------------------------------------------------------------
    // * Dá dano no inimigo
    //-----------------------------------------------------------------------
    applyDamage: function() {
        this._health--;
        this._checkDeath();
    },
    //-----------------------------------------------------------------------
    // * Verifica a morte do inimigo
    //-----------------------------------------------------------------------
    _checkDeath: function() {
        if (this._health <= 0)
            this._actions.on('death')();
    },
    //-----------------------------------------------------------------------
    // * Atualização do objeto
    //-----------------------------------------------------------------------
    update: function() {
        this.__super__.update.call(this);
        this._actions.on('update')();
    }
}, {
    //-----------------------------------------------------------------------
    // * Vida do inimigo
    //-----------------------------------------------------------------------
    health: {
        get: function() { return this._health; }
    }
});
//=============================================================================
// ** GameActions
//-----------------------------------------------------------------------------
// Classe para os objetos que representam um padrão de ação para inimigos
//=============================================================================
__class('GameActions', 'Bindable', {
    //-----------------------------------------------------------------------
    // * Construtor
    //      events  : Objeto de eventos das ações
    //-----------------------------------------------------------------------
    initialize: function(events) {
        this.__super__._initialize.call(this);
        __checkType(events, 'object', 'events');
        this._events = events;
    },
    //-----------------------------------------------------------------------
    // * Liga as ações a um objeto
    //      object  : Objeto com o qual ligar
    //-----------------------------------------------------------------------
    bind: function(object) {
        var bound = this.__super__.bind.call(this, object);
        for (var event in bound._events)
            bound._events[event] = bound._events[event].bind(object);
        return bound;
    },
    //-----------------------------------------------------------------------
    // * Obtém um evento pelo nome
    //      name    : Nome do evento
    //-----------------------------------------------------------------------
    on: function(name) {
        return this._events[name];
    }
});
//=============================================================================
// ** Player
//-----------------------------------------------------------------------------
// Classe para o objeto representando o jogador no jogo
//=============================================================================
__class('Player', 'GameObject', {
    //-----------------------------------------------------------------------
    // * Construtor
    //      x   : Coordenada X do jogador
    //      y   : Coordenada Y do jogador
    //-----------------------------------------------------------------------
    initialize: function(x, y) {
        this.__super__.initialize.call(this, x, y, $gameMovements['player']);
        this._fireTimer = 0;
        this._hitbox.width = this._hitbox.height = 8;
    },
    //-----------------------------------------------------------------------
    // * Atualização do objeto
    //-----------------------------------------------------------------------
    update: function() {
        this.__super__.update.call(this);

        if (this._hitbox.left < 0)
            this._hitbox.left = 0;
        if (this._hitbox.right > $canvas.width)
            this._hitbox.right = $canvas.width;
        if (this._hitbox.top < 0)
            this._hitbox.top = 0;
        if (this._hitbox.bottom > $canvas.height)
            this._hitbox.bottom = $canvas.height;

        if (Input.actionPressed()) {
            this._fireTimer %= 6;
            if (this._fireTimer++ == 0)
                new Projectile(
                    this.hitbox.x, this.hitbox.y, 
                    $gameMovements['straightUp'], 
                    this
                );
        } else if (this._fireTimer > 0)
            this._fireTimer = 0;
    },
    //-----------------------------------------------------------------------
    // * Verifica se o objeto deveria ser apagado
    //-----------------------------------------------------------------------
    _checkDispose: function() {}
});