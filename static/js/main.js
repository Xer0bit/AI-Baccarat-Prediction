let wins = 0;
let losses = 0;
let winStreak = 0;
let lossStreak = 0;
let currentStreak = 0;
let lastWinner = '';
let predictedWinner = '';
let previous_winners = [];
let predictionData = null; // Global variable to store prediction data
let Nextwinner = '';

function updateGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < previous_winners.length; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell ' + previous_winners[i];
        cell.innerHTML = previous_winners[i][0];
        grid.appendChild(cell);
    }
}

function addWinner(winner) {
    Nextwinner = winner;
    if (previous_winners.length >= 100) previous_winners.shift(); // Maintain a maximum of 100 entries
    previous_winners.push(winner);
    // console.log(previous_winners);
    updateGrid();
    calculateWinLoss();
    updateStats();
    fetchPrediction(); // Fetch prediction after updating stats
}

function fetchPrediction() {
    if (previous_winners.length === 0) return; // Return if no previous winners

    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ previous_winners: previous_winners.slice(-10) }) // Use last 10 entries
    })
    .then(response => response.json())
    .then(data => {
        predictionData = data; // Store the fetched data in the global variable
        document.getElementById('confidence').innerHTML = `
            <strong>Prediction Probabilities:</strong><br>
            Player: ${(data.Player * 100).toFixed(2)}%<br>
            Banker: ${(data.Banker * 100).toFixed(2)}%<br>
            Tie: ${(data.Tie * 100).toFixed(2)}%
        `;
        predictedWinner = getBestPrediction(data);
        updateStats();
    });
}

function undo() {
    if (previous_winners.length === 0) {
        reset();
        return;
    }
    previous_winners.pop();
    updateGrid();
    calculateWinLoss();
    updateStats();
}

function reset() {
    previous_winners = [];
    updateGrid();
    document.getElementById('confidence').innerHTML = `
        <strong>Prediction Probabilities:</strong><br>
        Player: 0%<br>
        Banker: 0%<br>
        Tie: 0%
    `;
    resetStats();
}

function getBestPrediction(data) {
    if (!data) return 'None';
    if (data.Player > data.Banker && data.Player > data.Tie) return 'Player';
    if (data.Banker > data.Player && data.Banker > data.Tie) return 'Banker';
    if (data.Tie > data.Player && data.Tie > data.Banker) return 'Tie';
}

function calculateWinLoss() {
    // console.log(previous_winners.length);

    if (previous_winners.length > 1) {
        if (Nextwinner === predictedWinner) {
            wins++;
            winStreak++;
            lossStreak = 0;
            currentStreak = winStreak;
        } else {
            losses++;
            lossStreak++;
            winStreak = 0;
            currentStreak = lossStreak;
        }
    }
}

function updateStats() {
    predictedWinner = getBestPrediction(predictionData);

    const totalGames = wins + losses;
    const winPercentage = totalGames > 0 ? (wins / totalGames * 100).toFixed(2) : 0;

    document.getElementById('stats').innerHTML = `
        <strong>Game Stats</strong><br>
        Best Prediction: ${predictedWinner} <br>
        Wins: ${wins}, Losses: ${losses}<br>
        Win Percentage: ${winPercentage}%<br>
        Win Streak: ${winStreak}<br>
        Loss Streak: ${lossStreak}<br>
        Current Streak: ${currentStreak}<br>
        Explanation: <br>
        Units to Bet: ${calculateUnitsToBet(winPercentage)}
    `;
}

function calculateUnitsToBet(winPercentage) {
    // Example calculation, replace with your logic
    return (winPercentage / 10).toFixed(2);
}

function resetStats() {
    wins = 0;
    losses = 0;
    winStreak = 0;
    lossStreak = 0;
    currentStreak = 0;
    updateStats();
}

window.onload = function() {
    updateGrid();
    resetStats();
}
