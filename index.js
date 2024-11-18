const squares = document.querySelectorAll('.square');
const resetButton = document.getElementById('reset');
const scoreP1 = document.getElementById('scoreP1');
const scoreP2 = document.getElementById('scoreP2');

const p1Char = document.getElementById('p1Char');
const p2Char = document.getElementById('p2Char');
const paramBtn = document.querySelector(".saveChange");

let player1Char = '🦽';
let player2Char = '🚑';
let currentPlayer = player1Char;
let gameState = Array(9).fill(null);
let scores = { p1: 0, p2: 0 };

p1Char.textContent = player1Char;
p2Char.textContent = player2Char;


function initializePlayerCharacters() {
    const player1CharInput = document.getElementById('player1Char').value.trim();
    const player2CharInput = document.getElementById('player2Char').value.trim();

    player1Char = player1CharInput || '🦽';
    player2Char = player2CharInput || '🚑';

    p1Char.textContent = player1Char;
    p2Char.textContent = player2Char;

    gameState = Array(9).fill(null);
    squares.forEach(square => square.textContent = '');
    currentPlayer = player1Char;
}

paramBtn.addEventListener("click", () => {
    initializePlayerCharacters();
})

// Condition pour gagner
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // "-"
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // "|"
    [0, 4, 8], [2, 4, 6], // "\" "/"
];

squares.forEach((square, index) => {
    square.addEventListener('click', () => {
        if (gameState[index] || checkWinner()) return;

        gameState[index] = currentPlayer;
        square.textContent = currentPlayer;

        if (checkWinner()) {
            showPopup("Fin de partie !", `Joueur ${currentPlayer} a gagné !`);
            scores[currentPlayer === player1Char ? 'p1' : 'p2']++;
            updateScores();
        } else if (gameState.every(cell => cell)) {
            showPopup("Fin de partie !", "Match nul !");
        } else {
            currentPlayer = currentPlayer === player1Char ? player2Char : player1Char;
        }
    });
});

function checkWinner() {
    return winConditions.some(condition =>
        condition.every(index => gameState[index] === currentPlayer)
    );
}

function updateScores() {
    scoreP1.textContent = scores.p1;
    scoreP2.textContent = scores.p2;
}

// Aide de chat gpt pour le bouton de fermeture et le blur
function showPopup(title, content) {
    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');
    document.body.appendChild(backdrop);

    const popup = document.createElement('div');
    popup.classList.add('popup');

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;

    const contentElement = document.createElement('p');
    contentElement.textContent = content;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.classList.add('close-button');

    const restartButton = document.createElement('button');
    restartButton.id = 'reset';
    restartButton.textContent = 'Recommencer';

    closeButton.onclick = function () {
        popup.classList.add('closing');
        backdrop.classList.add('closing');
        setTimeout(() => {
            document.body.removeChild(popup);
            document.body.removeChild(backdrop);
        }, 300);
    };

    restartButton.addEventListener('click', () => {
        gameState.fill(null);
        squares.forEach(square => (square.textContent = ''));
        currentPlayer = player1Char;
        document.body.removeChild(popup);
        document.body.removeChild(backdrop);
    });

    popup.appendChild(closeButton);
    popup.appendChild(titleElement);
    popup.appendChild(contentElement);
    popup.appendChild(restartButton);

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('visible');
        backdrop.classList.add('visible');
    }, 10);
}
