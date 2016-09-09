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
    initialize: function() {
        this._canvas = document.createElement('canvas');
        this.width = 640;
        this.height = 480;
        this._canvas.id = "GameCanvas";
        this._initWebGL();
        this._initShaders();
        this._initVerticesBuffer();

        document.body.appendChild(this._canvas);
    },
    //-----------------------------------------------------------------------
    // * Inicializa o WebGL
    //-----------------------------------------------------------------------
    _initWebGL: function() {
        try {
            window.gl = this._canvas.getContext('webgl') || 
                            this._canvas.getContext('experimental-webgl');
        } catch(e) {}
        window.gl.viewport(0, 0, this._canvas.width, this._canvas.height);
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
    },
    //-----------------------------------------------------------------------
    // * Limpa a tela
    //-----------------------------------------------------------------------
    clear: function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        return;
        Game.forEachObject(function(obj) {
            this._context.clearRect(
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