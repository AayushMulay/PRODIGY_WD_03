// Tic-Tac-Toe Game: PvP & AI (Minimax), clean code, accessible, responsive

const boardElem = document.getElementById('ttt-board');
const statusElem = document.getElementById('ttt-status');
const restartBtn = document.getElementById('ttt-restart');
const modePvpBtn = document.getElementById('mode-pvp');
const modeAiBtn = document.getElementById('mode-ai');

const PLAYER_X = 'X';
const PLAYER_O = 'O';

let board = Array(9).fill('');
let currentPlayer = PLAYER_X;
let gameActive = false;
let mode = null;
let winnerLine = [];

// Winning combinations (indices)
const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
];

// Initialize or reset game state
function initGame(selectedMode) {
    board = Array(9).fill('');
    currentPlayer = PLAYER_X;
    gameActive = true;
    mode = selectedMode;
    winnerLine = [];
    renderBoard();
    updateStatus(`Current turn: ${currentPlayer}`);
    restartBtn.disabled = false;
    modePvpBtn.disabled = mode === 'pvp';
    modeAiBtn.disabled = mode === 'ai';
}

// Render the board UI
function renderBoard() {
    boardElem.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = 'ttt-cell';
        cell.setAttribute('data-idx', i);
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', board[i] ? board[i] : `Cell ${i+1}`);
        cell.disabled = !gameActive || !!board[i] || (mode === 'ai' && currentPlayer === PLAYER_O && gameActive);
        cell.textContent = board[i];
        if (winnerLine && winnerLine.includes(i)) cell.classList.add('ttt-winner');
        if (board[i]) cell.classList.add('ttt-disabled');
        cell.addEventListener('click', onCellClick);
        boardElem.appendChild(cell);
    }
}

// Handle cell click
function onCellClick(e) {
    const idx = +e.target.getAttribute('data-idx');
    if (!gameActive || board[idx]) return;
    board[idx] = currentPlayer;
    renderBoard();
    if (checkWinner()) {
        updateStatus(`Winner: ${currentPlayer}`);
        highlightWinner();
        gameActive = false;
        return;
    }
    if (board.every(cell => cell)) {
        updateStatus('Draw!');
        gameActive = false;
        return;
    }
    currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    updateStatus(`Current turn: ${currentPlayer}`);
    if (mode === 'ai' && currentPlayer === PLAYER_O && gameActive) {
        setTimeout(aiMove, 300);
    }
}

// Update status message
function updateStatus(msg) {
    statusElem.textContent = msg;
}

// Highlight winning cells
function highlightWinner() {
    renderBoard();
}

// Check for winner, set winnerLine if found
function checkWinner() {
    for (const combo of WIN_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            winnerLine = combo;
            return true;
        }
    }
    winnerLine = [];
    return false;
}

// AI Move using Minimax
function aiMove() {
    const best = minimax(board.slice(), PLAYER_O);
    if (typeof best.idx === 'number') {
        board[best.idx] = PLAYER_O;
    }
    renderBoard();
    if (checkWinner()) {
        updateStatus(`Winner: ${PLAYER_O}`);
        highlightWinner();
        gameActive = false;
        return;
    }
    if (board.every(cell => cell)) {
        updateStatus('Draw!');
        gameActive = false;
        return;
    }
    currentPlayer = PLAYER_X;
    updateStatus(`Current turn: ${currentPlayer}`);
}

// Minimax algorithm for Tic-Tac-Toe AI
function minimax(newBoard, player) {
    const availSpots = newBoard.map((v, i) => v ? null : i).filter(i => i !== null);

    if (checkWinFor(newBoard, PLAYER_X)) return {score: -10};
    if (checkWinFor(newBoard, PLAYER_O)) return {score: 10};
    if (availSpots.length === 0) return {score: 0};

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const idx = availSpots[i];
        const move = {idx};
        newBoard[idx] = player;
        if (player === PLAYER_O) {
            const result = minimax(newBoard, PLAYER_X);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, PLAYER_O);
            move.score = result.score;
        }
        newBoard[idx] = '';
        moves.push(move);
    }
    let bestMove;
    if (player === PLAYER_O) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    }
    return bestMove;
}

// Helper for minimax: check win for a given board/player
function checkWinFor(b, player) {
    return WIN_COMBOS.some(([a, bIdx, c]) => b[a] === player && b[bIdx] === player && b[c] === player);
}

// Restart game
restartBtn.addEventListener('click', () => {
    if (mode) initGame(mode);
});

// Mode selection
modePvpBtn.addEventListener('click', () => {
    initGame('pvp');
});
modeAiBtn.addEventListener('click', () => {
    initGame('ai');
});

// Initial UI state
modePvpBtn.disabled = false;
modeAiBtn.disabled = false;
restartBtn.disabled = true;
updateStatus('Select a mode to start');
boardElem.innerHTML = '';