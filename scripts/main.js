//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
"use strict";

// Inicialização
Graphics.initialize();
AudioManager.initialize();
Game.start();

// Loop principal
function mainLoop() {
    Game.update();
    Graphics.update();
    requestAnimationFrame(mainLoop);
}

mainLoop();