function updateGrid(previous_winners) {
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
    const previous_winners = JSON.parse(localStorage.getItem('previous_winners')) || [];
    if (previous_winners.length >= 100) previous_winners.shift(); // Maintain a maximum of 50 entries
    previous_winners.push(winner);
    localStorage.setItem('previous_winners', JSON.stringify(previous_winners));
    updateGrid(previous_winners);
}

function calculate() {
    const previous_winners = JSON.parse(localStorage.getItem('previous_winners')) || [];
    // if previous_winners is empty, return
    if (previous_winners.length === 0) return; 

    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ previous_winners: previous_winners.slice(-10) }) // Use last 10 entries
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('confidence').innerHTML = `
            <strong>Prediction Probabilities:</strong><br>
            Player: ${(data.Player * 100).toFixed(2)}%<br>
            Banker: ${(data.Banker * 100).toFixed(2)}%<br>
            Tie: ${(data.Tie * 100).toFixed(2)}%
        `;
    });
}

function undo() {
    const previous_winners = JSON.parse(localStorage.getItem('previous_winners')) || [];
    previous_winners.pop();
    localStorage.setItem('previous_winners', JSON.stringify(previous_winners));
    updateGrid(previous_winners);
}

window.onload = function() {
    updateGrid(JSON.parse(localStorage.getItem('previous_winners')) || []);
}

function reset(){
    //run the function on every page load
    localStorage.clear();
    updateGrid(JSON.parse(localStorage.getItem('previous_winners')) || []);
    document.getElementById('confidence').innerHTML = `
    <strong>Prediction Probabilities:</strong><br>
    Player: 0%<br>
    Banker: 0%<br>
    Tie: 0%
    `;
}