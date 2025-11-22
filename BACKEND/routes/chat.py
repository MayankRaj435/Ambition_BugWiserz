import os
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

load_dotenv()

chat_bp = Blueprint('chat', __name__)

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Invalid request"}), 400

    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    if not MISTRAL_API_KEY:
        return jsonify({"error": "MISTRAL_API_KEY not set"}), 500

    user_message = data["message"]

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "mistral-large-latest",
        "temperature": 0.7,
        "top_p": 1,
        "max_tokens": 512,
        "messages": [
            {
                "role": "system",
                "content": """You are a helpful assistant for a ML model training website.
                When you need to display any mathematical formula or symbol, you MUST use LaTeX formatting.
                For inline math, enclose it in single dollar signs like $...$.
                For block math, enclose it in double dollar signs like $$...$$.
                Output length should be no more than 200 words."""
            },
            {"role": "user", "content": user_message}
        ]
    }

    try:
        response = requests.post(MISTRAL_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        resp_json = response.json()
        bot_reply = resp_json["choices"][0]["message"]["content"]
        return jsonify({"response": bot_reply})
    except requests.exceptions.HTTPError as http_err:
        return jsonify({"error": f"HTTP Error: {response.status_code} - {response.text}"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
