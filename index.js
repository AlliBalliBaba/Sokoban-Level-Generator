const canvasX = 550;
const canvasY = 550;
var counter = 0;
var currentLvl;
var swap = false;
var activeSpots;
var boxNumber;
var levelSize;
var active = false;
var win = false;
var inGame = false;
var levelNumber = 0;

//load assets
function preload() {
    loadAllImages();
}

//setup canvas
function setup() {
    canvas = createCanvas(canvasX, canvasY);
    canvas.parent('canvas1');
    document.getElementById("optimizeButton").style.visibility = "hidden";
    document.getElementById("revertButton").style.visibility = "hidden";
    displayHtmlValues();
    background(0);
}

//start new game
function startGame() {
    levelNumber = 0;
    inGame = true;
    newLevel();
    document.getElementById("startButton").style.visibility = "hidden";
    document.getElementById("optimizeButton").style.visibility = "visible";
    document.getElementById("revertButton").style.visibility = "visible";
}

//generate random level
function randomLevel() {
    levelNumber = 0;
    inGame = false;
    newLevel();
    document.getElementById("startButton").style.visibility = "visible";
    document.getElementById("optimizeButton").style.visibility = "visible";
    document.getElementById("revertButton").style.visibility = "visible";
}

//optimize the level
function optimize(iterations) {
    if (boxNumber < 7) {
        for (var i = 0; i < iterations; i++) {
            optimizeLvl(currentLvl);
        }
    }
    drawAll();
}

//generate a new level
function newLevel() {
    //reaad values
    if (inGame) {
        nextLevel();
    } else {
        readHtmlValues();
    }
    setHtmlValues();

    currentLvl = new Level(levelSize, levelSize, boxNumber);
    currentLvl.rip(randomInt(-2, 5));
    generatePaths(currentLvl);
    active = true;
    win = false;
    //if the level is unsolvable, generate a new level
    if (currentLvl.trash) {
        newLevel();
        console.log("trashlevel");
    } else {
        levelNumber++;
        activeSpots = [];
        if (inGame && boxNumber < 6) { optimize(randomInt(-4, 4)); } //randomly optimize level if in game
        drawAll();
    }
}

//p5 function, called every frame
function draw() {
    if (active) {
        //lerp player sprite towards player position
        px = (px + currentLvl.playerX) * 0.5;
        py = (py + currentLvl.playerY) * 0.5;

        //draw only active spots to increase performance
        for (var i = 0; i < activeSpots.length; i++) {
            if (activeSpots[i][0] == 0) {
                activeSpots.splice(i, 1)
                i--;
            } else {
                activeSpots[i][0]--;
                drawSpot(currentLvl, activeSpots[i][1], activeSpots[i][2]);
                if (activeSpots[i][3] != null) {
                    var tempBox = activeSpots[i][3];
                    tempBox.px = (tempBox.px + tempBox.x) * 0.5;
                    tempBox.py = (tempBox.py + tempBox.y) * 0.5;
                    drawBox(currentLvl, tempBox);
                }
            }
        }
        drawPlayer(currentLvl);

        //check for a win, else swap player sprite every 30 frames
        if (win) {
            if (counter >= 30) {
                active = false;
            }
        } else {
            if (counter >= 30) {
                counter = 0;
                swap = !swap;
            }
        }
        counter++;
    } else if (win) {
        //draw winning screen
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
function nextLevel() {
    var random = Math.random();
    if (random <= 0.1) {
        levelSize = randomInt(7, 9);
        boxNumber = randomInt(2, 4);
    } else if (random <= 0.4) {
        levelSize = randomInt(8, 12);
        boxNumber = 3;
    } else if (random <= 0.7) {
        levelSize = randomInt(9, 14);
        boxNumber = 4;
    } else if (random <= 0.88) {
        levelSize = randomInt(9, 14);
        boxNumber = 5;
    } else if (random <= 0.96) {
        levelSize = randomInt(16, 20);
        boxNumber = randomInt(4, 12);
    } else if (random <= 1) {
        levelSize = randomInt(12, 16);
        boxNumber = randomInt(6, 14);
    }
}