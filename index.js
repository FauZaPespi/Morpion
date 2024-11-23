/**
 * Sélectionne tous les éléments avec la classe 'square'.
 */
const squares = document.querySelectorAll('.square');
/**
 * Sélectionne le bouton de réinitialisation.
 */
const resetButton = document.getElementById('reset');
/**
 * Sélectionne l'élément affichant le score du joueur 1.
 */
const scoreP1 = document.getElementById('scoreP1');
/**
 * Sélectionne l'élément affichant le score du joueur 2.
 */
const scoreP2 = document.getElementById('scoreP2');

/**
 * Sélectionne les éléments représentant les caractères des joueurs.
 */
const p1Char = document.getElementById('p1Char');
const p2Char = document.getElementById('p2Char');
const paramBtn = document.querySelector(".saveChange");

/**
 * Caractères par défaut pour les joueurs.
 */
let player1Char = '🦽';
let player2Char = '🚑';
let currentPlayer = player1Char;
let gameState = Array(9).fill(null);
let scores = { p1: 0, p2: 0 };

/**
 * Initialise les caractères des joueurs sur l'interface.
 */
p1Char.textContent = player1Char;
p2Char.textContent = player2Char;

/**
 * Initialise les caractères des joueurs en fonction des entrées de l'utilisateur.
 * Réinitialise également l'état du jeu.
 */
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

/**
 * Écouteur d'événement pour le bouton de paramètres afin d'initialiser les caractères des joueurs.
 */
paramBtn.addEventListener("click", () => {
    initializePlayerCharacters();
});

/**
 * Conditions de victoire possibles pour le jeu.
 */
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // "-"
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // "|"
    [0, 4, 8], [2, 4, 6], // "\" "/"
];

/**
 * Gestion des événements sur chaque case du jeu.
 * Permet à un joueur de jouer son tour et vérifie les conditions de victoire ou match nul.
 */
squares.forEach((square, index) => {
    square.addEventListener('click', () => {
        if (gameState[index] || checkWinner() || currentPlayer === player2Char) return;

        // Le joueur effectue son coup
        gameState[index] = currentPlayer;
        square.textContent = currentPlayer;

        if (checkWinner()) {
            showPopup("Fin de partie !", `Joueur ${currentPlayer} a gagné !`);
            scores[currentPlayer === player1Char ? 'p1' : 'p2']++;
            updateScores();
        } else if (gameState.every(cell => cell)) {
            showPopup("Fin de partie !", "Match nul !");
        } else {
            currentPlayer = player2Char; // Passer au joueur 2 (IA)
            aiMove(); // L'IA effectue son coup juste après le joueur
        }
    });
});

/**
 * Vérifie si un joueur a gagné.
 * 
 * @return {boolean} - Retourne true si un joueur a gagné.
 */
function checkWinner() {
    return winConditions.some(condition =>
        condition.every(index => gameState[index] === currentPlayer)
    );
}

/**
 * Met à jour les scores affichés.
 */
function updateScores() {
    scoreP1.textContent = scores.p1;
    scoreP2.textContent = scores.p2;
}

/**
 * Affiche une fenêtre pop-up avec un message de fin de partie.
 * 
 * @param {string} title - Titre de la pop-up.
 * @param {string} content - Contenu de la pop-up.
 */
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

/**
 * Évalue l'état du plateau de jeu, en tenant compte des opportunités de victoire et de blocage.
 * 
 * @param {Array} board - L'état actuel du plateau de jeu.
 * @return {number} - Le score évalué pour l'IA.
 */
function evaluateBoard(board) {
    let score = 0;

    // Vérifie si l'IA peut gagner ou bloquer un coup gagnant
    for (let condition of winConditions) {
        const values = condition.map(index => board[index]);

        if (values.filter(value => value === player2Char).length === 2 && values.filter(value => value === null).length === 1) {
            score += 10; // L'IA peut gagner, on priorise cela
        }
        if (values.filter(value => value === player1Char).length === 2 && values.filter(value => value === null).length === 1) {
            score -= 10; // L'adversaire peut gagner, il faut bloquer ce coup
        }
    }

    // Vérifie les menaces multiples
    if (detectMultipleThreats(board, player1Char)) {
        score -= 50;  // Pénalité élevée si l'adversaire peut créer deux menaces
    }

    return score;
}

/**
 * Détecte les menaces multiples sur le plateau de jeu, c'est-à-dire si l'adversaire peut gagner de deux manières différentes.
 * 
 * @param {Array} board - L'état actuel du plateau de jeu.
 * @param {string} opponentChar - Le caractère de l'adversaire.
 * @return {boolean} - Retourne true s'il y a deux ou plus de menaces simultanées.
 */
function detectMultipleThreats(board, opponentChar) {
    let threatCount = 0;

    // Vérifie chaque condition de victoire si l'adversaire peut créer une menace
    for (let condition of winConditions) {
        const values = condition.map(index => board[index]);
        if (values.filter(value => value === opponentChar).length === 2 && values.filter(value => value === null).length === 1) {
            threatCount++;
        }
    }

    return threatCount >= 2;  // Si l'adversaire peut créer deux menaces, retourne true
}

/**
 * Récupère les mouvements disponibles (cases vides).
 * 
 * @param {Array} board - L'état actuel du plateau de jeu.
 * @return {Array} - Un tableau contenant les indices des cases vides.
 */
function getAvailableMoves(board) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            moves.push(i);
        }
    }
    return moves;
}

/**
 * Permet à l'IA de jouer son coup en évaluant le meilleur mouvement possible.
 */
function aiMove() {
    let bestMove = -1;
    let bestScore = -Infinity;
    const availableMoves = getAvailableMoves(gameState);

    // D'abord, vérifier si l'IA peut gagner immédiatement
    for (let move of availableMoves) {
        gameState[move] = player2Char; // Coup de l'IA
        if (checkWinner()) {
            gameState[move] = null;
            bestMove = move; // L'IA gagnera ici
            break;
        }
        gameState[move] = null;
    }

    // Si aucune victoire immédiate, procéder à l'évaluation minimax
    if (bestMove === -1) {
        for (let move of availableMoves) {
            gameState[move] = player2Char; // Coup de l'IA
            let score = evaluateBoard(gameState); // Utiliser notre nouvelle évaluation
            gameState[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    gameState[bestMove] = player2Char;
    squares[bestMove].textContent = player2Char;

    if (checkWinner()) {
        showPopup("Fin de partie !", `Joueur ${player2Char} a gagné !`);
        scores.p2++;
        updateScores();
    } else if (gameState.every(cell => cell)) {
        showPopup("Fin de partie !", "Match nul !");
    } else {
        currentPlayer = player1Char; // Repasser au joueur 1
    }
}
