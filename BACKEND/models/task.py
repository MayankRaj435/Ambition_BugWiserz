from datetime import datetime
from extensions import db

class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    target_column = db.Column(db.String(255))
    status = db.Column(db.String(50), default="pending") # pending, training, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    results = db.Column(db.JSON) # Store results as JSON
    metric = db.Column(db.String(50))
    is_regression = db.Column(db.Boolean)
    error = db.Column(db.Text)

    def to_dict(self):
        return {
            "task_id": self.id,
            "filename": self.filename,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "results": self.results,
            "metric": self.metric,
            "is_regression": self.is_regression,
            "error": self.error
        }
