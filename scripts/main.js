//=============================================================================
// main.js
//
// Processo principal
//=============================================================================
var $player, $canvas, $renderer, $stage, $scene;

$renderer = new PIXI.CanvasRenderer(800, 600);
$canvas = $renderer.view;
$canvas.id = "GameCanvas";
document.body.appendChild($canvas);

function setupStage() {
    if (!!$gameStages[$stage]) {
        $renderer.backgroundColor = parseInt($gameStages[$stage].backgroundColor);
        $gameObjects.forEach(function (obj) {
            obj.updateSpriteColor();
        });
        $gameStages[$stage].initialize();
    } else {
        alert('Você zerou o jogo, parabéns.');
        $stage = 0;
        restart();
    }
}

function addObject(obj) {
    $gameObjects.push(obj);

    var rect = new PIXI.Graphics();

    obj.sprite = rect;

    rect.redraw = function(w, h) {
        rect.beginFill(rect.color);
        rect.drawRect(0, 0, w, h);
        rect.endFill();
    };

    obj.updateSpriteColor();

    if (rect.color == null || rect.color == undefined)
        return obj.dispose();

    rect.x = obj.hitbox.left;
    rect.y = obj.hitbox.top;

    $scene.addChild(rect);
}

$stage = 1;

function start() {
    $gameObjects = [];
    $scene = new PIXI.Container();

    $player = new Player(400, 568);

    setupStage();
}

function restart() {
    $gameStages[$stage].terminate();
    $gameObjects.forEach(function (obj) {
        obj.dispose(); 
    });
    Input.reset();
    start();
}

start();

var pause = false;

function update() {
    if (Input._keysDown.contains(17))
        return restart();

    if (Input._keysDown.contains(27))
        pause = true;
    else if (Input.actionPressed())
        pause = false;

    $gameObjects.forEach(function (obj) {        
        if (!pause)
            obj.update();
    });
}

function render() {
    var t0 = performance.now();

    if (!$gameObjects.some(function(o) {
        return o instanceof Enemy; 
    })) {
        $gameStages[$stage++].terminate();
        setupStage();
    }

    update();
    $renderer.render($scene);

    var t1 = performance.now();

    var delta = t1 - t0;
    delta = delta >= 0 ? delta : 15;

    setTimeout(render, 16 - delta);
}

render();