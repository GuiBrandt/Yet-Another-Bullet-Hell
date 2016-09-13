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
AudioManager._mute = true;
TextManager.initialize();
Game.start();

if (isTouchDevice())
    TouchInput.initialize();

// FPSMeter
var fpsmeter = new FPSMeter({
    theme: 'transparent', 
    heat: true, 
    graph: true
});

// Loop principal
var _maxFrameSkip = 0,
    _skip = 0,
    _fullClear = false;

function mainLoop() {
    fpsmeter.tickStart();

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
    } else {
        Graphics.render();

        _skip += (performance.now() - t0) * 60 / 1000;
        _skip = _skip > _maxFrameSkip ? _maxFrameSkip : _skip;
    }

    fpsmeter.tick();

    requestAnimationFrame(mainLoop);
}

mainLoop();