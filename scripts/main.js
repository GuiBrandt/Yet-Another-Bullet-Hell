//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
"use strict";

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