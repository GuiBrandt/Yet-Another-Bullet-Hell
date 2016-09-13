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
                console.log(id);

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
    _stages: [],
    _movements: {},
    _actionPatterns: {},
    _stageID: 0,
    _pause: false,
    _showText: true,
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
        var e = false;

        if (!this._pause)
            for (var i = 0; i < this._objects.length; i++) {
                if (!e) {
                    e = this._objects[i] instanceof Enemy;
                    e = e || this._objects[i] instanceof Projectile && 
                        this._objects[i].shooter instanceof Enemy;
                }
                this._objects[i].update();
            }

        if (!this._pause && !e) {
            this.currentStage.terminate();
            this.nextStage();
            this.setupStage();
        }

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
        if (this._pause)
            return false;

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

    currentStageID: {
        get: function() {
            return this._stageID + 1;
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
    Game.pause = true;
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
            if (!gl)
                throw new Error();
            gl.viewport(0, 0, this._canvas.width, this._canvas.height);
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
            gl.bufferData(gl.ARRAY_BUFFER, 512 * 8 * 8, gl.STREAM_DRAW);
            gl.vertexAttribPointer(this._vertPosAttr, 2, gl.FLOAT, gl.FALSE, 0, 0);

            this._vibs[color] = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vibs[color]);
            var indices = new Uint16Array(512 * 6);
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

        gl.uniform3f(this._colorUniform,
            ((color >> 16) & 0xFF) / 255.0,
            ((color >> 8) & 0xFF) / 255.0,
            (color & 0xFF) / 255.0
        );

        var vertices = new Float32Array(objects.length * 8);

        for (var i = 0; i < objects.length; i++) {
            var l = objects[i].hitbox.left,  t = objects[i].hitbox.top,
                r = objects[i].hitbox.right, b = objects[i].hitbox.bottom,
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
    createText: function(text, x, y, style) {
        __checkType(text, 'string', 'text');
        __checkType(x, 'string', 'x');
        __checkType(y, 'string', 'y');

        style = style || {};
        __checkType(style, 'object', 'style');
        
        var txt = document.createElement('span');
        txt.innerText = text.replace('<', '&lt;').replace('>', '&gt;');
        txt.style.zIndex = 1;
        txt.style.position = 'absolute'; 
        txt.style.left = x;
        txt.style.top = y;

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