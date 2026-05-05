# ARIS (AI-Powered Review Intelligence System) - Data Pipeline

Repositori ini berisi *pipeline* Data Engineering dan Data Science awal untuk proyek ARIS (Tema: Sustainable Living & Responsible Consumption). Sistem ini dirancang untuk melakukan *scraping* ulasan produk Tokopedia secara aman dari pemblokiran WAF (Web Application Firewall), melakukan konsolidasi data, dan menjalankan pemrosesan *Natural Language Processing* (NLP).

## Informasi Dataset
Dataset yang dihasilkan oleh pipeline ini berfokus pada ulasan produk-produk ramah lingkungan di Tokopedia. Data diproses dalam tiga tahap:
1. **Raw Data (`data/raw/`)**: Berisi ulasan mentah per produk dengan metadata lengkap (13 kolom), termasuk `id`, `rating`, `message`, `timestamp`, `is_anonymous`, `has_image`, dll.
2. **Interim Data (`data/interim/`)**: Dataset master gabungan yang sudah dibersihkan dari duplikat ID mutlak dan ulasan kosong (tanpa teks).
3. **Processed NLP Data (`data/processed/`)**: Dataset akhir yang siap dilabeli. Berisi tambahan kolom `message_normalized`, `message_clean` (bebas stopword/tanda baca), dan `tokens` hasil pemrosesan menggunakan Sastrawi.

## Persyaratan Sistem
* Python 3.10 atau lebih baru.
* Install dependensi yang dibutuhkan:
  ```bash
  pip install -r requirements.txt
  ```

## Langkah-Langkah Menjalankan Pipeline

### Tahap 1: Persiapan Autentikasi (Bypass WAF)
Sistem ini menggunakan library `curl_cffi` dan membutuhkan file *cookies* agar dikenali sebagai sesi browser asli.
1. Instal ekstensi **Cookie-Editor** di Google Chrome.
2. Buka dan *login* ke Tokopedia di browser Anda.
3. Klik ekstensi Cookie-Editor -> Pilih **Export** -> **Export as JSON**.
4. Buat file baru bernama `tokopedia_cookies.json` di root folder proyek ini dan *paste* isi JSON tersebut.

### Tahap 2: Data Gathering (Scraping)
Skrip ini akan mengambil ulasan berdasarkan URL produk Tokopedia.
```bash
python aris_scraper.py
```
* **Input**: URL Produk Tokopedia & Jumlah ulasan yang ingin diambil.
* **Output**: File `raw_{id_produk}_{tanggal}.csv` di dalam folder `data/raw/`.

### Tahap 3: Data Consolidation & Basic Cleaning
Menggabungkan seluruh file *raw* menjadi satu Master Dataset dan membersihkan nilai kosong/duplikat.
```bash
python aris_data_cleaner.py
```
* **Output**: File `master_dataset_interim.csv` di dalam folder `data/interim/`.

### Tahap 4: NLP Preprocessing
Menjalankan *lowercasing*, *punctuation removal*, *stopword removal* (menggunakan Sastrawi), dan *tokenization*.
```bash
cd data/processed
python aris_nlp_preprocessor.py
```
* **Output**: File `master_dataset_nlp.csv` yang bersih dan siap digunakan untuk proses *Heuristic Labeling* atau pemodelan ML.

## Struktur Direktori
```text
/
 ├── aris_scraper.py
 ├── aris_data_cleaner.py
 ├── requirements.txt
 ├── tokopedia_cookies.json
 └── data/
      ├── raw/                      # Hasil scraping per produk
      ├── interim/                  # master_dataset_interim.csv
      └── processed/
           ├── aris_nlp_preprocessor.py
           └── master_dataset_nlp.csv
```