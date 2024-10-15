let timerInterval;
let seconds = 0;
const gridElement = document.getElementById('sudoku-grid');
const timerElement = document.getElementById('timer');
let currentBoard = [];
let solutionBoard = [];
let filledCells = 0;
let isPaused = false; // Flag to track if the game is paused

// Difficulty levels
const difficultyLevels = {
    Easy: 50,
    Medium: 40,
    Hard: 30
};

// Generate a new Sudoku puzzle
function generateSudoku(clues) {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(board);
    removeNumbers(board, clues);
    return board;
}

// Fill the Sudoku board
function fillBoard(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) {
                let nums = shuffle([...Array(9).keys()].map(n => n + 1));
                for (let num of nums) {
                    if (isSafe(board, i, j, num)) {
                        board[i][j] = num;
                        if (fillBoard(board)) {
                            return true;
                        }
                        board[i][j] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Remove numbers from the filled Sudoku to create clues
function removeNumbers(board, clues) {
    let count = 81 - clues;
    while (count > 0) {
        let i = Math.floor(Math.random() * 9);
        let j = Math.floor(Math.random() * 9);
        if (board[i][j] !== 0) {
            board[i][j] = 0;
            count--;
        }
    }
}

// Check if a number can be placed safely
function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) {
            return false;
        }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] === num) {
                return false;
            }
        }
    }
    return true;
}

// Shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Render the Sudoku board
function renderBoard(board) {
    gridElement.innerHTML = '';
    board.forEach(row => {
        row.forEach(num => {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'bg-gray-200');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.value = num === 0 ? '' : num;
            input.readOnly = num !== 0; // make clues read-only
            input.addEventListener('input', function () {
                if (input.value < 1 || input.value > 9) {
                    input.value = '';
                }
                checkCompletion();
            });
            cell.appendChild(input);
            gridElement.appendChild(cell);
        });
    });
}

// Start a new game
function startNewGame(difficulty = 'Medium') {
    const clues = difficultyLevels[difficulty];
    currentBoard = generateSudoku(clues);
    solutionBoard = JSON.parse(JSON.stringify(currentBoard));
    fillBoard(solutionBoard); // Create the solution board
    renderBoard(currentBoard);
    resetTimer();
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        timerElement.textContent = `Time: ${formatTime(seconds)}`;
    }, 1000);
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timerElement.textContent = 'Time: 0:00';
    isPaused = false; // Ensure paused state is reset
    startTimer();
}

// Format time for display
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Check for game completion
function checkCompletion() {
    const inputs = gridElement.querySelectorAll('input');
    filledCells = 0;

    inputs.forEach((input, index) => {
        if (input.value === solutionBoard[Math.floor(index / 9)][index % 9].toString()) {
            filledCells++;
        }
    });

    if (filledCells === 81) {
        completeGame();
    }
}

// Show completion popup
function completeGame() {
    clearInterval(timerInterval);
    const score = calculateScore();
    document.getElementById('result-message').textContent = 'You completed the Sudoku!';
    document.getElementById('score-message').textContent = `Your Score: ${score}`;
    document.getElementById('completion-modal').classList.remove('hidden');
}

// Calculate score based on performance
function calculateScore() {
    const timeScore = Math.max(0, 100 - seconds); // Score reduces with time
    return Math.max(0, Math.min(100, timeScore)); // Score capped between 0-100
}

// Provide a hint to the user
function giveHint() {
    let emptyCells = [];
    const inputs = gridElement.querySelectorAll('input');
    
    inputs.forEach((input, index) => {
        if (input.value === '') {
            const row = Math.floor(index / 9);
            const col = index % 9;
            emptyCells.push({ row, col });
        }
    });

    if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        inputs[row * 9 + col].value = solutionBoard[row][col];
    }
}

// Auto-complete remaining cells
function autoComplete() {
    const inputs = gridElement.querySelectorAll('input');
    
    inputs.forEach((input, index) => {
        if (input.value === '') {
            const row = Math.floor(index / 9);
            const col = index % 9;
            input.value = solutionBoard[row][col];
        }
    });
}

// Pause or Resume the timer
function togglePause() {
    if (isPaused) {
        startTimer();
        isPaused = false;
        document.getElementById('pause').textContent = 'Pause';
    } else {
        clearInterval(timerInterval);
        isPaused = true;
        document.getElementById('pause').textContent = 'Resume';
    }
}

// Event Listeners
document.getElementById('easy').addEventListener('click', () => startNewGame('Easy'));
document.getElementById('medium').addEventListener('click', () => startNewGame('Medium'));
document.getElementById('hard').addEventListener('click', () => startNewGame('Hard'));
document.getElementById('new-game').addEventListener('click', () => startNewGame('Medium'));
document.getElementById('pause').addEventListener('click', togglePause);
document.getElementById('hint').addEventListener('click', giveHint);
document.getElementById('autocomplete').addEventListener('click', autoComplete);
document.getElementById('play-again').addEventListener('click', () => {
    document.getElementById('completion-modal').classList.add('hidden');
    startNewGame('Medium');
});

// Start the game on load
window.onload = () => startNewGame('Medium');
