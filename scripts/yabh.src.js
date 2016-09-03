//=============================================================================
// yabh.src.js
//
// Código completo do jogo todo encapsulado numa função. Pela segurança \o/
//=============================================================================
"use strict";
(function() {
//=============================================================================
// base.js
//
// Funções e classes básicas pra facilitar a criação do resto
//=============================================================================
//-----------------------------------------------------------------------------
// * Cria uma classe
//      name    : Nome da classe
//      _super  : Nome da classe mãe
//      proto   : Protótipo da classe
//      props   : Objeto das propriedades (getters e setters) da classe
//-----------------------------------------------------------------------------
function __class(name, _super, proto, props) {
    if (!name || typeof name != 'string')
        throw new Error('Nome inválido para a classe');
    if (!proto || typeof proto != 'object')
        throw new Error('Protótipo inválido para a classe');

    window[name] = function() {
        this.initialize.apply(this, arguments);
    };

    if (!!_super) {
        if (typeof _super != 'string')
            throw new Error("Tipo inválido para `super'");
        else if (typeof window[_super] != 'function')
            throw new Error("`" + _super + "' não é uma classe");

        window[name].prototype = Object.create(window[_super].prototype);
        window[name].prototype.__super__ = window[_super].prototype;
        window[name].prototype.constructor = window[name];
        for (var property in proto)
            window[name].prototype[property] = proto[property];
    } else
        window[name].prototype = proto;

    if (!!props) 
        if (typeof props != 'object')
            throw new Error('Propriedades inválidas');
        else
            Object.defineProperties(window[name].prototype, props);
}
//-----------------------------------------------------------------------------
// * Verifica o tipo de um parâmetro e lança um erro se for inválido
//      val     : Valor recebido como parâmetro
//      type    : Tipo esperado
//      name    : Nome do parâmetro (para a mensagem de erro)
//-----------------------------------------------------------------------------
function __checkType(val, type, name) {
    if (typeof val != type)
        throw new Error('Tipo inválido para `' + name + "'");
}
//-----------------------------------------------------------------------------
// * Verifica a classe de um parâmetro e lança um erro se for inválido
//      val     : Valor recebido como parâmetro
//      _class  : Classe esperada
//      name    : Nome do parâmetro (para a mensagem de erro)
//-----------------------------------------------------------------------------
function __checkClass(val, _class, name) {
    if (typeof val != 'object' || !(val instanceof _class))
        throw new Error('Tipo inválido para `' + name + "'");
}
//-----------------------------------------------------------------------------
// * Verifica se um número está entre outros dois
//      a, b    : Números entre os quais o primeiro número deve estar
//-----------------------------------------------------------------------------
Number.prototype.between = function(a, b) {
    __checkType(a, 'number', 'a');
    __checkType(b, 'number', 'b');

    var max = a > b ? a : b, 
        min = a < b ? a : b; 
    return this >= min && this <= max;
};
//-----------------------------------------------------------------------------
// * Retorna um clone do objeto
//-----------------------------------------------------------------------------
Object.prototype.clone = function() {
    var clone = Object.create(this);
    if (this instanceof Array) {
        for (var i = 0; i < this.length; i++) {
            if (!!this[i] && typeof this[i] == 'object')
                clone[i] = this[i].clone();
            else
                clone[i] = this[i];
        }
    } else {
        for (var property in this) {
            if (!this.hasOwnProperty(property))
                continue;
            if (!!this[property] && typeof this[property] == 'object')
                clone[property] = this[property].clone();
            else
                clone[property] = this[property];
        }
    }
    return clone;
};
//-----------------------------------------------------------------------------
// * Verifica se um elemento existe no Array
//      obj     : Objeto a verificar
//-----------------------------------------------------------------------------
Array.prototype.contains = function(obj) {
    for (var i = 0; i < this.length; i++)
        if (this[i] == obj) return true;
    return false;
};
//-----------------------------------------------------------------------------
// * Apaga um objeto do Array
//      obj     : Objeto a apagar
//-----------------------------------------------------------------------------
Array.prototype.remove = function(obj) {
    this.splice(this.indexOf(obj), 1);
};
//=============================================================================
// managers.js
//
// Classes estáticas relacionadas ao controle de algum fator do jogo, como
// carregamento de imagens e controle do áudio
//=============================================================================
//=============================================================================
// ** Input
//-----------------------------------------------------------------------------
// Classe de controle dos controles do jogo pelo teclado
//=============================================================================
var Input = {
    //-----------------------------------------------------------------------
    // * Códigos das teclas usadas
    //-----------------------------------------------------------------------
    _codes: {
        'shift':    16,
        'space':    32,
        'left':     37,
        'up':       38,
        'right':    39,
        'down':     40,
        'z':        90,
    },
    //-----------------------------------------------------------------------
    // * Array de teclas que estão pressionadas
    //-----------------------------------------------------------------------
    _keysDown: [],
    //-----------------------------------------------------------------------
    // * Reseta a detecção das teclas pressionadas
    //-----------------------------------------------------------------------
    reset: function() {
        this._keysDown = [];
    },
    //-----------------------------------------------------------------------
    // * Obtém a direção do movimento usando as setas
    //-----------------------------------------------------------------------
    dir8: function() {
        var left  = this._keysDown.contains(this._codes['left']),
            up    = this._keysDown.contains(this._codes['up']),
            right = this._keysDown.contains(this._codes['right']),
            down  = this._keysDown.contains(this._codes['down']);
    
        if (left) {
            if (down)
                return 1;
            else if (up)
                return 7;
            else
                return 4;
        } else if (right) {
            if (down)
                return 3;
            else if (up)
                return 9;
            else
                return 6;
        } else if (up)
            return 8;
        else if (down)
            return 2;

        return 0;
    },
    //-----------------------------------------------------------------------
    // * Verifica se Shift está pressionado
    //-----------------------------------------------------------------------
    shiftPressed: function() {
        return this._keysDown.contains(this._codes['shift']);
    },
    //-----------------------------------------------------------------------
    // * Verifica se o botão de ação foi pressionado
    //-----------------------------------------------------------------------
    actionPressed: function() {
        return this._keysDown.contains(this._codes['z']) ||
                this._keysDown.contains(this._codes['space']);
    }
};
//---------------------------------------------------------------------------
// Evento disparado quando uma tecla é pressionada
//---------------------------------------------------------------------------
document.addEventListener('keydown', function(ev) {
    if (!Input._keysDown.contains(ev.keyCode)) 
        Input._keysDown.push(ev.keyCode);
});
//---------------------------------------------------------------------------
// Evento disparado quando uma tecla é levantada
//---------------------------------------------------------------------------
document.addEventListener('keyup', function(ev) {
   Input._keysDown.remove(ev.keyCode); 
});
//---------------------------------------------------------------------------
// Evento disparado quando a janela perde foco
//---------------------------------------------------------------------------
window.addEventListener('blur', function() {
    Input._keysDown = [];
});
//=============================================================================
// ** Game
//-----------------------------------------------------------------------------
// Controla os objetos do jogo, todos os GameObjects devem ser criados por 
// aqui, e não diretamente pelo construtor. Pode tentar se quiser, mas nada vai
// aparecer na tela...
//=============================================================================
var Game = {
    //-----------------------------------------------------------------------
    // Propriedades privadas
    //-----------------------------------------------------------------------
    _player: null,
    _objects: [],
    _stages: [],
    _movements: {},
    _actionPatterns: {},
    _stageID: 0,
    _pause: false,
    //-----------------------------------------------------------------------
    // * Começa o jogo
    //-----------------------------------------------------------------------
    start: function() {
        this.clear();
        this.createPlayer();
        this.setupStage();
    },
    //-----------------------------------------------------------------------
    // * Atualiza o jogo
    //-----------------------------------------------------------------------
    update: function() {
        if (!this._objects.some(function(o) {
            return o instanceof Enemy; 
        })) {
            this.currentStage.terminate();
            this.nextStage();
            this.setupStage();
        }

        if (Input._keysDown.contains(17))
            return this.restart();
        if (Input._keysDown.contains(27))
            this._pause = true;
        else if (Input.actionPressed())
            this._pause = false;

        if (!this._pause)
            this.forEachObject(function (obj) { obj.update(); });
    },
    //-----------------------------------------------------------------------
    // * Recomeça o estágio atual
    //-----------------------------------------------------------------------
    restart: function() {
        this.currentStage.terminate();
        this.forEachObject(function (obj) { obj.dispose(); });
        this.clear();
        this.start();
    },
    //-----------------------------------------------------------------------
    // * Limpa os objetos do jogo
    //-----------------------------------------------------------------------
    clear: function() {
        this._objects = [];
    },
    //-----------------------------------------------------------------------
    // * Começa uma fase
    //-----------------------------------------------------------------------
    setupStage: function() {
        if (!!this.currentStage) {
            Graphics.backgroundColor = this.currentStage.backgroundColor
            this.currentStage.initialize();
        } else
            this.nextStage();
    },
    //-----------------------------------------------------------------------
    // * Avança uma fase
    //-----------------------------------------------------------------------
    nextStage: function() {
        this._stageID++;
        this._checkFinished();
    },
    //-----------------------------------------------------------------------
    // * Verifica se o jogador zerou o jogo
    //-----------------------------------------------------------------------
    _checkFinished: function() {
        if (this._stageID >= this._stages.length) {
            //console.log('Você zerou o jogo!');
            this._stageID = 0;
            this.restart();
        }
    },
    //-----------------------------------------------------------------------
    // * Cria o objeto do jogador
    //-----------------------------------------------------------------------
    createPlayer: function() {
        this._player = new Player(Graphics.width / 2, Graphics.height - 32);
        this.add(this._player);
        return this._player;
    },
    //-----------------------------------------------------------------------
    // * Cria um padrão de movimento
    //      name            : Nome do movimento
    //      velocities      : Velocidades do movimento
    //      updateCallback  : onUpdate para o movimento
    //-----------------------------------------------------------------------
    createMovement: function(name, velocities, updateCallback) {
        __checkType(name, 'string', 'name');
        __checkClass(velocities, Array, 'velocities');
        if (!this._movements[name]) {
            this._movements[name] = new Movement(velocities);
            if (!!updateCallback)
                this._movements[name].onUpdate = updateCallback;
        }
        return this._movements[name];
    },
    //-----------------------------------------------------------------------
    // * Cria um padrão de ação
    //      name    : Nome do padrão de ação
    //      events  : Eventos do padrão de ação
    //-----------------------------------------------------------------------
    createActionPattern: function(name, events) {
        __checkType(name, 'string', 'name');

        this._actionPatterns[name] = new GameActions(events);
        return this._actionPatterns[name];
    },
    //-----------------------------------------------------------------------
    // * Cria uma fase
    //      obj     : Objeto representando a fase
    //-----------------------------------------------------------------------
    createStage: function(obj) {
        __checkType(obj, 'object', 'obj');
        this._stages.push(obj);
    },
    //-----------------------------------------------------------------------
    // * Cria um inimigo
    //      x           : Coordenada X
    //      y           : Coordenada Y
    //      movement    : Objeto do movimento do projétil
    //      health      : Vida do inimigo
    //      actions     : Ações predefinidas do inimigo
    //-----------------------------------------------------------------------
    createEnemy: function(x, y, movement, health, actions) {
        var e = new Enemy(x, y, movement, health, actions);
        this.add(e);
        return e;
    },
    //-----------------------------------------------------------------------
    // * Cria vários inimigos de uma vez
    //-----------------------------------------------------------------------
    createEnemies: function() {
        for (var i = 0; i < arguments.length; i++) {
            __checkClass(arguments[i], Array, 'arguments[' + i + ']');
            this.createEnemy.apply(this, arguments[i]);
        }
    },
    //-----------------------------------------------------------------------
    // * Cria um projétil
    //      x           : Coordenada X
    //      y           : Coordenada Y
    //      movement    : Objeto do movimento do projétil
    //      shooter     : Objeto que atirou o projétil
    //-----------------------------------------------------------------------
    createProjectile: function(x, y, movement, shooter) {
        var p = new Projectile(x, y, movement, shooter);
        this.add(p);
        return p;
    },
    //-----------------------------------------------------------------------
    // * Obtém um padrão de movimento pelo nome
    //      name    : Nome do padrão de movimento
    //-----------------------------------------------------------------------
    movement: function(name) {
        __checkType(name, 'string', 'name');
        return this._movements[name];
    },
    //-----------------------------------------------------------------------
    // * Obtém um padrão de ação pelo nome
    //      name    : Nome do padrão de ação
    //-----------------------------------------------------------------------
    actionPattern: function(name) {
        __checkType(name, 'string', 'name');
        return this._actionPatterns[name];
    },
    //-----------------------------------------------------------------------
    // * Adiciona um objeto aos objetos do jogo
    //-----------------------------------------------------------------------
    add: function(obj) {
        __checkClass(obj, GameObject, 'obj');
        this._objects.push(obj);
    },
    //-----------------------------------------------------------------------
    // * Remove um objeto do jogo
    //-----------------------------------------------------------------------
    remove: function(obj) {
        __checkClass(obj, GameObject, 'obj');
        this._objects.remove(obj);
    },
    //-----------------------------------------------------------------------
    // * Executa uma função para cada objeto do jogo
    //      callback    : Função a ser chamada
    //-----------------------------------------------------------------------
    forEachObject: function(callback) {
        for (var i = 0; i < this._objects.length; i++)
            callback.call(null, this._objects[i]);
    }
};
Object.defineProperties(Game, {
    currentStage: {
        get: function() {
            return this._stages[this._stageID];
        }
    }
});
//=============================================================================
// ** Graphics
//-----------------------------------------------------------------------------
// Controla o desenho das coisas na tela
//=============================================================================
var Graphics = {
    //-----------------------------------------------------------------------
    // * Inicializa a parte gráfica do jogo
    //-----------------------------------------------------------------------
    initialize: function() {
        this._canvas = document.createElement('canvas');
        this.width = 640;
        this.height = 480;
        this._canvas.id = "GameCanvas";
        this._context = this._canvas.getContext('2d');
        document.body.appendChild(this._canvas);
    },
    //-----------------------------------------------------------------------
    // * Desenha tudo na tela
    //-----------------------------------------------------------------------
    update: function() {
        this._context.clearRect(0, 0, this.width, this.height)
        Game.forEachObject(function(obj) {
            var c = obj.color.toString(16),
                s = '#' + "000000".substring(0, 6 - c.length) + c;
            if (s != this._context.fillStyle)
                this._context.fillStyle = s;
            this._context.fillRect(
                obj.hitbox.left, 
                obj.hitbox.top,
                obj.hitbox.width,
                obj.hitbox.height
            );
        }.bind(this));
    }
};
Object.defineProperties(Graphics, {
    width: {
        get: function() { return this._canvas.width; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this._canvas.width = value;
        }
    },
    height: {
        get: function() { return this._canvas.height; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this._canvas.height = value;
        }
    },
    backgroundColor: {
        get: function() { return this._canvas.style.backgroundColor; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            var c = value.toString(16);
            this._canvas.style.backgroundColor = '#' + 
                "000000".substring(0, 6 - c.length) + c;
        }
    }
});
//=============================================================================
// ** AudioManager
//-----------------------------------------------------------------------------
// Controla a parte sonora do jogo
//=============================================================================
var AudioManager = {
    //-----------------------------------------------------------------------
    // * Propriedades privadas
    //-----------------------------------------------------------------------
    _bgmList: [
        "audio/badapple.mp3",
        "audio/tetris.mp3",
        "audio/megalovania.mp3",
    ],
    //-----------------------------------------------------------------------
    // * Inicializa o áudio
    //-----------------------------------------------------------------------
    initialize: function() {
        this._bgm = new Audio(this._bgmList[0]);
        this._bgmNumber = 0;
        this._bgm.addEventListener('ended', function() {
            this._bgmNumber++;
            this._bgmNumber %= this._bgmList.length;
            this._bgm.src = this._bgmList[this._bgmNumber];
            this._bgm.pause();
            this._bgm.load();
            this._bgm.play();
        }.bind(this));
        this._bgm.play();
    }
};
//=============================================================================
// objects.js
//
// Classes dos objetos do jogo, usadas para controle interno
//=============================================================================
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
    // * Coordenada X da hitbox
    //-----------------------------------------------------------------------
    x: {
        get: function() { return this._x; },
        set: function(value) { 
            __checkType(value, 'number', 'value');
            this._x = value;
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
        if (typeof movement == 'string')
            movement = Game.movement(movement);
        __checkClass(movement, Movement, 'movement');
        this._movement = movement.bind(this);
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
    // * Verifica se o objeto deveria ser apagado
    //-----------------------------------------------------------------------
    _checkDispose: function() {
        if (!this.hitbox.x.between(0, Graphics.width - 1) || 
            !this.hitbox.y.between(0, Graphics.height - 1))
                this.dispose();
    },
    //-----------------------------------------------------------------------
    // * Apaga o objeto
    //-----------------------------------------------------------------------
    dispose: function() {
        Game.remove(this);
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
    // * Cor do objeto
    //-----------------------------------------------------------------------
    color: {
        get: function() {
            if (this instanceof Player)
                return Game.currentStage.playerColor;
            else if (this instanceof Enemy)
                return Game.currentStage.enemyColor;
            else if (this instanceof Projectile && this._shooter instanceof Player)
                return Game.currentStage.playerProjectileColor;
            else if (this instanceof Projectile && this._shooter instanceof Enemy)
                return Game.currentStage.enemyProjectileColor;
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
        this._onUpdateSrc = null;
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
        if (!!this._onUpdateSrc)
            bound.onUpdate = this._onUpdateSrc;
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
            this._onUpdateSrc = value;
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

        Game.forEachObject(function(obj) {
            if (this._shooter instanceof Enemy) {
                if (obj instanceof Player &&
                        this._hitbox.collidesWith(obj.hitbox)) {
                            setTimeout(Game.restart.bind(Game), 20);
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

        __checkType(actions, 'string', 'actions');
        actions = Game.actionPattern(actions);
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
        this.__super__.initialize.call(this, x, y, 'player');
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
        if (this._hitbox.right > Graphics.width)
            this._hitbox.right = Graphics.width;
        if (this._hitbox.top < 0)
            this._hitbox.top = 0;
        if (this._hitbox.bottom > Graphics.height)
            this._hitbox.bottom = Graphics.height;

        if (Input.actionPressed()) {
            this._fireTimer %= 6;
            if (this._fireTimer++ == 0)
                Game.createProjectile(
                    this.hitbox.x, this.hitbox.y, 
                    'straightUp', 
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
//=============================================================================
// data.js
//
// Declaração das variáveis de dados usadas pelo resto das classes
//=============================================================================
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

        if (this._fireTimer % 72 == 0)
            for (var i = 0; i <= density; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(2, Math.PI * 2 / density * i)]),
                    this
                );
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

        if (this._fireTimer % 72 == 0)
            for (var i = 0; i <= density; i++)
                Game.createProjectile(
                    this._hitbox.x, this._hitbox.y,
                    new Movement([new Velocity(2, Math.PI * 2 / density * i)]),
                    this
                );
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
//=============================================================================
// Estágios
//=============================================================================
//---------------------------------------------------------------------------
// Primeiro
//---------------------------------------------------------------------------
Game.createStage({
    // Cores legais
    backgroundColor:        0x000000,
    playerColor:            0x00FF00,
    enemyColor:             0xFF0000,
    playerProjectileColor:  0x00FFFF,
    enemyProjectileColor:   0xFFFF00,
    
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
//---------------------------------------------------------------------------
// Segundo
//---------------------------------------------------------------------------
Game.createStage({
    // Cores legais
    backgroundColor:        0xffffff,
    playerColor:            0x00aaff,
    enemyColor:             0x000000,
    playerProjectileColor:  0x00ff00,
    enemyProjectileColor:   0xff0000,

    // Criação dos inimigos
    initialize: function() {
        Game.createEnemies(
            [Graphics.width / 6, 32, 'static', 20, 'spiral1'],
            [Graphics.width * 5 / 6, 32, 'static', 20, 'spiral2']
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
//---------------------------------------------------------------------------
// Terceiro
//---------------------------------------------------------------------------
Game.createStage({
    // Cores legais
    backgroundColor:        0x190096,
    playerColor:            0xFFFFFF,
    enemyColor:             0xFF00FF,
    playerProjectileColor:  0x00FFFF,
    enemyProjectileColor:   0xB700FF,
    
    // Criação dos inimigos
    initialize: function() {
        Game.createEnemies(
            [Graphics.width / 3,     96, 'circleRight', 5, 'still'],
            [Graphics.width * 2 / 3, 96, 'circleLeft',  5, 'still']
        );

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
// main.js
//
// Processo principal
//=============================================================================

// Inicialização
Graphics.initialize();
AudioManager.initialize();
Game.start();
AudioManager.initialize();

// Loop principal
function mainLoop() {
    Game.update();
    Graphics.update();
    requestAnimationFrame(mainLoop);
}

mainLoop();
})();