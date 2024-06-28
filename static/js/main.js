let wins = 0;
let losses = 0;
let winStreak = 0;
let lossStreak = 0;
let currentStreak = 0;
let lastwinner = '';
let predictedwinner = '';
let previous_winners = [];
let predictionData = null; // Global variable to store prediction data
check = 0;

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
    if (previous_winners.length >= 100) previous_winners.shift(); // Maintain a maximum of 100 entries
    previous_winners.push(winner);
    updateGrid();
    updateStats();
}

function calculate() {
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
        updateStats(data);
        check = 1;
    });
}

function undo() {
    if (previous_winners.length === 0){
        //re
    }
    previous_winners.pop();
    updateGrid();
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
    if (data.Player > data.Banker && data.Player > data.Tie) {
        return 'Player';
    } else if (data.Banker > data.Player && data.Banker > data.Tie) {
        return 'Banker';
    } else {
        return 'Tie';
    }
}

function updateStats(data = null) {
    if (check == 0){
        return;
    }
    if (data) {
        predictionData = data; // Ensure the latest data is used
    }
    //calulate the win and loss skip the first one
    if (previous_winners.length > 1) {
        if (previous_winners[previous_winners.length - 1] === predictedwinner) {
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
    predictedwinner = getBestPrediction(predictionData);
    if (!predictionData || previous_winners.length === 0) {
        document.getElementById('stats').innerHTML = `
            <strong>Game Stats</strong><br>
            Best Prediction: ${predictedwinner} <br>
            Wins: ${wins}, Losses: ${losses}<br>
            Win Percentage: 0%<br>
            Win Streak: 0<br>
            Loss Streak: 0<br>
            Current Streak: 0<br>
            Explanation: <br>
            Units to Bet: 0
        `;
        check = 0;
        return;
    }
    

    const totalGames = wins + losses;
    const winPercentage = totalGames > 0 ? (wins / totalGames * 100).toFixed(2) : 0;

    document.getElementById('stats').innerHTML = `
        <strong>Game Stats</strong><br>
        Best Prediction: ${predictedwinner} <br>
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
