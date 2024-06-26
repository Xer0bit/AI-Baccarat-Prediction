from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = joblib.load('baccarat_model.pkl')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    previous_winners = request.json['previous_winners']
    
    # Ensure previous_winners has at least 10 entries by padding with 'Banker'
    while len(previous_winners) < 10:
        previous_winners.insert(0, 'Banker')
    
    # Convert user input into features
    features = [1 if winner == 'Player' else 0 if winner == 'Banker' else 2 for winner in previous_winners[-10:]]

    # Convert to DataFrame
    new_data = pd.DataFrame([features], columns=[f'previous_winner_{i+1}' for i in range(10)])

    # Predict probabilities
    prediction_probabilities = model.predict_proba(new_data)[0]
    winner_probabilities = {
        'Player': prediction_probabilities[1],
        'Banker': prediction_probabilities[0],
        'Tie': prediction_probabilities[2]
    }

    return jsonify(winner_probabilities)

if __name__ == '__main__':
    app.run(debug=True)
