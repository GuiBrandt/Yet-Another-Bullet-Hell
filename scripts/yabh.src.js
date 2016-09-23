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
// * Cria uma classe e a retorna
//      _super  : Nome da classe mãe
//      proto   : Protótipo da classe
//      props   : Objeto das propriedades (getters e setters) da classe
//-----------------------------------------------------------------------------
function __class(_super, proto, props) {
    if (!proto || typeof proto != 'object')
        throw new Error('Protótipo inválido para a classe');

    var klass = function() {
        this.initialize.apply(this, arguments);
    };

    if (!!_super) {
        __checkType(_super, 'function', '_super');

        klass.prototype = Object.create(_super.prototype);
        klass.prototype.__super__ = _super.prototype;
        klass.prototype.constructor = klass;
        for (var property in proto)
            klass.prototype[property] = proto[property];
    } else
        klass.prototype = proto;

    if (!!props) 
        if (typeof props != 'object')
            throw new Error('Propriedades inválidas');
        else
            Object.defineProperties(klass.prototype, props);

    return klass;
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
//-----------------------------------------------------------------------------
// * Verifica se o jogo está rodando em um dispositivo touch
//-----------------------------------------------------------------------------
window.isTouchDevice = function() {
  return 'ontouchstart' in window;
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
                this._keysDown.contains(this._codes['space']) ||
                TouchInput._action;
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
// ** TouchInput
//-----------------------------------------------------------------------------
// Controla a entrada por toque de comandos do jogo
//=============================================================================
var TouchInput = {
    //-----------------------------------------------------------------------
    // * Propriedades privadas
    //-----------------------------------------------------------------------
    _action: false,
    _analogOrigin: null,
    _analog: null,
    _actionTouchId: -1,
    _touchId: -1,
    _ox: -1,
    _oy: -1,
    _x: 0,
    _y: 0,
    //-----------------------------------------------------------------------
    // * Cria os controles por toque na tela
    //-----------------------------------------------------------------------
    initialize: function() {

        this._actionButton = document.createElement('div');
        var s = this._actionButton.style;
        s.backgroundColor = "rgba(255, 255, 255, 0.5)";
        var sz = "6em";
        s.height = s.width = sz;
        s.borderRadius = sz;

        s.position = 'fixed';
        s.right = '3em';
        s.bottom = '3em';
        s.zIndex = 20;
        document.body.appendChild(this._actionButton);

        // Evento de toque na tela
        function onTouchStart(event) {
            event.preventDefault();

            Game.pause = false;

            var x, y;
            for (var i = 0; i < event.changedTouches.length; i++) {
                x = event.changedTouches[i].pageX;
                y = event.changedTouches[i].pageY;

                if (document.elementFromPoint(x, y) == this._actionButton) {
                    this._action = true;
                    this._actionTouchId = event.changedTouches[i].identifier;
                    x = y = null;
                    continue;
                }

                this._touchId = event.changedTouches[i].identifier;
            }

            if (x == null || y == null)
                return;

            // Origem
            this._analogOrigin = this._analogOrigin || 
                document.createElement('div');
            var s = this._analogOrigin.style;
            s.backgroundColor = "rgba(200, 200, 200, 0.5)";
            var sz = "7em";
            s.height = s.width = sz;
            s.borderRadius = sz;
            
            s.position = 'fixed';
            s.left = x + 'px';
            s.top = y + 'px';
            s.zIndex = 20;

            s.transform = 'translateX(-50%) translateY(-50%)';

            // Controle
            this._analog = this._analog || document.createElement('div');
            s = this._analog.style;
            s.backgroundColor = "rgba(255, 255, 255, 0.5)";
            var sz = "6.5em";
            s.height = s.width = sz;
            s.borderRadius = sz;

            s.position = 'fixed';
            s.left = x + 'px';
            s.top = y + 'px';
            s.zIndex = 20;

            s.transform = 'translateX(-50%) translateY(-50%)';

            this._ox = x;
            this._oy = y;
            this._x = x;
            this._y = y;

            document.body.appendChild(this._analogOrigin);
            document.body.appendChild(this._analog);
        }

        // Evento de movimento do dedo na tela
        function onTouchMove(event) {
            event.preventDefault();

            var x = -1, 
                y = -1;
            for (var i = 0; i < event.changedTouches.length; i++) {
                if (this._touchId != event.changedTouches[i].identifier) 
                    continue;
                x = event.changedTouches[i].pageX;
                y = event.changedTouches[i].pageY;
            }

            if (x < 0 || y < 0 || !this._analog)
                return;
            this._x = x;
            this._y = y;
            this._analog.style.left = x + 'px';
            this._analog.style.top = y + 'px';
        }

        // Evento de tirar o dedo da tela
        function onTouchEnd(event) {
            event.preventDefault();

            for (var i = 0; i < event.changedTouches.length; i++) {
                var id = event.changedTouches[i].identifier;

                if (id == this._actionTouchId) {
                    this._action = false;
                    this._actionTouchId = -1;
                } else if (id == this._touchId) {
                    document.body.removeChild(this._analogOrigin);
                    document.body.removeChild(this._analog);
                    this._ox = -1;
                    this._oy = -1;
                }
            }
        }

        // Liga os eventos
        window.addEventListener('touchstart',   onTouchStart.bind(this));
        window.addEventListener('touchmove',    onTouchMove.bind(this));
        window.addEventListener('touchend',     onTouchEnd.bind(this));
    },
    //-----------------------------------------------------------------------
    // * Obtém o ângulo do movimento de acordo com o analógico
    //-----------------------------------------------------------------------
    getAngle: function() {
        if (this._ox < 0 || this._oy < 0) return 0;
        var dx = this._x - this._ox, dy = this._y - this._oy;
        return Math.atan2(dy, dx);
    },
    //-----------------------------------------------------------------------
    // * Obtém o módulo do movimento de acordo com o analógico
    //      max : Velocidade máxima
    //-----------------------------------------------------------------------
    getModule: function(max) {
        if (this._ox < 0 || this._oy < 0) return 0;
        var dx = this._x - this._ox, dy = this._y - this._oy;
        return max;
    }
}
//=============================================================================
// ** Game
//-----------------------------------------------------------------------------
// Controla os objetos do jogo, todos os GameObjects devem ser criados por 
// aqui, e não diretamente pelo construtor. Pode tentar se quiser, mas nada vai
// aparecer na tela...
//=============================================================================
var Game = {
    //-----------------------------------------------------------------------
    // * Propriedades privadas
    //-----------------------------------------------------------------------
    _player: null,
    _objects: [],
    _newObjects: [],
    _stages: [],
    _movements: {},
    _actionPatterns: {},
    _stageID: 0,
    _pause: false,
    _stop: false,
    _showText: true,
    //-----------------------------------------------------------------------
    // * Começa o jogo
    //-----------------------------------------------------------------------
    start: function() {
        this._clock = 0;
        this.createPlayer();
        this.setupStage();
    },
    //-----------------------------------------------------------------------
    // * Atualiza o jogo
    //-----------------------------------------------------------------------
    update: function() {
        if (this._stop) return;

        this._updating = true;

        var e = false;

        if (!this._pause)
            for (var i = 0; i < this._objects.length; i++) {
                if (!e) {
                    e = this._objects[i] instanceof Enemy;
                    e = e || this._objects[i] instanceof Projectile && 
                        this._objects[i].shooter instanceof Enemy;
                }
                if (this._objects[i])
                    this._objects[i].update();
            }

        if (!this._pause && !e) {
            this.currentStage.terminate();
            this.nextStage();
            this.setupStage();
        }

        this._clock++;

        for (var i = 0; i < this._newObjects.length; i++)
            this.__add(this._newObjects[i]);
        this._newObjects = [];

        while (this._objects.contains(null))
            this._objects.remove(null);

        this._updating = false;

        if (Input._keysDown.contains(17) && !this._pause)
            return this.restart();
        if (Input._keysDown.contains(27) || Input._keysDown.contains(226))
            this._pause = true;
        else if (Input.actionPressed())
            this._pause = false;
    },
    //-----------------------------------------------------------------------
    // * Recomeça o estágio atual
    //-----------------------------------------------------------------------
    restart: function() {
        this.currentStage.terminate();
        this._stop = false;
        this.clear();
        this.start();
    },
    //-----------------------------------------------------------------------
    // * Limpa os objetos do jogo
    //-----------------------------------------------------------------------
    clear: function() {
        this.forEachObject(function (obj) {
            obj.dispose();
        });
        if (!!this._player)
            this._player.dispose();
        this._player = null;
        Graphics.fullClear();
        this._objects = [];
        this._newObjects = [];
    },
    //-----------------------------------------------------------------------
    // * Começa uma fase
    //-----------------------------------------------------------------------
    setupStage: function() {
        if (!!this.currentStage) {
            Graphics.backgroundColor = this.currentStage.backgroundColor;
            AudioManager.playBgm.apply(AudioManager, this.currentStage.bgm);
            this.currentStage.initialize(!this._showText);
            this._showText = false;
        } else
            this.nextStage();
    },
    //-----------------------------------------------------------------------
    // * Avança uma fase
    //-----------------------------------------------------------------------
    nextStage: function() {
        this._stageID++;
        this._showText = true;
        this._checkFinished();
    },
    //-----------------------------------------------------------------------
    // * Verifica se o jogador zerou o jogo
    //-----------------------------------------------------------------------
    _checkFinished: function() {
        if (this._stageID >= this._stages.length) {
            console.log('Você zerou o jogo!');
            this._stageID = 0;
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
    // * Cria um padrão de movimento linear
    //      name            : Nome do movimento
    //      velocities      : Velocidades do movimento
    //-----------------------------------------------------------------------
    createLinearMovement: function(name, velocities) {
        __checkType(name, 'string', 'name');
        __checkClass(velocities, Array, 'velocities');
        if (!this._movements[name]) {
            this._movements[name] = new LinearMovement(velocities);
        }
        __checkClass(this._movements[name], LinearMovement, "Game.movement('" + name + "')");
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
        var es = [];
        for (var i = 0; i < arguments.length; i++) {
            __checkClass(arguments[i], Array, 'arguments[' + i + ']');
            es.push(this.createEnemy.apply(this, arguments[i]));
        }
        return es;
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

        if (shooter instanceof Player)
            AudioManager.playSe('audio/playerShot.m4a', 0.1, 2);

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
    // * Adiciona um objeto para a lista de inclusão nos objetos do jogo
    //-----------------------------------------------------------------------
    add: function(obj) {
        if (this._pause)
            return false;

        if (!this._updating)
            this.__add(obj);
        else {
            __checkClass(obj, GameObject, 'obj');
            this._newObjects.push(obj);
        }
    },
    //-----------------------------------------------------------------------
    // * Adiciona efetivamente um objeto aos objetos do jogo
    //-----------------------------------------------------------------------
    __add: function(obj) {

        __checkClass(obj, GameObject, 'obj');
        if (this._objects.contains(obj))
            return;
            
        var beg = 0,
            end = this._objects.length - 1,
            i = 0;
        while (beg <= end) {
            i = Math.floor((beg + end) / 2);
            if (this._objects[i] == obj) return;
            if (this._objects[i] == null || this._objects[i].color < obj.color)
                beg = i + 1;
            else if (this._objects[i].color == obj.color)
                break;
            else if (this._objects[i].color > obj.color)
                end = i - 1;                
        }

        this._objects.splice(i, 0, obj);
    },
    //-----------------------------------------------------------------------
    // * Remove um objeto do jogo
    //-----------------------------------------------------------------------
    remove: function(obj) {
        __checkClass(obj, GameObject, 'obj');
        if (this._updating)
            this._objects[this._objects.indexOf(obj)] = null;
        else
            this._objects.remove(obj);
    },
    //-----------------------------------------------------------------------
    // * Executa uma função para cada objeto do jogo
    //      callback    : Função a ser chamada
    //-----------------------------------------------------------------------
    forEachObject: function(callback) {
        for (var i = 0; i < this._objects.length; i++) {
            if (this._objects[i] == null)
                continue;
            callback.call(null, this._objects[i]);
        }
    }
};
Object.defineProperties(Game, {
    currentStage: {
        get: function() {
            return this._stages[this._stageID];
        }
    },

    currentStageID: {
        get: function() {
            return this._stageID + 1;
        }
    },

    clock: {
        get: function() {
            return this._clock;
        }
    },

    player: {
        get: function() {
            return this._player;
        }
    },

    pause: {
        get: function() {
            return this._pause;
        },
        set: function(value) {
            __checkType(value, 'boolean', 'value');
            this._pause = value;
        }
    }
});
window.addEventListener('blur', function() {
    if (!Game._stop)
        Game.pause = true;
});
//=============================================================================
// ** Graphics
//-----------------------------------------------------------------------------
// Controla o desenho das coisas na tela
//=============================================================================
var Graphics = {
    _bufferSize: 512,
    _backgroundColor: 0x000000,
    _invertColors: false,
    //-----------------------------------------------------------------------
    // * Inicializa a parte gráfica do jogo
    //-----------------------------------------------------------------------
    initialize: function(webgl) {

        if (webgl == undefined || webgl == null)
            webgl = true;
        __checkType(webgl, 'boolean', 'webgl');

        this._useWebGL = webgl;

        this._canvas = document.createElement('canvas');
        this._canvas.id = "GameCanvas";
        this.width = 640;
        this.height = 480;

        if (this._useWebGL) {
            this._initWebGL();
            this._initShaders();
            this._initVerticesBuffer();
        } else {
            this._initCanvas();
        }

        document.body.appendChild(this._canvas);
    },
    //-----------------------------------------------------------------------
    // * Inicializa o contexto do canvas
    //-----------------------------------------------------------------------
    _initCanvas: function() {
        this._canvasContext = this._canvas.getContext('2d');
    },
    //-----------------------------------------------------------------------
    // * Inicializa o WebGL
    //-----------------------------------------------------------------------
    _initWebGL: function() {
        try {
            window.gl = this._canvas.getContext('webgl') || 
                            this._canvas.getContext('experimental-webgl');
            if (!gl)
                throw new Error();
            gl.viewport(0, 0, this._canvas.width, this._canvas.height);
            gl.disable(gl.DEPTH_TEST);
            this._glDrawMode = gl.TRIANGLES;
        } catch(e) {
            alert('Falha ao inicializar WebGL');
            this._useWebGL = false;
            this._initCanvas();
        }
    },
    //-----------------------------------------------------------------------
    // * Carrega um shader pelo DOM
    //-----------------------------------------------------------------------
    _loadShader: function(name) {
        var el = document.getElementById(name);
        if (!!el)
            return el.innerText;
        else
            throw new Error('Falha ao carregar shader `' + name + "'");
    },
    //-----------------------------------------------------------------------
    // * Inicializa os shaders usados com o WebGL
    //-----------------------------------------------------------------------
    _initShaders: function() {

        function compile(shader) {
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
                throw new Error(
                    "Erro de compilação no shader: " + 
                        gl.getShaderInfoLog(shader)
                );
        }

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, this._loadShader('color-fragshader'));
        compile(fragmentShader);

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, this._loadShader('pixel-vxshader'));
        compile(vertexShader);

        this._shaderProgram = gl.createProgram();
        gl.attachShader(this._shaderProgram, vertexShader);
        gl.attachShader(this._shaderProgram, fragmentShader);
        gl.linkProgram(this._shaderProgram);

        if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS))
            throw new Error("Não foi possível inicializar os shaders");
        
        gl.useProgram(this._shaderProgram);

        this._vertPosAttr = gl.getAttribLocation(
            this._shaderProgram, 
            "vertexPosition"
        );
        gl.enableVertexAttribArray(this._vertPosAttr);
        
        var screenSizeUniform = gl.getUniformLocation(
                this._shaderProgram, 'screenSize'
        );
        gl.uniform2f(screenSizeUniform, this.width, this.height);

        this._colorUniform = gl.getUniformLocation(
            this._shaderProgram, 'color'
        );
    },
    //-----------------------------------------------------------------------
    // * Inicializa o buffer de vértices para um quadrado
    //-----------------------------------------------------------------------
    _initVerticesBuffer: function() {
        this._vbos = [];
        this._vibs = [];
    },
    //-----------------------------------------------------------------------
    // * Desenha um grupo de objetos de mesma cor
    //      color   : Cor do objetos
    //      objects : Array com os objetos
    //-----------------------------------------------------------------------
    _drawObjects: function(color, objects) {
        if (!this._vbos[color]) {
            this._vbos[color] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vbos[color]);
            gl.bufferData(gl.ARRAY_BUFFER, this._bufferSize * 8 * 8, gl.STREAM_DRAW);
            gl.vertexAttribPointer(this._vertPosAttr, 2, gl.FLOAT, gl.FALSE, 0, 0);

            this._vibs[color] = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vibs[color]);
            var indices = new Uint16Array(this._bufferSize * 6);
            for (var c = 0; c * 6 < indices.length; c += 1) {
                var i = c * 6, n = c * 4;
                indices[i]    = n;
                indices[i+1]  = n+1;
                indices[i+2]  = n+3;

                indices[i+3]  = n;
                indices[i+4]  = n+2; 
                indices[i+5]  = n+3;
            }
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        }

        if (this._invertColors)
            gl.uniform3f(this._colorUniform,
                1 - ((color >> 16) & 0xFF) / 255.0,
                1 - ((color >> 8) & 0xFF) / 255.0,
                1 - (color & 0xFF) / 255.0
            );
        else
            gl.uniform3f(this._colorUniform,
                ((color >> 16) & 0xFF) / 255.0,
                ((color >> 8) & 0xFF) / 255.0,
                (color & 0xFF) / 255.0
            );

        var vertices = new Float32Array(objects.length * 8);

        for (var i = 0; i < objects.length; i++) {
            var l = ((objects[i].hitbox.left << 1) - Graphics.width) / Graphics.width,
                t = -((objects[i].hitbox.top << 1) - Graphics.height) / Graphics.height,
                r = ((objects[i].hitbox.right << 1) - Graphics.width) / Graphics.width,
                b = -((objects[i].hitbox.bottom << 1) - Graphics.height) / Graphics.height,
                o = i * 8;

            vertices[o]     = l; vertices[o+1]  = t;
            vertices[o+2]   = r; vertices[o+3]  = t;
            vertices[o+4]   = l; vertices[o+5]  = b;
            vertices[o+6]   = r; vertices[o+7]  = b;
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
        gl.drawElements(this._glDrawMode, objects.length * 6, gl.UNSIGNED_SHORT, 0);
    },
    //-----------------------------------------------------------------------
    // * Desenha tudo na tela com WebGL
    //-----------------------------------------------------------------------
    _renderWebGL: function() {
        var lastColor = -1, objects = [];

        Game.forEachObject(function(obj) {
            if (lastColor == -1) {
                lastColor = obj.color;
            } else if (lastColor != obj.color) {
                this._drawObjects(lastColor, objects);
                objects = [];
                lastColor = obj.color;
            }
            
            objects.push(obj);
        }.bind(this));

        this._drawObjects(lastColor, objects);
    },
    //-----------------------------------------------------------------------
    // * Limpa a tela toda
    //-----------------------------------------------------------------------
    fullClear: function() {
        if (this._useWebGL)
            return;
        this._canvasContext.clearRect(0, 0, this.width, this.height);
    },
    //-----------------------------------------------------------------------
    // * Limpa a tela
    //-----------------------------------------------------------------------
    clear: function() {
        if (this._useWebGL)
            gl.clear(gl.COLOR_BUFFER_BIT);
        else
            Game.forEachObject(function(obj) {
                this._canvasContext.clearRect(
                    (obj.hitbox.left + 0.5)   | 0, 
                    (obj.hitbox.top + 0.5)    | 0,
                    (obj.hitbox.width + 0.5)  | 0,
                    (obj.hitbox.height + 0.5) | 0
                );
            }.bind(this));
    },
    //-----------------------------------------------------------------------
    // * Inverte as cores
    //-----------------------------------------------------------------------
    invertColors: function() {
        this._invertColors = !this._invertColors;
        this.backgroundColor = 0xFFFFFF - this.backgroundColor;
    },
    //-----------------------------------------------------------------------
    // * Desenha tudo na tela com canvas
    //-----------------------------------------------------------------------
    _renderCanvas: function() {
        var lastColor = -1;
        Game.forEachObject(function (obj) {
            if (lastColor != obj.color) {
                var c = obj.color.toString(16);
                this._canvasContext.fillStyle = '#' + 
                    "000000".substring(0, 6 - c.length) + c;
                lastColor = c;
            }

            this._canvasContext.fillRect(
                (obj.hitbox.left + 0.5)   | 0, 
                (obj.hitbox.top + 0.5)    | 0,
                (obj.hitbox.width + 0.5)  | 0,
                (obj.hitbox.height + 0.5) | 0
            );
        }.bind(this));
    },
    //-----------------------------------------------------------------------
    // * Desenha tudo na tela
    //-----------------------------------------------------------------------
    render: function() {
        if (this._useWebGL)
            this._renderWebGL();
        else
            this._renderCanvas();
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
        get: function() { return this._backgroundColor; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            var c = value.toString(16);
            this._canvas.style.backgroundColor = '#' + 
                "000000".substring(0, 6 - c.length) + c;
            this._backgroundColor = value;
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
    // * Inicializa o áudio
    //-----------------------------------------------------------------------
    initialize: function() {
        this._bgm = new Audio();
        this._mute = false;
        this._currentBgm = "";
    },
    //-----------------------------------------------------------------------
    // * Toca uma BGM
    //      filename    : Nome do arquivo da BGM
    //      volume      : Volume da BGM
    //      pitch       : Tom da bgm (maior = mais agudo)
    //-----------------------------------------------------------------------
    playBgm: function(filename, volume, pitch) {
        if (this._mute)
            return;

        __checkType(filename, 'string', 'filename');

        if (!!volume) {
            __checkType(volume, 'number', 'volume');
            this._bgm.volume = volume;
        }

        if (!!pitch) {
            __checkType(pitch, 'number', 'pitch');
            this._bgm.playbackRate = pitch;
        }

        if (this._currentBgm == filename) 
            return;

        this._bgm.pause();
        this._currentBgm = filename;
        this._bgm.src = filename;
        this._bgm.addEventListener('canplay', function() {
            this._bgm.play();
            this._bgm.addEventListener('ended', function() {
                this._bgm.play();
            }.bind(this));
        }.bind(this));
    },
    //-----------------------------------------------------------------------
    // * Pausa a BGM
    //-----------------------------------------------------------------------
    stopBgm: function() {
        this._bgm.pause();
    },
    //-----------------------------------------------------------------------
    // * Toca um SE
    //      filename    : Nome do arquivo de SE
    //      volume      : Volume do Se
    //      pitch       : Tom da bgm (maior = mais agudo)
    //-----------------------------------------------------------------------
    playSe: function(filename, volume, pitch) {
        if (this._mute)
            return;

        __checkType(filename, 'string', 'filename');
        var se = new Audio(filename);
        if (!!volume) {
            __checkType(volume, 'number', 'volume');
            se.volume = volume;
        }

        if (!!pitch) {
            __checkType(pitch, 'number', 'pitch');
            se.playbackRate = pitch;
        }
        se.play();
        return se;
    }
};
//=============================================================================
// ** TextManager
//-----------------------------------------------------------------------------
// Controla o texto na tela
//=============================================================================
var TextManager = {
    //-----------------------------------------------------------------------
    // * Inicializa o texto
    //-----------------------------------------------------------------------
    initialize: function() {
        this._elements = [];
    },
    //-----------------------------------------------------------------------
    // * Mostra um texto na tela e retorna o ID do texto
    //      text    : Texto a mostrar
    //      x       : Posição X do texto na tela
    //      y       : Posição Y do texto na tela
    //      style   : Estilo CSS do texto. Opcional.
    //-----------------------------------------------------------------------
    createText: function(text, x, y, style) {
        __checkType(text, 'string', 'text');
        __checkType(x, 'string', 'x');
        __checkType(y, 'string', 'y');

        style = style || {};
        __checkType(style, 'object', 'style');
        
        var txt = document.createElement('span');
        txt.innerHTML = text;
        txt.style.zIndex = 1;
        txt.style.position = 'absolute'; 
        txt.style.left = x;
        txt.style.top = y;
        txt.style.textShadow = '0px 0px 1px #000, 0px 0px 1px #000, 0px 0px 1px #000, 0px 0px 1px #000, 0px 0px 1px #000, 0px 0px 1px #000, 0px 0px 1px #000, 0px 0px 1px #000';

        for (var prop in style)
            txt.style[prop] = style[prop];

        document.body.appendChild(txt);
        this._elements.push(txt);
        return this._elements.length - 1;
    },
    //-----------------------------------------------------------------------
    // * Obtém o DOM de um texto
    //-----------------------------------------------------------------------
    getText: function(id) {
        return this._elements[id];
    },
    //-----------------------------------------------------------------------
    // * Apaga um texto da tela
    //      id  : ID do elemento
    //-----------------------------------------------------------------------
    removeText: function(id) {
        if (this._elements.length > id) {
            document.body.removeChild(this._elements[id]);
            this._elements.splice(id, 1);
        }
    },
    //-----------------------------------------------------------------------
    // * Cria um texto para nome de fase
    //      n       : Número da fase
    //      name    : Nome da fase
    //-----------------------------------------------------------------------
    createStageText: function(n, name) {
        var id = this.createText('' + n + ' - ' + name, '50%', '50%', {
            transform: 'translateX(-50%)',
            fontSize: '22pt',
            webkitTouchCallout: 'none',
            webkitUserSelect: 'none',
            mozUserSelect: 'none',
            msUserSelect: 'none',
            userSelect: 'none'
        });
        var t = this._elements[id];
        t.style.opacity = 0.0;

        var fadein = setInterval(function() {
            t.style.opacity -= -0.06;
            if (t.style.opacity >= 1.0) {
                setTimeout(function() {
                    var fadeout = setInterval(function() {
                        t.style.opacity -= 0.06;
                        if (t.style.opacity <= 0.0) {
                            TextManager.removeText(id);
                            clearInterval(fadeout);
                        }
                    }, 16);
                }, 2000);
                clearInterval(fadein);
            }
        }, 16);

        return id;
    }
};
//=============================================================================
// ** FPSManager
//-----------------------------------------------------------------------------
// Controla o framerate do jogo
//=============================================================================
var FPSManager = {
    //-----------------------------------------------------------------------
    // * Propriedades privadas
    //-----------------------------------------------------------------------
    _frameSkip: 0,
    _maxFrameSkip: 0,
    _fpsMeter: null,
    //-----------------------------------------------------------------------
    // * Inicializa o controlador de FPS
    //      showMeter   : Boolean indicando quando mostrar ou não o medidor
    //                    de FPS
    //-----------------------------------------------------------------------
    initialize: function(showMeter) {
        if (showMeter !== null && showMeter !== undefined)
            __checkType(showMeter, 'boolean', 'showMeter');
        this._fpsMeter = new FPSMeter({
            theme: 'transparent', 
            heat: true, 
            graph: true
        });
        if (!showMeter)
            this._fpsMeter.hide();
    },
    //-----------------------------------------------------------------------
    // * Mede o tempo de um processo e determina quando pular frames
    //   na próxima iteração
    //      callback    : Função para a qual medir a performance
    //-----------------------------------------------------------------------
    measure: function(callback) {
        __checkType(callback, 'function', 'callback');
        var t0 = performance.now();
        callback.call();
        this._fpsMeter.tick();
        this._frameSkip += (t0 - performance.now()) / 16;
    },
    //-----------------------------------------------------------------------
    // * Verifica se é necessário pular um frame
    //-----------------------------------------------------------------------
    needsSkip: function() {
        return Math.floor(this._frameSkip % this._maxFrameSkip) > 0;
    },
    //-----------------------------------------------------------------------
    // * Função chamada quando um frame é pulado
    //-----------------------------------------------------------------------
    skipped: function() {
        this._frameSkip--;
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
var Hitbox = __class(null, {
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

        return this.left < other.right && this.right > other.left &&
                this.top < other.bottom && this.bottom > other.top;
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
var GameObject = __class(null, {
    //-----------------------------------------------------------------------
    // * Propriedades
    //-----------------------------------------------------------------------
    _color: null,
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
            if (!!this._color)
                return this._color;
            else if (this instanceof Player)
                return Game.currentStage.playerColor;
            else if (this instanceof Enemy)
                return Game.currentStage.enemyColor;
            else if (this instanceof Projectile && this._shooter instanceof Player)
                return Game.currentStage.playerProjectileColor;
            else if (this instanceof Projectile && this._shooter instanceof Enemy)
                return Game.currentStage.enemyProjectileColor;
        },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this._color = value;
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
var Velocity = __class(null, {
    //-----------------------------------------------------------------------
    // * Construtor
    //      module  : Módulo da velocidade
    //      angle   : Ângulo em radianos da velocidade em relação ao 
    //                topo da tela
    //-----------------------------------------------------------------------
    initialize: function(module, angle) {
        __checkType(module, 'number', 'module');
        __checkType(angle,  'number', 'module');

        this._module = module;
        this._angle = angle;
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
        get: function() { return this._module; },
        set: function(value) {
            __checkType(value, 'number', 'value');
            this.initialize(value, this.angle);
        }
    },
    //-----------------------------------------------------------------------
    // * Ângulo da velocidade
    //-----------------------------------------------------------------------
    angle: {
        get: function() { return this._angle; },
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
var Bindable = __class(null, {
    //-----------------------------------------------------------------------
    // * Propriedades
    //-----------------------------------------------------------------------
    _object: null,
    //-----------------------------------------------------------------------
    // * Construtor
    //-----------------------------------------------------------------------
    initialize: function() {
        throw new Error("`Bindable' é uma classe abstrata");
    },
    //-----------------------------------------------------------------------
    // * Construtor privado (Chame esse nas classes filhas)
    //-----------------------------------------------------------------------
    _initialize: function() {},
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
var Movement = __class(Bindable, {
    //-----------------------------------------------------------------------
    // * Propriedades
    //-----------------------------------------------------------------------
    _onUpdateSrc: null,
    _onUpdate: null,
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
// ** LinearMovement
//-----------------------------------------------------------------------------
// Classe para os movimentos lineares, diminui o processamento e aumenta a 
// precisão para movimentos em linha reta
//=============================================================================
var LinearMovement = __class(Movement, {
    //-----------------------------------------------------------------------
    // * Atualização do movimento
    //   Deve ser chamada a cada frame
    //-----------------------------------------------------------------------
    update: function() {
        if (!this._object)
            throw new Error('Não é possível atualizar o movimento antes ' + 
                'de ligá-lo a um objeto');
        this._clock++;
    },
    //-----------------------------------------------------------------------
    // * Liga a um objeto do jogo
    //      object  : Objeto com o qual ligar
    //-----------------------------------------------------------------------
    bind: function(object) {
        var bound = Bindable.prototype.bind.call(this, object);
        bound._clock = 0;
        bound._x0 = object.hitbox.x;
        bound._y0 = object.hitbox.y;
        return bound;
    },
    //-----------------------------------------------------------------------
    // * Aplica o movimento o objeto ao qual ele está ligado
    //-----------------------------------------------------------------------
    apply: function() {
        var x = 0, y = 0;
        for (var i = 0; i < this._velocities.length; i++) {
            x += this._velocities[i].x * this._clock;
            y += this._velocities[i].y * this._clock;
        }
        this._object.hitbox.x = this._x0 + x;
        this._object.hitbox.y = this._y0 + y;
    }
}, {
    //-----------------------------------------------------------------------
    // * Função chamada durante a atualização do movimento
    //-----------------------------------------------------------------------
    onUpdate: {
        get: function() { return null; },
        set: function(value) {
            throw new Error("`LinearMovement' não pode ter seu `onUpdate' alterado");
        }
    }
});
//=============================================================================
// ** Projectile
//-----------------------------------------------------------------------------
// Classe dos projéteis do jogo
//=============================================================================
var Projectile = __class(GameObject, {
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
        this._hitbox.width = this._hitbox.height = 6;
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
var Enemy = __class(GameObject, {
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
        
        this._maxHealth = health;
        this._health = health;
        this._actions = actions.bind(this);
        
        this._actions.on('initialize')();
    },
    //-----------------------------------------------------------------------
    // * Dá dano no inimigo
    //-----------------------------------------------------------------------
    applyDamage: function() {
        this._health--;
        (this._actions.on('damage') || function(){})();
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

        Game.forEachObject(function(obj) {
            if (obj instanceof Projectile && obj.shooter instanceof Player &&
                    obj.hitbox.collidesWith(this._hitbox)) {
                obj.dispose();
                this.applyDamage();
            }
        }.bind(this));

        this._actions.on('update')();
    }
}, {
    //-----------------------------------------------------------------------
    // * Vida do inimigo
    //-----------------------------------------------------------------------
    health: {
        get: function() { return this._health; }
    },
    //-----------------------------------------------------------------------
    // * Vida máxima do inimigo
    //-----------------------------------------------------------------------
    maxHealth: {
        get: function() { return this._maxHealth; }
    }
});
//=============================================================================
// ** GameActions
//-----------------------------------------------------------------------------
// Classe para os objetos que representam um padrão de ação para inimigos
//=============================================================================
var GameActions = __class(Bindable, {
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
var Player = __class(GameObject, {
    //-----------------------------------------------------------------------
    // * Propriedades
    //-----------------------------------------------------------------------
    _fireTimer: 0,
    //-----------------------------------------------------------------------
    // * Construtor
    //      x   : Coordenada X do jogador
    //      y   : Coordenada Y do jogador
    //-----------------------------------------------------------------------
    initialize: function(x, y) {
        this.__super__.initialize.call(this, x, y, 'player');
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

        Game.forEachObject(function(obj) {
            if (((obj instanceof Projectile && obj.shooter instanceof Enemy) || obj instanceof Enemy) &&
                    obj.hitbox.collidesWith(this._hitbox)) {
                Graphics.invertColors();
                Game._stop = true;
                setTimeout(function() {
                    Graphics.invertColors();
                    Game.restart();
                }, 500);
            }
        }.bind(this));
    },
    //-----------------------------------------------------------------------
    // * Verifica se o objeto deveria ser apagado
    //-----------------------------------------------------------------------
    _checkDispose: function() {}
});
//=============================================================================
// movements.js
//
// Tipos de movimento para os objetos do jogo
//=============================================================================
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
Game.createLinearMovement('straightUp', [
    new Velocity(8, -Math.PI / 2)
]);
//=============================================================================
// ** straightDown
//-----------------------------------------------------------------------------
// Move-se em linha reta para baixo a uma velocidade de 8px/frame
//=============================================================================
Game.createLinearMovement('straightDown', [
    new Velocity(3, Math.PI / 2)
]);
//=============================================================================
// ** straightUp2
//-----------------------------------------------------------------------------
// Move-se em linha reta para cima a uma velocidade de 8px/frame
//=============================================================================
Game.createLinearMovement('straightUp2', [
    new Velocity(6, -Math.PI / 2)
]);
//=============================================================================
// ** straightDown2
//-----------------------------------------------------------------------------
// Move-se em linha reta para baixo a uma velocidade de 8px/frame
//=============================================================================
Game.createLinearMovement('straightDown2', [
    new Velocity(6, Math.PI / 2)
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
Game.createLinearMovement('straightRight', [
    new Velocity(4, 0)
]);
//=============================================================================
// ** straightLeft2
//-----------------------------------------------------------------------------
// Move-se em linha reta para a esquerda a 8px/frame
//=============================================================================
Game.createMovement('straightLeft2', [
    new Velocity(6, Math.PI)
]);
//=============================================================================
// ** straightRight2
//-----------------------------------------------------------------------------
// Move-se em linha reta para a direita a 8px/frame
//=============================================================================
Game.createLinearMovement('straightRight2', [
    new Velocity(6, 0)
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
// 2px/frame
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
// 2px/frame
//=============================================================================
Game.createMovement('circleLeft', [
        new Velocity(2, -Math.PI)
    ],
    function() {
        this._velocities[0].angle -= 0.1;
    }
);
//=============================================================================
// ** circleRightLeft
//-----------------------------------------------------------------------------
// Move-se em círculos alternando sentidos, a uma velocidade escalar de 
// 2px/frame
//=============================================================================
Game.createMovement('circleRightLeft', [
        new Velocity(2, 0)
    ],
    function() {
        if (!this._dir)
            this._dir = 1;
        this._velocities[0].angle += 0.1 * this._dir;
        if (this._velocities[0].angle >= Math.PI * 2 ||
            this._velocities[0].angle <= -Math.PI * 2)
            this._dir *= -1;
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
// ** spiralRight
//-----------------------------------------------------------------------------
// Move-se numa espiral no sentido horário para a direita
//=============================================================================
Game.createMovement('spiralRight', [
        new Velocity(4, 0), 
        new Velocity(8, 0)
    ],
    function() {
        this._velocities[0].angle -= 0.1;
    }
);
//=============================================================================
// ** spiralLeft
//-----------------------------------------------------------------------------
// Move-se numa espiral no sentido anti-horário para a esquerda
//=============================================================================
Game.createMovement('spiralLeft', [
        new Velocity(4, Math.PI),
        new Velocity(8, Math.PI)
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
Game.createMovement('spiralDown2', [
        new Velocity(0.75, Math.PI),
        new Velocity(0.75, Math.PI / 2)
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
                    if (this._fireTimer % 1 == 0)
                        for (var i = 0; i < 2; i++)
                            Game.createProjectile(
                                this._hitbox.x, this._hitbox.y,
                                new Movement([
                                    new Velocity(2, Math.random() * Math.PI * 2)
                                ]),
                                this
                            );
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
        this._health = this._maxHealth / 2;
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

        if (this._deathCount == 0) {
            
            if (Math.floor(this._fireTimer / 40) % 2 == 0 && this._fireTimer % 3 == 0) {
                var p = Game.createProjectile(this.hitbox.x, this.hitbox.y, 'straightDown2', this);
                p.movement._velocities[0].angle += this._fireTimer / 60 * Math.PI * 2;
                p = Game.createProjectile(this.hitbox.x, this.hitbox.y, 'straightUp2', this);
                p.movement._velocities[0].angle += this._fireTimer / 60 * Math.PI * 2;
                p = Game.createProjectile(this.hitbox.x, this.hitbox.y, 'straightRight2', this);
                p.movement._velocities[0].angle += this._fireTimer / 60 * Math.PI * 2;
                p = Game.createProjectile(this.hitbox.x, this.hitbox.y, 'straightLeft2', this);
                p.movement._velocities[0].angle += this._fireTimer / 60 * Math.PI * 2;
            }
            
            
            
            if (Math.floor(this._fireTimer / 15) % 3 == 0) {
                Game.createProjectile(Graphics.width - this.hitbox.x, 0, 'straightDown2', this);
                Game.createProjectile(this.hitbox.x, 0, 'straightDown2', this);
            }
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
            //shootCircle.call(this, this.hitbox._x, this.hitbox._y);
            
            if (this._fireTimer % 2 == 0 && this._fireTimer % 210 < 120) {
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
//=============================================================================
// stages.js
//
// Fases do jogo
//=============================================================================
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
//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
// Inicialização
Graphics.initialize();
//Graphics._glDrawMode = gl.LINE_LOOP;
AudioManager.initialize();
//AudioManager._mute = true;
TextManager.initialize();
FPSManager.initialize();
Game.start();

if (isTouchDevice())
    TouchInput.initialize();

// Loop principal
var _fullClear = false;
function mainLoop() {
    FPSManager.measure(function() {
        if (!FPSManager.needsSkip())
            if (_fullClear) {
                Graphics.fullClear();
                _fullClear = false;
            } else
                Graphics.clear();

        Game.update();

        if (FPSManager.needsSkip()) {
            FPSManager.skipped();
            _fullClear = true;
        } else
            Graphics.render();
    });
    requestAnimationFrame(mainLoop);
}

mainLoop();
})();