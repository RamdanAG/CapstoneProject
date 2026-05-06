"""
AI Runner — load model .keras lalu terima input via stdin, output via stdout
Dijalankan oleh Node.js lewat child_process

Cara pakai:
  1. Taruh file .keras di folder: backend/src/ai/models/
  2. Ganti MODEL_PATH dengan nama file modelmu
  3. Sesuaikan fungsi preprocess_input() dan format output
"""

import sys
import json
import os
import numpy as np

# ================================
# GANTI PATH MODEL DI SINI
# ================================
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'model.keras')

def load_model():
    import tensorflow as tf
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model tidak ditemukan: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    return model

def preprocess_input(raw_input):
    """
    Sesuaikan preprocessing sesuai model:
    - Klasifikasi gambar: decode base64 -> resize -> normalize
    - Teks: tokenize -> pad
    - Tabular: list of numbers
    """
    # Contoh: input berupa list of numbers
    return np.array([raw_input], dtype=np.float32)

def predict(model, raw_input):
    processed = preprocess_input(raw_input)
    output = model.predict(processed, verbose=0)
    return output.tolist()

def main():
    # Kirim status siap ke Node.js
    print(json.dumps({"status": "ready"}), flush=True)

    model = load_model()
    print(json.dumps({"status": "model_loaded"}), flush=True)

    # Loop: baca input dari stdin, proses, kirim output
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
            result = predict(model, payload.get("input"))
            print(json.dumps({"ok": True, "output": result}), flush=True)
        except Exception as e:
            print(json.dumps({"ok": False, "error": str(e)}), flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}), flush=True)
        sys.exit(1)
