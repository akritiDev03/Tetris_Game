// Define Tetris shapes (7 types), each represented as a 2D array
const SHAPES=[
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]

    ],
    [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    [
        [1,1],
        [1,1]
    ]
];

// Color codes for each shape and background (index 0 is background)
const COLORS=[
    "#ffffff",  // 0 - Empty cell (white)
    "#D64E12",  // 1 - Firebrick Red
    "#6BCB77",  // 2 - Soft Green
    "#4D96FF",  // 3 - Blue
    "#FFD93D",  // 4 - Yellow
    "#FF9F1C",  // 5 - Orange
    "#9B5FE0",  // 6 - Amethyst Purple
    "#60DBE8"   // 7 - Light Cyan
];

const ROWS=20;
const COLS=10;

// Canvas setup
let canvas=document.querySelector("#tetris");
let scoreboard=document.querySelector("h2");
let ctx=canvas.getContext("2d");
ctx.scale(30,30);// scale each block to 30x30 pixels

// Game state
let pieceObj=null;
let grid= generateGrid();
let score=0;
let gameSpeed = 500;
let paused = false;
let gameRunning = true;


// Start the game loop
gameLoop();


//  Main game loop runs every gameSpeed milliseconds
function gameLoop() {
    if (!paused && gameRunning) {
        newGameState(); // update game state
        adjustSpeed();  // increase difficulty as score increases
    }
    setTimeout(gameLoop, gameSpeed);
}


// Generates a random new Tetris piece
function generateRandomPiece(){
    let ran=Math.floor(Math.random()*7);// index 0–6
    //4 properties
    let piece=SHAPES[ran];
    let colorIndex=ran+1; // because 0 is for background
    let x=4;// start from middle top
    let y=0;
    return{
        piece,
        x,
        y,
        colorIndex
    };
}

// Updates game state on each tick
function newGameState(){
    checkGrid();// Check for completed lines
     if(pieceObj==null){
        pieceObj=generateRandomPiece(); // spawn a new piece
        console.log("Generated new piece:", pieceObj); 
     }
     moveDown();// Move current piece down
}

// Adjust game speed as score increases
function adjustSpeed() {
    if (score >= 100) gameSpeed = 450;
    else if (score >= 200) gameSpeed = 400;
    else if (score >= 300) gameSpeed = 350;
    else if (score >= 400) gameSpeed = 300;
    else if (score >= 500) gameSpeed = 250;
    else if (score >= 600) gameSpeed = 200;
    else if (score >= 700) gameSpeed = 150;
}


// Checks the grid for full rows and removes them
function checkGrid(){
    let count=0;
    for(let i=0;i<grid.length;i++){
        let allFilled=true;
        for(let j=0;j<grid[i].length;j++){
            if(grid[i][j]==0){
                allFilled=false;
            }
        }
        if (allFilled){
            grid.splice(i,1);  // remove full row
            grid.unshift([0,0,0,0,0,0,0,0,0,0]);// add new empty row on top
            count++;
        }
    }

    // Update score based on lines cleared
    if (count == 1) score += 10;
    else if (count == 2) score += 30;
    else if (count == 3) score += 50;
    else if (count > 3) score += 100;

     // Update score display
    scoreboard.innerHTML = paused ? "Paused | Score: " + score : "Score: " + score;
}

// Renders the current falling piece
function renderPiece(){
    if (!pieceObj) return;
    let piece=pieceObj.piece;
    for(let i=0;i<piece.length;i++){
        for(let j=0;j<piece[i].length;j++){
            if(piece[i][j]==1){
                ctx.fillStyle=COLORS[pieceObj.colorIndex];
                ctx.fillRect(pieceObj.x+j,pieceObj.y+i,1,1);
            }
        }
    }
}

// Moves the piece down by one block
function moveDown(){
    if(!collision(pieceObj.x,pieceObj.y+1)){
       pieceObj.y+=1;
    }
    else{
         // Lock the piece in the grid
        for(let i=0;i<pieceObj.piece.length;i++){
            for(let j=0;j<pieceObj.piece[i].length;j++){
                   if(pieceObj.piece[i][j]==1){
                       let p=pieceObj.x+j;
                       let q=pieceObj.y+i;
                       grid[q][p]=pieceObj.colorIndex; // lock color
                   }
            }
        }
        
        // Game over condition: if piece reaches top
        if(pieceObj.y==0){
            alert("Game Over");
            grid=generateGrid();
            score=0;
            gameSpeed=500;
            scoreboard.innerHTML = "Score: " + score; 
        }
        pieceObj = null;// reset for next piece
    }
    renderGrid();
}

// Moves piece left
function moveLeft(){
    if(!collision(pieceObj.x-1,pieceObj.y))
        pieceObj.x-=1;
        
    renderGrid();     
}

// Moves piece right
function moveRight(){
    if(!collision(pieceObj.x+1,pieceObj.y))
        pieceObj.x+=1;
        
    renderGrid();   
}

// Rotates the current piece
 function rotate(){
         let rotatedPiece=[];
         let piece=pieceObj.piece;
        
        // Create empty rotated array
         for(let i=0;i<piece.length;i++){
            rotatedPiece.push([]);
            for(let j=0;j<piece[i].length;j++){
               rotatedPiece[i].push(0);
            }
         }

        // Transpose and reverse rows to rotate
          for(let i=0;i<piece.length;i++){
            for(let j=0;j<piece[i].length;j++){
                rotatedPiece[i][j]=piece[j][i];
            }
         }
         for(let i=0;i<rotatedPiece.length;i++){
            rotatedPiece[i]=rotatedPiece[i].reverse();
         }

        // Apply rotation if no collision
        if(!collision(pieceObj.x,pieceObj.y,rotatedPiece))
            pieceObj.piece=rotatedPiece;

        renderGrid(); 
 }

 // Checks for collisions with the grid or walls
function collision(x,y,rotatedPiece){
         let piece=rotatedPiece || pieceObj.piece;
         for(let i=0;i<piece.length;i++){
            for(let j=0;j<piece[i].length;j++){
                if(piece[i][j]==1){
                    let p=x+j;
                    let q=y+i;
                    if(p>=0 && p<COLS && q>=0 && q<ROWS){
                       if(grid[q][p]>0)  return true; 
                    }else{
                        return true;
                    }
                }
            }
         }
     return false;
}

// Initializes empty 20x10 grid
function generateGrid(){
    let grid=[];
    for(let i=0;i<ROWS;i++){
        grid.push([]);
        for(let j=0;j<COLS;j++){
          grid[i].push(0);

        }
    }
    return grid;
}

// Renders the entire grid and current piece
function renderGrid(){
    for(let i=0;i<grid.length;i++){
        for(let j=0;j<grid[i].length;j++){
           ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(j,i,1,1);
        }
    }
    renderPiece();
}

// Handle user key input
document.addEventListener("keydown",function(e){
    let key=e.code;

    if (key === "Space") {
        paused = !paused;
        scoreboard.innerHTML = paused ? "Paused | Score: " + score : "Score: " + score;
        return;
    }

    if (paused) return; // ignore other keys if game is paused

    if(key=="ArrowDown"){
        moveDown();       
    }else if(key=="ArrowLeft"){
        moveLeft();
    }else if(key=="ArrowRight"){
        moveRight();
    }else if(key=="ArrowUp"){
        rotate();
    }
});