//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
"use strict";

// Inicialização
Graphics.initialize();
Game.start();
AudioManager.initialize();

// Loop principal
function mainLoop() {
    Game.update();
    Graphics.update();
    requestAnimationFrame(mainLoop);
}

mainLoop();