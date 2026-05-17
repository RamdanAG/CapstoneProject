import sys
import json
import os
import re
import pickle
import numpy as np

BASE_DIR    = os.path.dirname(__file__)
# Naik 4 level: ai -> src -> backend -> root, lalu masuk machine-learning/models
ROOT_DIR    = os.path.abspath(os.path.join(BASE_DIR, '..', '..', '..'))
MODELS_DIR  = os.path.join(ROOT_DIR, 'machine-learning', 'models')

MODEL_PATH  = os.path.join(MODELS_DIR, 'best_aris_model.keras')
TOKEN_PATH  = os.path.join(MODELS_DIR, 'aris_tokenizer.pkl')
CONFIG_PATH = os.path.join(MODELS_DIR, 'model_config.json')

def load_assets():
    import tensorflow as tf

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model tidak ditemukan: {MODEL_PATH}")
    if not os.path.exists(TOKEN_PATH):
        raise FileNotFoundError(f"Tokenizer tidak ditemukan: {TOKEN_PATH}")

    model = tf.keras.models.load_model(MODEL_PATH)

    with open(TOKEN_PATH, 'rb') as f:
        tokenizer = pickle.load(f)

    config = {}
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, 'r') as f:
            config = json.load(f)

    return model, tokenizer, config

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_word_count(text):
    return len(text.split())

def get_suspicious_score(text):
    score = 0
    words = text.lower().split()
    word_set = set(words)
    generic_words = {'bagus', 'oke', 'mantap', 'good', 'ok', 'keren', 'recommended', 'rekomen'}
    if word_set.issubset(generic_words): score += 0.4
    if len(words) < 5:                   score += 0.3
    if len(words) != len(word_set):      score += 0.2
    return min(score, 1.0)

def get_trust_score(rating, suspicious_score, word_count):
    trust = 0.5
    trust += (rating / 5) * 0.3
    trust -= suspicious_score * 0.3
    trust += min(word_count / 50, 0.2)
    return round(min(max(trust, 0.0), 1.0), 4)

def get_confidence_label(confidence):
    if confidence >= 0.80: return 'high'
    if confidence >= 0.55: return 'medium'
    return 'low'

def preprocess(tokenizer, config, text, rating=5):
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    max_len      = config.get('max_len', 60)
    cleaned      = clean_text(text)
    word_count   = get_word_count(cleaned)
    susp_score   = get_suspicious_score(cleaned)
    trust_score  = get_trust_score(rating, susp_score, word_count)
    seq          = tokenizer.texts_to_sequences([cleaned])
    padded       = pad_sequences(seq, maxlen=max_len, padding='post', truncating='post')
    return padded, {'message_clean': cleaned, 'word_count': word_count,
                    'suspicious_score': susp_score, 'trust_score': trust_score}

def predict(model, tokenizer, config, text, rating=5):
    padded, features = preprocess(tokenizer, config, text, rating)
    raw_output = model.predict(padded, verbose=0)

    if raw_output.shape[-1] == 1:
        confidence_positive = float(raw_output[0][0])
        confidence_negative = 1 - confidence_positive
    else:
        confidence_negative = float(raw_output[0][0])
        confidence_positive = float(raw_output[0][1])

    sentiment  = 'positive' if confidence_positive >= 0.5 else 'negative'
    confidence = max(confidence_positive, confidence_negative)

    return {
        'sentiment':         sentiment,
        'confidence':        round(confidence, 4),
        'confidence_label':  get_confidence_label(confidence),
        'positive_score':    round(confidence_positive, 4),
        'negative_score':    round(confidence_negative, 4),
        'suspicious_score':  round(features['suspicious_score'], 4),
        'trust_score':       features['trust_score'],
        'is_suspicious':     features['suspicious_score'] > 0.5,
        'message_clean':     features['message_clean'],
        'word_count':        features['word_count'],
    }

def main():
    print(json.dumps({"status": "ready"}), flush=True)
    model, tokenizer, config = load_assets()
    print(json.dumps({"status": "model_loaded"}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line: continue
        try:
            payload = json.loads(line)
            result  = predict(model, tokenizer, config,
                              payload.get('text', ''), payload.get('rating', 5))
            print(json.dumps({"ok": True, "output": result}), flush=True)
        except Exception as e:
            print(json.dumps({"ok": False, "error": str(e)}), flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}), flush=True)
        sys.exit(1)
