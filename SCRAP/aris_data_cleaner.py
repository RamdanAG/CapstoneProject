import pandas as pd
import glob
import os
import re

RAW_DIR = "data/raw/"
PROCESSED_DIR = "data/interim/"

def clean_text_basic(text):
    text = str(text)
    text = re.sub(r'[\n\t\r]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def main():
    print("Memulai proses Data Consolidation...")
    
    all_files = glob.glob(os.path.join(RAW_DIR, "*.csv"))
    if not all_files:
        print(f"Error: Tidak ada file CSV di {RAW_DIR}")
        return
    
    print(f"Menemukan {len(all_files)} file. Menggabungkan...")
    
    df_list = []
    for file in all_files:
        try:
            df_list.append(pd.read_csv(file))
        except Exception as e:
            print(f"Gagal membaca {file}: {e}")
            
    master_df = pd.concat(df_list, ignore_index=True)
    print(f"Total baris raw: {len(master_df)}")

    master_df = master_df.drop_duplicates(subset=['id'])
    master_df = master_df.dropna(subset=['message'])
    master_df = master_df[master_df['message'].str.strip() != ""]
    
    print("Merapikan format teks...")
    master_df['message'] = master_df['message'].apply(clean_text_basic)

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    output_filename = os.path.join(PROCESSED_DIR, "master_dataset_interim.csv")
    
    master_df.to_csv(output_filename, index=False, encoding='utf-8')
    
    print(f"Pembersihan selesai. Total baris: {len(master_df)}")
    print(f"File tersimpan di: {output_filename}")

if __name__ == "__main__":
    main()