import requests
import time
import os
import json

BASE_URL = "http://localhost:5000"

def create_sample_csv():
    content = "id,x1,x2,target\n1,0.5,0.2,0\n2,0.1,0.8,1\n3,0.6,0.3,0\n4,0.2,0.9,1\n"
    with open("sample_test.csv", "w") as f:
        f.write(content)
    return "sample_test.csv"

def test_flow():
    print("Creating sample CSV...")
    filename = create_sample_csv()
    
    print("Uploading file...")
    with open(filename, "rb") as f:
        files = {"file": f}
        res = requests.post(f"{BASE_URL}/upload", files=files)
    
    if res.status_code != 200:
        print("Upload failed:", res.text)
        return
    
    task_id = res.json()["task_id"]
    print(f"Upload success. Task ID: {task_id}")
    
    print("Starting training with AutoML...")
    payload = {
        "task_id": task_id,
        "target_column": "target",
        "models": ["auto"] # Test AutoML
    }
    res = requests.post(f"{BASE_URL}/train", json=payload)
    
    if res.status_code != 200:
        print("Train failed:", res.text)
        return
    
    print("Training started. Polling for results...")
    
    results_data = None
    for _ in range(15):
        res = requests.get(f"{BASE_URL}/results/{task_id}")
        data = res.json()
        status = data.get("status")
        print(f"Status: {status}")
        
        if status == "completed":
            print("Training completed!")
            results_data = data
            break
        elif status == "failed":
            print("Training failed:", data.get("error"))
            break
        
        time.sleep(1)
    else:
        print("Timeout waiting for results.")
        return

    # Verify XAI
    print("\nVerifying XAI (Feature Importance)...")
    if results_data["results"] and "feature_importance" in results_data["results"][0]:
        print("XAI Data Found:", results_data["results"][0]["feature_importance"])
    else:
        print("WARNING: XAI Data NOT Found in results.")

    # Verify Code Export
    print("\nVerifying Code Export...")
    res = requests.get(f"{BASE_URL}/export/{task_id}")
    if res.status_code == 200:
        print("Code Export Success. Script length:", len(res.text))
        # print(res.text[:100])
    else:
        print("Code Export Failed:", res.text)

    # Verify Deployment
    print("\nVerifying Deployment...")
    res = requests.post(f"{BASE_URL}/deploy/{task_id}")
    if res.status_code == 200:
        deploy_data = res.json()
        deployment_id = deploy_data["deployment_id"]
        endpoint = deploy_data["endpoint"]
        print(f"Deployment Success. Endpoint: {endpoint}")
        
        # Verify Prediction
        print("Verifying Prediction...")
        predict_url = f"{BASE_URL}{endpoint}"
        # Input matching sample CSV schema (minus target)
        input_data = [{"id": 10, "x1": 0.5, "x2": 0.2}, {"id": 11, "x1": 0.1, "x2": 0.8}]
        res = requests.post(predict_url, json=input_data)
        
        if res.status_code == 200:
            print("Prediction Success:", res.json())
        else:
            print("Prediction Failed:", res.text)
            
    else:
        print("Deployment Failed:", res.text)

    # Clean up
    if os.path.exists(filename):
        os.remove(filename)

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"Verification failed: {e}")
