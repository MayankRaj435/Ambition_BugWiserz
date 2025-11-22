import os
import joblib
import pandas as pd
import numpy as np
import threading
from extensions import db
from models.task import Task
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    GradientBoostingClassifier, GradientBoostingRegressor,
)
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score, r2_score, precision_score, recall_score,
    f1_score, log_loss, mean_squared_error
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC, SVR, LinearSVC, LinearSVR
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

def train_task(task_id, selected_models, app):
    with app.app_context():
        task = Task.query.get(task_id)
        if not task:
            return
        
        task.status = "training"
        db.session.commit()
        
        try:
            filepath = task.filepath
            target_column = task.target_column
            
            df = pd.read_csv(filepath)
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found")

            y = df[target_column]
            X = df.drop(columns=[target_column])

            numeric_features = X.select_dtypes(include=np.number).columns.tolist()
            categorical_features = X.select_dtypes(exclude=np.number).columns.tolist()

            numeric_transformer = Pipeline(steps=[
                ('imputer', SimpleImputer(strategy='median')),
                ('scaler', StandardScaler())])

            categorical_transformer = Pipeline(steps=[
                ('imputer', SimpleImputer(strategy='most_frequent')),
                ('onehot', OneHotEncoder(handle_unknown='ignore'))])

            preprocessor = ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, numeric_features),
                    ('cat', categorical_transformer, categorical_features)])

            is_regression = pd.api.types.is_numeric_dtype(y) and y.nunique() > 20
            if not is_regression:
                label_encoder = LabelEncoder()
                y = label_encoder.fit_transform(y.astype(str))

            if is_regression:
                metric_name = "R² Score"
                AVAILABLE_MODELS = {
                    "Linear Regression": LinearRegression(),
                    "Random Forest Regressor": RandomForestRegressor(n_estimators=100, random_state=42),
                    "Support Vector Regressor": SVR(),
                    "Linear Support Vector Regressor": LinearSVR(max_iter=5000, random_state=42, dual='auto'),
                    "Decision Tree Regressor": DecisionTreeRegressor(random_state=42),
                    "Gradient Boosting Regressor": GradientBoostingRegressor(random_state=42),
                    "K-Nearest Neighbors Regressor": KNeighborsRegressor(),
                    "MLP Regressor": MLPRegressor(max_iter=1000, random_state=42),
                }
            else:
                metric_name = "Accuracy"
                AVAILABLE_MODELS = {
                    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
                    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
                    "Support Vector Machine": SVC(kernel="rbf", probability=True, random_state=42),
                    "Linear Support Vector Machine": LinearSVC(max_iter=5000, random_state=42, dual='auto'),
                    "Decision Tree Classifier": DecisionTreeClassifier(random_state=42),
                    "Gradient Boosting Classifier": GradientBoostingClassifier(random_state=42),
                    "K-Nearest Neighbors": KNeighborsClassifier(),
                    "MLP Classifier": MLPClassifier(max_iter=1000, random_state=42),
                }

            # AutoML Logic: If 'auto' is selected, use all available models
            if "auto" in selected_models or (len(selected_models) == 1 and selected_models[0] == "auto"):
                valid_models = list(AVAILABLE_MODELS.keys())
            else:
                valid_models = [m for m in selected_models if m in AVAILABLE_MODELS]
            
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            results = []
            for model_name in valid_models:
                model_instance = AVAILABLE_MODELS[model_name]
                model_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                                 ('classifier' if not is_regression else 'regressor', model_instance)])

                try:
                    model_pipeline.fit(X_train, y_train)
                    y_pred = model_pipeline.predict(X_test)

                    # XAI: Calculate Feature Importance
                    feature_importance = {}
                    try:
                        # Get feature names from preprocessor
                        feature_names = []
                        if hasattr(preprocessor, 'get_feature_names_out'):
                            feature_names = preprocessor.get_feature_names_out()
                        else:
                            # Fallback for older sklearn or if not supported
                            feature_names = numeric_features + categorical_features # Approximation

                        # Get importance values
                        importances = None
                        if hasattr(model_instance, 'feature_importances_'):
                            importances = model_instance.feature_importances_
                        elif hasattr(model_instance, 'coef_'):
                            importances = np.abs(model_instance.coef_)
                            if importances.ndim > 1:
                                importances = np.mean(importances, axis=0) # Average for multiclass
                        
                        if importances is not None and len(feature_names) == len(importances):
                            # Sort by importance
                            indices = np.argsort(importances)[::-1]
                            top_n = 10
                            for i in range(min(top_n, len(indices))):
                                idx = indices[i]
                                # Clean up feature name (remove 'num__' or 'cat__')
                                clean_name = feature_names[idx].replace('num__', '').replace('cat__', '')
                                feature_importance[clean_name] = float(importances[idx])
                    except Exception as e:
                        print(f"XAI Error for {model_name}: {e}")
                        pass

                    if is_regression:
                        score = r2_score(y_test, y_pred)
                        mse = mean_squared_error(y_test, y_pred)
                        rmse = np.sqrt(mse)
                        results.append({
                            "name": model_name, "score": float(score), "r2": float(score),
                            "mse": float(mse), "rmse": float(rmse), "loss": float(mse),
                            "download_path": f"{task_id}_{model_name.replace(' ', '_')}.pkl",
                            "feature_importance": feature_importance
                        })
                    else:
                        score = accuracy_score(y_test, y_pred)
                        loss = 1 - score
                        if hasattr(model_pipeline, 'predict_proba'):
                            try:
                                y_pred_proba = model_pipeline.predict_proba(X_test)
                                loss = log_loss(y_test, y_pred_proba)
                            except Exception:
                                pass

                        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
                        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
                        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

                        results.append({
                            "name": model_name, "score": float(score), "accuracy": float(score),
                            "precision": float(precision), "recall": float(recall), "f1": float(f1),
                            "loss": float(loss),
                            "download_path": f"{task_id}_{model_name.replace(' ', '_')}.pkl",
                            "feature_importance": feature_importance
                        })

                    model_filename = f"{task_id}_{model_name.replace(' ', '_')}.pkl"
                    joblib.dump(model_pipeline, os.path.join(app.config["MODEL_FOLDER"], model_filename))

                except Exception as e:
                    print(f"Error training model {model_name}: {e}")
                    results.append({
                        "name": model_name, "score": "ERROR", "error": str(e),
                        "download_path": None,
                        "feature_importance": {}
                    })

            results.sort(key=lambda x: float(x.get("score", -1)) if x.get("score") != "ERROR" else -1, reverse=True)

            task.results = results
            task.metric = metric_name
            task.is_regression = is_regression
            task.status = "completed"
            
        except Exception as e:
            task.error = str(e)
            task.status = "failed"
        
        db.session.commit()

def start_training_async(task_id, selected_models, app):
    thread = threading.Thread(target=train_task, args=(task_id, selected_models, app))
    thread.start()
