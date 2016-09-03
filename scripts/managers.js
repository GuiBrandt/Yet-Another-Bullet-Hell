//=============================================================================
// managers.js
//
// Classes estáticas relacionadas ao controle de algum fator do jogo, como
// carregamento de imagens e controle do áudio
//=============================================================================
"use strict";
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
// ** GameManager
//-----------------------------------------------------------------------------
// Controla os objetos do jogo, todos os GameObjects devem ser criados por 
// aqui, e não diretamente pelo construtor
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
            this._objects.forEach(function (obj) {        
                    obj.update();
            });
    },
    //-----------------------------------------------------------------------
    // * Recomeça o estágio atual
    //-----------------------------------------------------------------------
    restart: function() {
        this.currentStage.terminate();
        this._objects.forEach(function (obj) { obj.dispose(); });
        Graphics.clear();
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
            this._objects.forEach(function (obj) { 
                obj.updateSpriteColor();
            });
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
            alert('Você zerou o jogo!');
            this._stageID = 0;
            this.restart();
        }
    },
    //-----------------------------------------------------------------------
    // * Cria o objeto do jogador
    //-----------------------------------------------------------------------
    createPlayer: function() {
        this._player = new Player(400, 568);
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
        //__checkType(events, 'object', 'events');

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
        Graphics.createSprite(obj);
    },
    //-----------------------------------------------------------------------
    // * Remove um objeto do jogo
    //-----------------------------------------------------------------------
    remove: function(obj) {
        __checkClass(obj, GameObject, 'obj');
        this._objects.remove(obj);
        Graphics.removeSprite(obj);
    },
    //-----------------------------------------------------------------------
    // * Executa uma função para cada objeto do jogo
    //      callback    : Função a ser chamada
    //-----------------------------------------------------------------------
    forEachObject: function(callback) {
        this._objects.forEach(callback);
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
        this._renderer = new PIXI.CanvasRenderer(800, 600);
        this._canvas = this._renderer.view;
        this._canvas.id = "GameCanvas";
        this._stage = new PIXI.Container();
        document.body.appendChild(this._canvas);
    },
    //-----------------------------------------------------------------------
    // * Desenha tudo na tela
    //-----------------------------------------------------------------------
    update: function() {
        this._renderer.render(this._stage);
    },
    //-----------------------------------------------------------------------
    // * Limpa os sprites
    //-----------------------------------------------------------------------
    clear: function() {
        for (var i = this._stage.children.length - 1; i >= 0; i--) {  
            this._stage.removeChild(this._stage.children[i]);
        };
    },
    //-----------------------------------------------------------------------
    // * Cria o sprite de um objeto na tela
    //      obj     :  Objeto para o qual criar o sprite
    //-----------------------------------------------------------------------
    createSprite: function(obj) {
        var rect = new PIXI.Graphics();

        obj.sprite = rect;

        rect.redraw = function(w, h) {
            rect.beginFill(rect.color);
            rect.drawRect(0, 0, w, h);
            rect.endFill();
        };

        obj.updateSpriteColor();

        if (rect.color == null || rect.color == undefined)
            return obj.dispose();

        rect.x = obj.hitbox.left;
        rect.y = obj.hitbox.top;

        this._stage.addChild(rect);
    },
    //-----------------------------------------------------------------------
    // * Apaga o sprite de um objeto
    //      obj     : Objeto do qual apagar o sprite
    //-----------------------------------------------------------------------
    removeSprite: function(obj) {
        if (!obj.sprite) return;
        this._stage.removeChild(obj.sprite);
    }
};
Object.defineProperties(Graphics, {
    width: {
        get: function() { return this._canvas.width; }
    },
    height: {
        get: function() { return this._canvas.height; }
    },
    backgroundColor: {
        get: function() { return this._renderer.backgroundColor; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this._renderer.backgroundColor = value;
        }
    }
});