//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
"use strict";

// Inicialização
Graphics.initialize(); // Graphics.initialize(false);
//Graphics._glDrawMode = gl.LINE_LOOP;
AudioManager.initialize();
TextManager.initialize();
Game.start();

// Loop principal
var _maxFrameSkip = 3,
    _skip = 0,
    _fullClear = false;
function mainLoop() {
    var t0 = performance.now();

    if (_skip <= 0)
        if (_fullClear) {
            Graphics.fullClear();
            _fullClear = false;
        } else
            Graphics.clear();

    Game.update();

    if (_skip > 0) {
        _skip--;
        _fullClear = true;
    }
    else {
        Graphics.render();

        _skip += (performance.now() - t0) * 60 / 1000;
        _skip = _skip > _maxFrameSkip ? _maxFrameSkip : _skip;
    }

    requestAnimationFrame(mainLoop);
}

mainLoop();