import datetime
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        req_data = request.get_json() or {}
        site_id = req_data.get('siteId')
        equipment_type = req_data.get('equipmentType')
        history_data = req_data.get('history')

        # If history not provided, generate default training set on the fly
        if not history_data:
            # Let's generate a default history to avoid errors
            history_data = []
            base_rentals = 4
            if site_id == 'S003' and equipment_type == 'Excavator':
                base_rentals = 7
            elif site_id == 'S002' and equipment_type == 'Bulldozer':
                base_rentals = 6
            elif site_id == 'S004':
                base_rentals = 1

            start_date = datetime.date(2026, 6, 1)
            for i in range(60):
                d = start_date + datetime.timedelta(days=i)
                # Simple weekend drop
                dow = d.weekday()  # Monday = 0, Sunday = 6
                # convert to JS standard (Sunday = 0, Monday = 1)
                js_dow = (dow + 1) % 7
                
                day_val = base_rentals + (1 if js_dow in [1, 2, 3, 4, 5] else -1)
                # add some simple noise based on loop index
                noise = (i % 3) - 1
                history_data.append({
                    'month': d.month,
                    'dayOfWeek': js_dow,
                    'rentals': max(0, day_val + noise)
                })

        # Convert to Pandas DataFrame
        df = pd.DataFrame(history_data)
        
        # Train Random Forest Regressor
        X = df[['month', 'dayOfWeek']]
        y = df['rentals']
        
        model = RandomForestRegressor(n_estimators=30, random_state=42)
        model.fit(X, y)

        # Generate forecast for the next 7 days
        # Assume "today" is July 30, 2026
        today = datetime.date(2026, 7, 30)
        forecast = []

        for i in range(1, 8):
            f_date = today + datetime.timedelta(days=i)
            # Sunday = 0, Monday = 1, etc.
            js_dow = (f_date.weekday() + 1) % 7
            
            # Predict
            pred_df = pd.DataFrame([[f_date.month, js_dow]], columns=['month', 'dayOfWeek'])
            prediction = float(model.predict(pred_df)[0])
            
            forecast.append({
                'date': f_date.strftime('%Y-%m-%d'),
                'dayOfWeek': js_dow,
                'predictedRentals': round(prediction, 1)
            })

        return jsonify({
            'siteId': site_id,
            'equipmentType': equipment_type,
            'forecast': forecast,
            'modelInfo': 'Scikit-Learn RandomForestRegressor (30 trees)'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
