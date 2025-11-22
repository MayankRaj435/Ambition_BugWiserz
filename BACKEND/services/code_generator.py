import os
from jinja2 import Template

TRAINING_TEMPLATE = """
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error, classification_report

# 1. Load Data
filepath = "{{ filepath }}"
target_column = "{{ target_column }}"
print(f"Loading data from {filepath}...")
df = pd.read_csv(filepath)

# 2. Preprocessing
print("Preprocessing data...")
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

# Handle target encoding if classification
is_regression = {{ is_regression }}
if not is_regression and y.dtype == 'object':
    le = LabelEncoder()
    y = le.fit_transform(y)

# 3. Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Model Definition
print("Training {{ model_name }}...")
{% if model_name == 'Random Forest' %}
model = RandomForestClassifier(n_estimators=100, random_state=42)
{% elif model_name == 'Random Forest Regressor' %}
model = RandomForestRegressor(n_estimators=100, random_state=42)
{% elif model_name == 'Logistic Regression' %}
model = LogisticRegression(max_iter=1000, random_state=42)
{% elif model_name == 'Linear Regression' %}
model = LinearRegression()
{% else %}
# Fallback to Random Forest
model = RandomForestClassifier(n_estimators=100, random_state=42)
{% endif %}

pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                           ('model', model)])

# 5. Train
pipeline.fit(X_train, y_train)

# 6. Evaluate
print("Evaluating...")
y_pred = pipeline.predict(X_test)

if is_regression:
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    print(f"R2 Score: {r2:.4f}")
    print(f"MSE: {mse:.4f}")
else:
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

print("Done!")
"""

def generate_training_script(task):
    """
    Generates a Python script for the given task.
    """
    template = Template(TRAINING_TEMPLATE)
    
    # Determine best model from results
    best_model_name = "Random Forest"
    if task.results and len(task.results) > 0:
        best_model_name = task.results[0]['name']
        
    script = template.render(
        filepath=task.filename, # Use filename as placeholder
        target_column=task.target_column,
        is_regression=task.is_regression,
        model_name=best_model_name
    )
    
    return script
