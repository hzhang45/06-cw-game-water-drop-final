// Variables to control game state
let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 30;
let dropCount = 0;
let currentDifficulty = "normal";

const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const targetDisplay = document.getElementById("target");
const gameContainer = document.getElementById("game-container");
const gameMessage = document.getElementById("game-message");
const confettiLayer = document.getElementById("confetti-layer");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const difficultySettings = {
  easy: {
    time: 45,
    target: 15,
    spawnRate: 1000,
    badDropChance: 0.12,
    bonusDropChance: 0.08,
    label: "Easy"
  },
  normal: {
    time: 30,
    target: 20,
    spawnRate: 800,
    badDropChance: 0.2,
    bonusDropChance: 0.12,
    label: "Normal"
  },
  hard: {
    time: 22,
    target: 25,
    spawnRate: 650,
    fallSpeed: 0.9,
    badDropChance: 0.2,
    bonusDropChance: 0.12,
    label: "Hard"
  }
};

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => selectDifficulty(button.dataset.difficulty));
});

function selectDifficulty(difficulty) {
  currentDifficulty = difficulty;
  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === difficulty);
  });

  const settings = difficultySettings[currentDifficulty];
  timeLeft = settings.time;
  timeDisplay.textContent = timeLeft;
  targetDisplay.textContent = settings.target;
  gameMessage.textContent = `${settings.label} mode selected.`;

  if (!gameRunning) {
    resetGame(false);
  }
}

function startGame() {
  if (gameRunning) return;

  const settings = difficultySettings[currentDifficulty];
  score = 0;
  timeLeft = settings.time;
  dropCount = 0;
  gameRunning = true;
  gameMessage.textContent = `Good luck in ${settings.label} mode!`;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  targetDisplay.textContent = settings.target;
  startButton.disabled = true;
  startButton.textContent = "Game in Progress";

  clearDrops();
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  dropMaker = setInterval(createDrop, settings.spawnRate);
  timerInterval = setInterval(updateTimer, 1000);
  createDrop();
}

function resetGame(shouldClearMessage = true) {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearDrops();

  const settings = difficultySettings[currentDifficulty];
  score = 0;
  timeLeft = settings.time;
  dropCount = 0;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  targetDisplay.textContent = settings.target;
  if (shouldClearMessage) {
    gameMessage.textContent = "";
  }
  startButton.disabled = false;
  startButton.textContent = "Start Game";
}

function createDrop() {
  if (!gameRunning) return;

  dropCount += 1;
  const settings = difficultySettings[currentDifficulty];
  const roll = Math.random();
  let dropClass = "";
  let pointsValue = 1;

  if (roll < settings.bonusDropChance) {
    dropClass = "bonus-drop";
    pointsValue = 2;
  } else if (roll < settings.badDropChance + settings.bonusDropChance) {
    dropClass = "bad-drop";
    pointsValue = -1;
  }

  const drop = document.createElement("div");
  drop.className = `water-drop ${dropClass}`.trim();
  drop.dataset.points = String(pointsValue);

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * Math.max(0, gameWidth - size);
  drop.style.left = `${xPosition}px`;
  drop.style.top = "-20px";
  const fallDuration = settings.fallSpeed
    ? `${(4 / settings.fallSpeed) + Math.random() * 0.3}s`
    : `${4 + Math.random() * 0.7}s`;
  drop.style.animationDuration = fallDuration;

  drop.addEventListener("click", () => collectDrop(drop));
  gameContainer.appendChild(drop);

  drop.addEventListener("animationend", () => {
    if (drop.isConnected) {
      drop.remove();
    }
  });
}

function collectDrop(drop) {
  if (!gameRunning) return;

  const pointsValue = Number(drop.dataset.points || 1);
  drop.remove();
  score = Math.max(0, score + pointsValue);
  scoreDisplay.textContent = score;

  if (pointsValue > 1) {
    gameMessage.textContent = "Bonus drop! Your impact just got bigger.";
  }
}

function updateTimer() {
  if (!gameRunning) return;

  timeLeft -= 1;
  timeDisplay.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearDrops();

  startButton.disabled = false;
  startButton.textContent = "Play Again";
  showEndMessage();
}

function clearDrops() {
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
}

function launchConfetti() {
  confettiLayer.innerHTML = "";

  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = ["#ffc907", "#2e9df7", "#4fcb53", "#f16061", "#ff902a"][Math.floor(Math.random() * 5)];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    piece.style.setProperty("--drift", `${Math.random() * 200 - 100}px`);
    piece.style.setProperty("--rotation", `${Math.random() * 360}deg`);
    confettiLayer.appendChild(piece);
  }

  setTimeout(() => {
    confettiLayer.innerHTML = "";
  }, 1800);
}

function showEndMessage() {
  const settings = difficultySettings[currentDifficulty];
  const target = settings.target;

  if (score >= target) {
    launchConfetti();
  }

  const winningMessages = [
    "Amazing work! You saved the day with a splash of kindness.",
    "Fantastic catch! Your compassion is making waves.",
    "You nailed it! Every drop counted.",
    "Incredible focus! You collected a heroic amount of water."
  ];

  const losingMessages = [
    "Nice effort! Keep practicing and try again.",
    "The drops are still falling—give it another try.",
    "Almost there! A few more catches and you'll win.",
    "You’re getting closer—try another round."
  ];

  const isWin = score >= target;
  const messages = isWin ? winningMessages : losingMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  gameMessage.textContent = `${randomMessage} Final score: ${score}.`;
  gameMessage.classList.toggle("win-message", isWin);
  gameMessage.classList.toggle("lose-message", !isWin);
}

