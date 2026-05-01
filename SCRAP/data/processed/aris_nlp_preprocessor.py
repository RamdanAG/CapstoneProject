import pandas as pd
import re
import os
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# ── KONFIGURASI FOLDER ───────────────────────────────────────
INTERIM_FILE = "data/interim/master_dataset_interim.csv"
PROCESSED_DIR = "data/processed/"

# Inisialisasi Sastrawi untuk Stopword Bahasa Indonesia
factory = StopWordRemoverFactory()
stopword_remover = factory.create_stop_word_remover()

# Tambahan stopword gaul e-commerce (Bisa disesuaikan)
CUSTOM_STOPWORDS = ["yg", "kalo", "biar", "bgt", "nya", "sih", "dong", "kok", "yah"]

def normalize_text(text):
    """Fase 1: Lowercase & Hapus Tanda Baca/Emoticon"""
    text = str(text).lower()
    # Hapus karakter selain huruf dan angka
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Hapus spasi berlebih
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def remove_stopwords(text):
    """Fase 2: Hapus kata hubung (Stopwords)"""
    # Gunakan Sastrawi
    text = stopword_remover.remove(text)
    # Hapus custom stopword
    words = text.split()
    clean_words = [w for w in words if w not in CUSTOM_STOPWORDS]
    return " ".join(clean_words)

def main():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║          ARIS - NLP Text Preprocessing (DS1 Task)            ║")
    print("╚══════════════════════════════════════════════════════════════╝\n")

    if not os.path.exists(INTERIM_FILE):
        print(f"[ERROR] File {INTERIM_FILE} tidak ditemukan. Jalankan data cleaner dulu.")
        return

    print("[INFO] Membaca Master Dataset Interim...")
    df = pd.read_csv(INTERIM_FILE)
    print(f"  ✓ Memproses {len(df):,} baris data ulasan.\n")

    print("[INFO] Memulai NLP Pipeline (Ini mungkin memakan waktu beberapa menit)...")
    
    # 1. Normalisasi (Lowercase & Punctuation Removal)
    print("  › Menjalankan Lowercasing & Punctuation Removal...")
    df['message_normalized'] = df['message'].apply(normalize_text)

    # 2. Stopword Removal
    print("  › Menjalankan Stopword Removal (Sastrawi)...")
    df['message_clean'] = df['message_normalized'].apply(remove_stopwords)

    # 3. Tokenization (Memecah kalimat menjadi list kata)
    print("  › Menjalankan Tokenization...")
    df['tokens'] = df['message_clean'].apply(lambda x: x.split())

    # Buang baris yang setelah dibersihkan ternyata jadi kosong 
    # (misal ulasan aslinya cuma "yeeeeee" atau emoticon doang)
    df = df[df['message_clean'].str.strip() != ""]

    # Simpan hasil
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    output_filename = os.path.join(PROCESSED_DIR, "master_dataset_nlp.csv")
    df.to_csv(output_filename, index=False, encoding='utf-8')

    print("\n" + "═"*62)
    print(f"[SUCCESS] NLP Preprocessing Selesai!")
    print(f"[STAT] Dataset siap dilabeli: {len(df):,} baris")
    print(f"       Tersimpan di: {output_filename}")
    print("═"*62)
    
    # Preview
    print("\n[PREVIEW HASIL]")
    preview = df[['message', 'message_clean', 'tokens']].head(3)
    for i, row in preview.iterrows():
        print(f"Asli   : {row['message']}")
        print(f"Bersih : {row['message_clean']}")
        print(f"Tokens : {row['tokens']}\n")

if __name__ == "__main__":
    main()