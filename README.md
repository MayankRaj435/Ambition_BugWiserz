# 🚀 Ambition ML Platform

<div align="center">

![ML Platform](https://img.shields.io/badge/ML-Platform-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Flask](https://img.shields.io/badge/Flask-3.0-green?style=for-the-badge&logo=flask)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A state-of-the-art machine learning platform with AutoML, Explainable AI, and One-Click Deployment**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🤖 **AutoML - Intelligent Model Selection**
Automatically trains and compares multiple ML models to find the best performer for your dataset. No manual model selection needed!

### 🔍 **Explainable AI (XAI)**
Understand what drives your model's predictions with interactive feature importance visualizations powered by SHAP values.

### 📦 **Code Export**
Download ready-to-run Python scripts to reproduce your training pipeline locally. Perfect for production deployment!

### 🚀 **One-Click Deployment**
Deploy your trained models as REST API endpoints instantly. Test predictions directly from the UI.

### 🎨 **Modern UI with Animations**
Beautiful, responsive interface with smooth Framer Motion animations and a sleek dark theme.

### 📊 **Interactive Analytics**
Real-time charts and metrics visualization using Recharts for comprehensive model evaluation.

---

## 🎯 Demo

### Upload & Train
```
1. Upload your CSV dataset
2. Select target column
3. Choose models (or use AutoML)
4. Click "Train" and watch the magic happen!
```

### View Results
- **Performance Metrics**: Accuracy, Precision, Recall, F1-Score
- **Feature Importance**: See which features matter most
- **Model Comparison**: Side-by-side performance analysis

### Deploy & Predict
- **One-Click Deploy**: Get a REST API endpoint instantly
- **Test Predictions**: Try your model directly from the UI
- **Download Models**: Export trained models for local use

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Charts**: Recharts
- **UI Components**: Radix UI + shadcn/ui
- **Authentication**: Clerk

### Backend
- **Framework**: Flask 3.0
- **Language**: Python 3.9+
- **ML Libraries**: scikit-learn, XGBoost
- **Database**: SQLite (Flask-SQLAlchemy)
- **Async Processing**: Threading (concurrent.futures)

### ML Models Supported
- Linear Regression
- Logistic Regression
- Random Forest (Classifier & Regressor)
- XGBoost (Classifier & Regressor)
- Support Vector Machines (SVM)
- K-Nearest Neighbors (KNN)

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### Clone the Repository
```bash
git clone https://github.com/MayankRaj435/Ambition_BugWiserz.git
cd Ambition_BugWiserz
```

### Backend Setup
```bash
cd BACKEND

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup
```bash
cd FRONTEND

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🚀 Usage

### 1. **Upload Dataset**
- Navigate to the home page
- Click "Upload CSV" and select your dataset
- Preview your data in the interactive table

### 2. **Configure Training**
- Select your target column
- Choose specific models or use AutoML
- Adjust training parameters (optional)

### 3. **Train Models**
- Click "Train Model"
- Watch real-time progress
- View results when training completes

### 4. **Analyze Results**
- Compare model performance metrics
- Explore feature importance charts
- Download trained models

### 5. **Deploy & Predict**
- Click "Deploy Model" on the results page
- Get your REST API endpoint
- Test predictions with sample data

---

## 🎨 Screenshots

### Home Page
Beautiful landing page with smooth animations and intuitive upload interface.

### Results Dashboard
Comprehensive analytics with interactive charts and model comparison.

### Deployment Interface
One-click deployment with instant API endpoint generation.

---

## 🔌 API Endpoints

### Upload Dataset
```http
POST /upload
Content-Type: multipart/form-data

Response: { "task_id": "uuid", "filename": "data.csv" }
```

### Train Models
```http
POST /train
Content-Type: application/json

{
  "task_id": "uuid",
  "target_column": "price",
  "models": ["auto"]  // or specific models
}

Response: { "task_id": "uuid", "status": "training" }
```

### Get Results
```http
GET /results/{task_id}

Response: {
  "status": "completed",
  "results": [...],
  "metric": "R² Score"
}
```

### Deploy Model
```http
POST /deploy/{task_id}

Response: {
  "deployment_id": "dep_uuid",
  "endpoint": "/predict/dep_uuid",
  "model_name": "Random Forest"
}
```

### Make Predictions
```http
POST /predict/{deployment_id}
Content-Type: application/json

[{"feature1": 10, "feature2": 5.5}]

Response: { "predictions": [1, 0] }
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team BugWiserz

Built with ❤️ by Team BugWiserz

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Flask](https://flask.palletsprojects.com/) - Python Web Framework
- [scikit-learn](https://scikit-learn.org/) - Machine Learning Library
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [shadcn/ui](https://ui.shadcn.com/) - UI Components

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with 🚀 by Team BugWiserz

</div>
