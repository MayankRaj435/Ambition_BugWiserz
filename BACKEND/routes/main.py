import os
import uuid
import pandas as pd
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models.task import Task

main_bp = Blueprint('main', __name__)

@main_bp.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files or request.files["file"].filename == "":
        return jsonify({"error": "No file selected"}), 400
    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported"}), 400

    task_id = str(uuid.uuid4())
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], f"{task_id}.csv")
    file.save(filepath)
    
    # Create task in DB
    new_task = Task(id=task_id, filename=file.filename, filepath=filepath)
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({"status": "success", "task_id": task_id})

@main_bp.route("/preview/<task_id>", methods=["GET"])
def preview_csv(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found. Please upload a file again."}), 404
    filepath = task.filepath
    try:
        df = pd.read_csv(filepath)
        preview_rows = int(request.args.get("preview_rows", 10))
        preview_cols = int(request.args.get("preview_cols", 10))
        target_column = request.args.get("target")

        preview_cols = min(preview_cols, len(df.columns))
        preview_cols_list = df.columns[:preview_cols].tolist()

        if target_column and target_column in df.columns and target_column not in preview_cols_list:
            if len(preview_cols_list) > 0:
                preview_cols_list[-1] = target_column
            else:
                preview_cols_list.append(target_column)

        df_preview = df[preview_cols_list].head(preview_rows)

        return jsonify({
            "headers": df_preview.columns.tolist(),
            "rows": df_preview.astype(str).values.tolist(),
            "all_columns": df.columns.tolist(),
            "target_column": target_column,
            "preview_rows": preview_rows,
            "preview_cols": len(preview_cols_list),
        })
    except Exception as e:
        return jsonify({"error": f"Error reading CSV: {str(e)}"}), 500
