const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Define initial game components
const ballRadius = 10;
const paddleWidth = 10;
const paddleHeight = 100;

let paddleSpeed;   // Speed of paddles (based on difficulty)
let ballSpeed;     // Speed of ball (based on difficulty)
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDx;
let ballDy;

let playerY = canvas.height / 2 - paddleHeight / 2;
let computerY = canvas.height / 2 - paddleHeight / 2;

let playerScore = 0;
let computerScore = 0;

let upPressed = false;
let downPressed = false;

let difficulty = 'medium'; // Default difficulty level

canvas.width = 800;
canvas.height = 400;

// Set difficulty-based parameters
function setDifficultyParams() {
    if (difficulty === 'easy') {
        paddleSpeed = 4;  // Slow paddle speed
        ballSpeed = 4;    // Slow ball speed
    } else if (difficulty === 'medium') {
        paddleSpeed = 6;  // Normal paddle speed
        ballSpeed = 6;    // Normal ball speed
    } else if (difficulty === 'hard') {
        paddleSpeed = 8;  // Fast paddle speed
        ballSpeed = 8;    // Fast ball speed
    }

    ballDx = ballSpeed;
    ballDy = ballSpeed;
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

// Draw paddles
function drawPaddles() {
    ctx.beginPath();
    ctx.rect(0, playerY, paddleWidth, paddleHeight); // Player's paddle
    ctx.rect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight); // Computer's paddle
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

// Draw scores
function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Player: ${playerScore}`, 20, 30);
    ctx.fillText(`Computer: ${computerScore}`, canvas.width - 120, 30);
}

// Move paddles
function movePaddles() {
    if (upPressed && playerY > 0) {
        playerY -= paddleSpeed;
    }
    if (downPressed && playerY < canvas.height - paddleHeight) {
        playerY += paddleSpeed;
    }
}

// Enhanced AI logic with prediction and smoothing
function moveComputer() {
    let aiSpeed;
    if (difficulty === 'easy') {
        aiSpeed = paddleSpeed * 0.8; // Slow AI on Easy
    } else if (difficulty === 'medium') {
        aiSpeed = paddleSpeed; // Normal AI on Medium
    } else if (difficulty === 'hard') {
        aiSpeed = paddleSpeed * 1.5; // Fast AI on Hard
    }

    // Prediction: Calculate where the ball is going to be
    const predictedY = ballY + (ballDx > 0 ? ballDy : -ballDy) * (canvas.width - ballX) / ballDx;

    // Constrain the prediction to within the canvas height
    const predictedYClamped = Math.max(Math.min(predictedY, canvas.height - paddleHeight), 0);

    // Move the AI paddle towards the predicted position
    if (computerY + paddleHeight / 2 < predictedYClamped) {
        computerY += aiSpeed;
    } else if (computerY + paddleHeight / 2 > predictedYClamped) {
        computerY -= aiSpeed;
    }

    // Ensure the AI paddle stays within bounds
    if (computerY < 0) computerY = 0;
    if (computerY + paddleHeight > canvas.height) computerY = canvas.height - paddleHeight;
}

// Update ball position
function moveBall() {
    ballX += ballDx;
    ballY += ballDy;

    // Ball collision with top and bottom walls
    if (ballY - ballRadius <= 0 || ballY + ballRadius >= canvas.height) {
        ballDy = -ballDy;
    }

    // Ball collision with paddles (dynamic angle based on paddle hit)
    if (ballX - ballRadius <= paddleWidth && ballY >= playerY && ballY <= playerY + paddleHeight) {
        // Player's paddle hit: Calculate ball angle based on where it hits the paddle
        ballDx = -ballDx;
        const relativeY = ballY - (playerY + paddleHeight / 2); // Distance from the center of the paddle
        const normalizedRelativeY = relativeY / (paddleHeight / 2); // Normalize this value to range from -1 to 1
        ballDy = normalizedRelativeY * ballSpeed; // Set the new ball angle based on paddle hit position
    }

    if (ballX + ballRadius >= canvas.width - paddleWidth && ballY >= computerY && ballY <= computerY + paddleHeight) {
        // Computer's paddle hit: Calculate ball angle based on where it hits the paddle
        ballDx = -ballDx;
        const relativeY = ballY - (computerY + paddleHeight / 2); // Distance from the center of the paddle
        const normalizedRelativeY = relativeY / (paddleHeight / 2); // Normalize this value to range from -1 to 1
        ballDy = normalizedRelativeY * ballSpeed; // Set the new ball angle based on paddle hit position
    }

    // Ball out of bounds (scoring)
    if (ballX - ballRadius <= 0) {
        computerScore++;
        resetBall();
    }
    if (ballX + ballRadius >= canvas.width) {
        playerScore++;
        resetBall();
    }
}

// Reset ball to center after scoring
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDx = ballSpeed;
    ballDy = ballSpeed;
}

// Update the game
function update() {
    moveBall();
    movePaddles();
    moveComputer();
    draw();
}

// Draw the game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for the new frame
    drawBall();
    drawPaddles();
    drawScore();
}

// Handle user input for keyboard
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
        upPressed = true;
    } else if (event.key === "ArrowDown") {
        downPressed = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") {
        upPressed = false;
    } else if (event.key === "ArrowDown") {
        downPressed = false;
    }
});

// Difficulty Button Event Listeners
document.getElementById("easyButton").addEventListener("click", () => {
    difficulty = 'easy';
    setDifficultyParams();
    startGame();
});
document.getElementById("mediumButton").addEventListener("click", () => {
    difficulty = 'medium';
    setDifficultyParams();
    startGame();
});
document.getElementById("hardButton").addEventListener("click", () => {
    difficulty = 'hard';
    setDifficultyParams();
    startGame();
});

// Start the game loop based on selected difficulty
function startGame() {
    document.querySelector(".difficulty-buttons").style.display = 'none'; // Hide difficulty selection after game starts
    gameLoop(); // Start the game loop
}

// Game loop
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}
