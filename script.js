document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.game-board');
    const scoreDisplay = document.getElementById('score');
    const newGameButton = document.getElementById('new-game-button');
    const gridSize = 4;
    let board = [];
    let score = 0;
    let tileElements = [];

    // Initialize board
    function init() {
        board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
        score = 0;
        scoreDisplay.innerText = score;
        gameBoard.innerHTML = '';
        for (let i = 0; i < gridSize * gridSize; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            gameBoard.appendChild(tile);
            tileElements.push(tile);
        }
        addNewTile();
        addNewTile();
        updateBoard();
    }

    // Render the board
    function updateBoard(mergedTiles = []) {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const index = i * gridSize + j;
                const tile = tileElements[index];
                const value = board[i][j];
                tile.innerText = value === 0 ? '' : value;
                tile.setAttribute('data-value', value);

                if (mergedTiles.some(mergedTile => mergedTile.i === i && mergedTile.j === j)) {
                    tile.classList.add('merged');
                } else {
                    tile.classList.remove('merged');
                }
            }
        }
    }

    // Add a new tile (2 or 4)
    function addNewTile() {
        let emptyTiles = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) {
                    emptyTiles.push({ i, j });
                }
            }
        }

        if (emptyTiles.length > 0) {
            const { i, j } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            board[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function checkGameOver() {
        let gameOver = true;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) {
                    gameOver = false;
                }
                if (i < gridSize - 1 && board[i][j] === board[i + 1][j]) {
                    gameOver = false;
                }
                if (j < gridSize - 1 && board[i][j] === board[i][j + 1]) {
                    gameOver = false;
                }
            }
        }

        if (gameOver) {
            alert('Game Over!');
        }
    }

    function move(direction) {
        let moved = false;
        let newBoard = board.map(row => [...row]);
        const mergedTiles = [];

        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < gridSize; j++) {
                const column = Array.from({ length: gridSize }, (_, i) => newBoard[i][j]);
                const { newLine, mergedIndices } = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < gridSize; i++) {
                    if (newBoard[i][j] !== newLine[i]) {
                        moved = true;
                    }
                    newBoard[i][j] = newLine[i];
                }
                for (const index of mergedIndices) {
                    if (direction === 'ArrowUp') {
                        mergedTiles.push({ i: index, j });
                    } else { // ArrowDown
                        mergedTiles.push({ i: gridSize - 1 - index, j });
                    }
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < gridSize; i++) {
                const row = newBoard[i];
                const { newLine, mergedIndices } = transform(row, direction === 'ArrowLeft');
                if (newBoard[i].join(',') !== newLine.join(',')) {
                    moved = true;
                }
                newBoard[i] = newLine;
                for (const index of mergedIndices) {
                    if (direction === 'ArrowLeft') {
                        mergedTiles.push({ i, j: index });
                    } else { // ArrowRight
                        mergedTiles.push({ i, j: gridSize - 1 - index });
                    }
                }
            }
        }

        if (moved) {
            board = newBoard;
            addNewTile();
            updateBoard(mergedTiles);
            checkGameOver();
        }
    }

    function transform(line, moveTowardsStart) {
        let newLine = line.filter(cell => cell !== 0);
        const mergedIndices = [];
        if (!moveTowardsStart) {
            newLine.reverse();
        }

        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                score += newLine[i];
                scoreDisplay.innerText = score;
                newLine.splice(i + 1, 1);
                mergedIndices.push(i);
            }
        }

        while (newLine.length < gridSize) {
            newLine.push(0);
        }

        if (!moveTowardsStart) {
            newLine.reverse();
        }

        return { newLine, mergedIndices };
    }

    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            move(e.key);
        }
    });

    newGameButton.addEventListener('click', init);

    init();
});
