//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
"use strict";

// Inicialização
Graphics.initialize();
//Graphics._glDrawMode = gl.LINE_LOOP;
AudioManager.initialize();
//AudioManager._mute = true;
TextManager.initialize();
FPSManager.initialize();
Game._stageID = 2;
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