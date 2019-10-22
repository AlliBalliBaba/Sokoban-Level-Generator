const canvasX = 550;
const canvasY = 550;
var currentLvl;
var counter = 0;
var boxNumber = 0;
var levelNumber = 0;
var levelSize = 0;
var active = false;
var win = false;
var inGame = false;
var swap = false;

//load assets
function preload() {
    loadAllImages();
}

//setup canvas
function setup() {
    canvas = createCanvas(canvasX, canvasY);
    canvas.parent('canvas1');
    document.getElementById("optimizeButton").style.visibility = "hidden";
    displayHtmlValues();
    background(0);
    preventArrowKeyScroll();
    drawOnlyWalls();
}

//start new game
function startGame() {
    levelNumber = 0;
    inGame = true;
    newLevel();
}

//generate random level
function randomLevel() {
    levelNumber = 0;
    inGame = false;
    newLevel();
    //document.getElementById("startButton").style.visibility = "visible";
    //document.getElementById("startButton").disabled = false;
}

//optimize the level
function optimize(iterations) {
    optimizeLvl(currentLvl, iterations);
    drawAll();
}

//generate a new level
function newLevel() {
    //read level size and box number values
    inGame ? randomValues() : readHtmlValues();
    setHtmlValues();
    currentLvl = new Level(levelSize, levelSize, boxNumber);
    //randomly remove walls from the level
    currentLvl.rip(randomInt(-2, 5));
    //generate level
    generatePaths(currentLvl);

    //if the level is unsolvable, generate a new level
    if (currentLvl.trash) {
        newLevel();
        console.log("trashlevel");
    } else {
        levelNumber++;
        activeSpots = [];
        document.getElementById("optimizeButton").style.visibility = "visible";

        //randomly optimize the level if in game
        if (inGame && boxNumber < 6) {
            optimize(randomInt(-1000, 1000));
        }
        active = true;
        win = false;
        drawAll();
    }
}

//p5 function, called every frame
function draw() {
    if (active) {
        //draw active spots, that were visited by the player
        drawActiveSpots();
        //lerp player sprite towards player position
        px = (px + currentLvl.playerX) * 0.5;
        py = (py + currentLvl.playerY) * 0.5;
        drawPlayer(currentLvl);
        //check for a win, else swap player sprite every 30 frames
        if (win && counter >= 30) {
            active = false;
        } else if (counter >= 30) {
            counter = 0;
            swap = !swap;
        }
        counter++;
    } else if (win) {
        drawWin();
    }
}

//read slider values
function readHtmlValues() {
    levelSize = Math.floor(document.getElementById("sizeSlider").value);
    boxNumber = Math.floor(document.getElementById("numSlider").value);
    if (boxNumber * 2 > (levelSize - 4) * (levelSize - 4) - 2) {
        boxNumber = Math.floor(((levelSize - 4) * (levelSize - 4) - 2) / 2);
    }
}

//display slider values
function displayHtmlValues() {
    document.getElementById("sizeTxt").innerHTML = "level size: " + String(document.getElementById("sizeSlider").value);
    document.getElementById("boxTxt").innerHTML = "number of boxes: " + String(document.getElementById("numSlider").value);
}

//set slider values
function setHtmlValues() {
    document.getElementById("sizeSlider").value = levelSize;
    document.getElementById("numSlider").value = boxNumber;
    displayHtmlValues();
}

//set levelSize and boxNumber randomly
function randomValues() {
    var random = Math.random();
    if (random <= 0.1) {
        levelSize = randomInt(7, 9);
        boxNumber = randomInt(2, 4);
    } else if (random <= 0.3) {
        levelSize = randomInt(8, 12);
        boxNumber = 3;
    } else if (random <= 0.7) {
        levelSize = randomInt(9, 13);
        boxNumber = 4;
    } else if (random <= 0.9) {
        levelSize = randomInt(9, 14);
        boxNumber = 5;
    } else if (random <= 0.96) {
        levelSize = randomInt(16, 20);
        boxNumber = randomInt(4, 8);
    } else if (random <= 1) {
        levelSize = randomInt(9, 16);
        boxNumber = randomInt(6, 14);
    }
}