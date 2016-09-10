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
        this.createPlayer();
        this.setupStage();
    },
    //-----------------------------------------------------------------------
    // * Atualiza o jogo
    //-----------------------------------------------------------------------
    update: function() {
        var i = 0, e = false;
        while (i < this._objects.length && !e) {
            e = this._objects[i] instanceof Enemy;
            e = e || this._objects[i] instanceof Projectile && 
                this._objects[i].shooter instanceof Enemy;
            i++;
        }

        if (!e) {
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
    },
    //-----------------------------------------------------------------------
    // * Começa uma fase
    //-----------------------------------------------------------------------
    setupStage: function() {
        if (!!this.currentStage) {
            Graphics.backgroundColor = this.currentStage.backgroundColor;
            AudioManager.playBgm.apply(AudioManager, this.currentStage.bgm);
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
            console.log('Você zerou o jogo!');
            window.location = window.location;
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
    // * Adiciona um objeto aos objetos do jogo
    //-----------------------------------------------------------------------
    add: function(obj) {
        __checkClass(obj, GameObject, 'obj');
        if (this._objects.contains(obj))
            return;
            
        var beg = 0,
            end = this._objects.length - 1,
            i = 0;
        while (beg <= end) {
            i = Math.floor((beg + end) / 2);
            if (this._objects[i] == obj) return;
            if (this._objects[i].color == obj.color)
                break;
            if (this._objects[i].color > obj.color)
                end = i - 1;
            else if (this._objects[i].color < obj.color)
                beg = i + 1;
        }

        this._objects.splice(i, 0, obj);
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
    },

    player: {
        get: function() {
            return this._player;
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
            if (!window.gl)
                throw new Error();
            window.gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        } catch(e) {
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
    },
    //-----------------------------------------------------------------------
    // * Inicializa o buffer de vértices para um quadrado
    //-----------------------------------------------------------------------
    _initVerticesBuffer: function() {
        this._vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vBuffer);

        var vertices = [
             1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
            -1.0, -1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
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
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    // * Desenha tudo na tela com WebGL
    //-----------------------------------------------------------------------
    _renderWebGL: function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vBuffer);
        gl.vertexAttribPointer(this._vertPosAttr, 2, gl.FLOAT, false, 0, 0);

        var sizeUniform = gl.getUniformLocation(
                this._shaderProgram, 'size'
            ),
            translateUniform = gl.getUniformLocation(
                this._shaderProgram, 'translate'
            ),
            colorUniform = gl.getUniformLocation(
                this._shaderProgram, 'color'
            );

        var lastColor = -1;
        var lastW = 0, lastH = 0;
        Game.forEachObject(function(obj) {
            if (obj._hitbox.width != lastW || obj._hitbox.height != lastH) {
                gl.uniform2f(sizeUniform, 
                    obj._hitbox.width,
                    obj._hitbox.height
                );
                lastW = obj._hitbox.width;
                lastH = obj._hitbox.height;
            }

            if (lastColor != obj.color) {
                gl.uniform3f(colorUniform,
                    ((obj.color >> 16) & 0xFF) / 255.0,
                    ((obj.color >> 8) & 0xFF) / 255.0,
                    (obj.color & 0xFF) / 255.0
                );
                lastColor = obj.color;
            }
            
            gl.uniform2f(translateUniform,
                obj._hitbox.x,
                obj._hitbox.y
            );
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }.bind(this));
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
    create: function(text, x, y, style) {
        __checkType(text, 'string', 'text');
        __checkType(x, 'number', 'x');
        __checkType(y, 'number', 'y');
        
        style = style || "";
        __checkType(style, 'string', 'style');
        
        var txt = document.createElement('span');
        txt.innerText = text.replace('<', '&lt;').replace('>', '&gt;');
        txt.style = "position: absolute; left: "  + x + 
                        "; top: " + y + ";"
        txt.style += style;
        this._elements.push(txt);
        return this._elements.length - 1;
    },
    //-----------------------------------------------------------------------
    // * Apaga um texto da tela
    //      id  : ID do elemento
    //-----------------------------------------------------------------------
    remove: function(id) {
        if (this._elements.length > id)
            this._elements.splice(id, 1);
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
var GameObject = __class(null, {
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
        this._color = null;
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
var Bindable = __class(null, {
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
var Movement = __class(Bindable, {
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
                            this.dispose();
                            Game.restart();
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
    initialize: function() {
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
    initialize: function() {
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
    initialize: function() {
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
    initialize: function() {
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
    initialize: function() {
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
//=============================================================================
// main.js
//
// Processo principal
//=============================================================================

// Inicialização
Graphics.initialize(); // Graphics.initialize(false);
AudioManager.initialize();
Game.start();

// Loop principal
function mainLoop() {
    Graphics.clear();
    Game.update();
    Graphics.render();
    requestAnimationFrame(mainLoop);
}

mainLoop();
})();