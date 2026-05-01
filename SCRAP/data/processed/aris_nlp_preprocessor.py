import pandas as pd
import re
import os
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Path disesuaikan karena skrip berada di dalam data/processed/
INTERIM_FILE = "../SCRAP TOKOPEDIA/data/interim/master_dataset_interim.csv"
OUTPUT_FILE = "../SCRAP TOKOPEDIA/data/processed/master_dataset_nlp.csv"

factory = StopWordRemoverFactory()
stopword_remover = factory.create_stop_word_remover()
CUSTOM_STOPWORDS = ["yg", "kalo", "biar", "bgt", "nya", "sih", "dong", "kok", "yah"]

def normalize_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def remove_stopwords(text):
    text = stopword_remover.remove(text)
    words = text.split()
    clean_words = [w for w in words if w not in CUSTOM_STOPWORDS]
    return " ".join(clean_words)

def main():
    print("Memulai NLP Preprocessing...")

    if not os.path.exists(INTERIM_FILE):
        print(f"Error: File {INTERIM_FILE} tidak ditemukan.")
        return

    df = pd.read_csv(INTERIM_FILE)
    print(f"Memproses {len(df)} baris data...")

    print("Proses Normalization (Lowercase & Punctuation)...")
    df['message_normalized'] = df['message'].apply(normalize_text)

    print("Proses Stopword Removal...")
    df['message_clean'] = df['message_normalized'].apply(remove_stopwords)

    print("Proses Tokenization...")
    df['tokens'] = df['message_clean'].apply(lambda x: x.split())

    df = df[df['message_clean'].str.strip() != ""]
    df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8')

    print(f"Preprocessing selesai. Total baris: {len(df)}")
    print(f"File tersimpan di: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()