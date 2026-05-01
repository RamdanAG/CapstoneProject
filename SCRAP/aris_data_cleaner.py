import pandas as pd
import glob
import os
import re

# ── KONFIGURASI FOLDER ───────────────────────────────────────
RAW_DIR = "data/raw/"           # Tempat file hasil scrape
PROCESSED_DIR = "data/interim/" # Tempat hasil gabungan & pembersihan awal

def clean_text_basic(text):
    """Menghapus karakter \n, \t, dan spasi berlebih agar CSV rapi."""
    text = str(text)
    # Ganti enter/tab dengan spasi
    text = re.sub(r'[\n\t\r]', ' ', text)
    # Hapus spasi ganda
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def main():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║          ARIS - Data Consolidation & Basic Cleaning          ║")
    print("╚══════════════════════════════════════════════════════════════╝\n")

    # 1. BACA SEMUA FILE RAW
    all_files = glob.glob(os.path.join(RAW_DIR, "*.csv"))
    if not all_files:
        print("[ERROR] Tidak ada file CSV di dalam folder data/raw/")
        return
    
    print(f"[INFO] Menemukan {len(all_files)} file CSV. Menggabungkan data...")
    
    df_list = []
    for file in all_files:
        try:
            df = pd.read_csv(file)
            df_list.append(df)
        except Exception as e:
            print(f"  [WARN] Gagal membaca {file}: {e}")
            
    # Gabungkan menjadi satu DataFrame
    master_df = pd.concat(df_list, ignore_index=True)
    print(f"\n[STAT] Total baris awal (Raw): {len(master_df):,} baris")

    # 2. DATA CLEANING BASIC
    print("[INFO] Memulai proses pembersihan dasar...")

    # a. Hapus duplikat berdasarkan ID ulasan mutlak
    master_df = master_df.drop_duplicates(subset=['id'])
    print(f"  ✓ Baris setelah hapus duplikat ID: {len(master_df):,}")

    # b. Hapus baris tanpa pesan (Missing Values)
    # Karena NLP butuh teks, ulasan yang hanya kasih bintang tanpa kata-kata harus dibuang
    master_df = master_df.dropna(subset=['message'])
    master_df = master_df[master_df['message'].str.strip() != ""]
    print(f"  ✓ Baris setelah hapus ulasan kosong: {len(master_df):,}")

    # c. Tidy-Up Teks (Merapikan format)
    print("  ✓ Merapikan spasi dan newline pada teks...")
    master_df['message'] = master_df['message'].apply(clean_text_basic)

    # 3. SIMPAN KE FOLDER INTERIM
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    output_filename = os.path.join(PROCESSED_DIR, "master_dataset_interim.csv")
    
    master_df.to_csv(output_filename, index=False, encoding='utf-8')
    
    print("\n" + "═"*62)
    print(f"[SUCCESS] Dataset siap! Disimpan di: {output_filename}")
    print(f"[STAT] Total baris bersih: {len(master_df):,} baris")
    print("═"*62)

if __name__ == "__main__":
    main()