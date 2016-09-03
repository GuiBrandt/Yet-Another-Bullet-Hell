//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
"use strict";

// Inicialização
Graphics.initialize();
Game.start();

// Loop principal
function mainLoop() {
    var t0 = performance.now(), delay;
    Game.update();
    Graphics.update();
    delay = performance.now() - t0;
    setTimeout(mainLoop, 16 - (delay >= 0 ? delay : 15));
}

mainLoop();