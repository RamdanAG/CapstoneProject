# ARIS Machine Learning

Bagian ini merupakan modul Machine Learning dari project **ARIS (AI-Powered Review Intelligence System)** yang digunakan untuk menganalisis ulasan produk Tokopedia secara otomatis.

Model ini dibuat untuk membantu mendeteksi:

* Sentimen ulasan
* Review mencurigakan / spam
* Tingkat kepercayaan review
* Confidence hasil prediksi

---

# Fitur Utama

## Sentiment Analysis

Model akan mengklasifikasikan review menjadi:

* Positive
* Negative

---

## Suspicious Review Detection

Sistem juga melakukan analisis sederhana untuk mendeteksi review mencurigakan berdasarkan:

* Duplicate review
* Kata terlalu generic
* Pengulangan kata berlebihan
* Anonymous user tanpa likes

---

## Trust Score

Setiap review memiliki skor kepercayaan berdasarkan:

* Rating
* Kualitas isi review
* Tingkat suspicious review

---

## Confidence Prediction

Hasil prediksi dilengkapi confidence level:

* High
* Medium
* Low

---

# Model Architecture

Model dibangun menggunakan:

* TensorFlow / Keras
* Bidirectional LSTM
* Embedding Layer
* Dropout Regularization

---

# Dataset

Dataset berasal dari hasil scraping review Tokopedia yang kemudian diproses melalui beberapa tahap:

1. Scraping data
2. Cleaning data
3. NLP preprocessing
4. Feature engineering

Kolom penting yang digunakan:

* `message_clean`
* `word_count`
* `suspicious_score`
* `trust_score`

---

# Hasil Evaluasi Model

## Performa Terakhir

* Accuracy: ~89%
* ROC AUC Score: ~0.91

Model cukup baik dalam mendeteksi sentimen positif maupun negatif pada review produk.

---

# Struktur Folder

```text id="8mgkkj"
machine-learning/
│
├── models/
│   ├── best_aris_model.keras
│   ├── aris_tokenizer.pkl
│   └── model_config.json
│
├── notebooks/
│   └── ARIS.ipynb
│
├── requirements.txt
└── README.md
```

---

# Integrasi Selanjutnya

Model ini nantinya akan diintegrasikan ke backend FastAPI sehingga alurnya menjadi:

```text id="v2u0qv"
User Input URL Produk
        ↓
Scraper Review Tokopedia
        ↓
NLP Preprocessing
        ↓
Model AI Prediction
        ↓
Dashboard Analisis
```

---

# Kolaborasi Tim

Project ARIS dikerjakan secara kolaboratif:

* Data Science Team → scraping & preprocessing data
* Machine Learning Team → training & evaluasi model
* Fullstack Team → backend & frontend integration

