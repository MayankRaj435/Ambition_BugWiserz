from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models.task import Task
import joblib
import os
import pandas as pd
import numpy as np

deployment_bp = Blueprint('deployment', __name__)

# In-memory store for active deployments (for demo purposes)
# In a real app, this would be a database table or a separate service (K8s, etc.)
deployments = {} 

@deployment_bp.route('/deploy/<task_id>', methods=['POST'])
def deploy_model(task_id):
    task = Task.query.get(task_id)
    if not task or task.status != 'completed':
        return jsonify({"error": "Task not found or not completed"}), 404

    # Get the best model (first in results list as it is sorted)
    if not task.results:
        return jsonify({"error": "No models trained"}), 400
    
    best_model = task.results[0]
    model_filename = best_model['download_path']
    model_path = os.path.join(current_app.config['MODEL_FOLDER'], model_filename)
    
    if not os.path.exists(model_path):
        return jsonify({"error": "Model file not found"}), 500

    # "Deploy" - just register it
    deployment_id = f"dep_{task_id}"
    deployments[deployment_id] = {
        "task_id": task_id,
        "model_name": best_model['name'],
        "model_path": model_path,
        "is_regression": task.is_regression
    }

    return jsonify({
        "deployment_id": deployment_id,
        "status": "active",
        "endpoint": f"/predict/{deployment_id}",
        "model_name": best_model['name']
    })

@deployment_bp.route('/predict/<deployment_id>', methods=['POST'])
def predict(deployment_id):
    if deployment_id not in deployments:
        return jsonify({"error": "Deployment not found"}), 404
    
    deployment = deployments[deployment_id]
    
    try:
        # Load model (lazy loading could be better, but this is fine for demo)
        model = joblib.load(deployment['model_path'])
        
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        # Expecting input as a list of dicts or list of lists
        # For simplicity, let's assume it matches the training schema
        # In a real app, we'd validate against a schema
        
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            return jsonify({"error": "Invalid input format"}), 400
            
        prediction = model.predict(df)
        
        # Convert to list for JSON serialization
        result = prediction.tolist()
        
        return jsonify({
            "deployment_id": deployment_id,
            "predictions": result
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
