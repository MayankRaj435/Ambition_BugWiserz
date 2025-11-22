from flask import Blueprint, request, jsonify, send_from_directory, current_app
from extensions import db
from models.task import Task
from services.training_service import start_training_async

training_bp = Blueprint('training', __name__)

@training_bp.route("/train", methods=["POST"])
def train():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    task_id = data.get("task_id")
    target_column = data.get("target_column")
    selected_models = data.get("models")

    if not task_id:
        return jsonify({"error": "Missing task_id"}), 400
    
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    if not target_column or not selected_models:
        return jsonify({"error": "Missing target column or models"}), 400

    task.target_column = target_column
    db.session.commit()

    start_training_async(task_id, selected_models, current_app._get_current_object())

    return jsonify({"status": "training_started", "task_id": task_id})

@training_bp.route("/results/<task_id>", methods=["GET"])
def results(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    if task.status == "pending":
        return jsonify({"status": "pending"})
    elif task.status == "training":
        return jsonify({"status": "training"})
    elif task.status == "failed":
        return jsonify({"status": "failed", "error": task.error})
    
    return jsonify({
        "status": "completed",
        "results": task.results,
        "metric": task.metric,
        "task_id": task_id,
        "is_regression": task.is_regression
    })

@training_bp.route("/download/<path:filename>", methods=["GET"])
def download_model(filename):
    return send_from_directory(current_app.config["MODEL_FOLDER"], filename, as_attachment=True)

@training_bp.route("/export/<task_id>", methods=["GET"])
def export_code(task_id):
    from services.code_generator import generate_training_script
    from flask import Response
    
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
        
    script_content = generate_training_script(task)
    
    return Response(
        script_content,
        mimetype="text/x-python",
        headers={"Content-disposition": f"attachment; filename=train_{task_id}.py"}
    )
