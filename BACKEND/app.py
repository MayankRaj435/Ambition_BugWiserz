import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from routes.main import main_bp
from routes.training import training_bp
from routes.chat import chat_bp

load_dotenv()

app = Flask(__name__)

# CORS Configuration for production
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
CORS(app, origins=cors_origins)

UPLOAD_FOLDER = "uploads"
MODEL_FOLDER = "models"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MODEL_FOLDER"] = MODEL_FOLDER
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tasks.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODEL_FOLDER, exist_ok=True)

db.init_app(app)

from routes.deployment import deployment_bp

app.register_blueprint(main_bp)
app.register_blueprint(training_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(deployment_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)
