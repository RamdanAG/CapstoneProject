"""
Wrapper aris_scraper.py yang bisa dipanggil dari command line
tanpa input() interaktif.

Usage:
  python aris_scraper_api.py "https://tokopedia.com/..." 25
"""

import sys
import os

# Tambahkan folder SCRAP ke path supaya bisa import fungsi scraper
SCRAP_DIR = os.path.join(os.path.dirname(__file__), '..', 'SCRAP')
sys.path.insert(0, os.path.abspath(SCRAP_DIR))

from aris_scraper import (
    load_cookies, resolve_short_url, get_product_info,
    extract_id_from_url, extract_name_from_url,
    fetch_reviews, parse_reviews
)

import csv
import time
import random
from datetime import datetime
from pathlib import Path

def run(url, limit):
    os.chdir(os.path.abspath(SCRAP_DIR))  # pindah ke SCRAP biar cookies ketemu

    cookies = load_cookies()
    if not cookies:
        print("[ERROR] cookies tidak ditemukan", flush=True)
        sys.exit(1)

    url = resolve_short_url(url)

    info       = get_product_info(url, cookies)
    auto_id    = extract_id_from_url(url)
    p_id       = info.get("product_id") or auto_id
    p_name     = info.get("product_name") or extract_name_from_url(url)

    if not p_id:
        print("[ERROR] Gagal ekstrak ID produk", flush=True)
        sys.exit(1)

    print(f"[INFO] ID: {p_id} | Nama: {p_name}", flush=True)

    # Cek total dulu
    res = fetch_reviews(p_id, url, cookies, 1)
    if not res:
        print("[ERROR] Gagal fetch ke Tokopedia. Cookies mungkin expired — export ulang dari browser.", flush=True)
        sys.exit(1)

    total = res.get("totalReviews", 0)
    if total == 0:
        print("[ERROR] Tidak ada ulasan atau produk diblokir API.", flush=True)
        sys.exit(1)

    target = min(limit, total)

    print(f"[INFO] Total tersedia: {total} | Target: {target}", flush=True)

    all_raws = []
    page = 1

    while len(all_raws) < target:
        res = fetch_reviews(p_id, url, cookies, page)
        if not res or not res.get("list"):
            break

        all_raws.extend(res.get("list"))
        scraped = min(len(all_raws), target)
        print(f"[PROGRESS] {scraped}/{target}", flush=True)

        if not res.get("hasNext") or len(all_raws) >= target:
            break
        page += 1
        time.sleep(random.uniform(0.7, 1.3))

    final_data = parse_reviews(all_raws[:target], p_name)

    tanggal  = datetime.now().strftime("%Y%m%d")
    filename = f"raw_{p_id}_{tanggal}.csv"
    filepath = os.path.join(os.path.abspath(SCRAP_DIR), 'data', 'raw', filename)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    if final_data:
        with open(filepath, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(final_data[0].keys()))
            w.writeheader()
            w.writerows(final_data)
        print(f"[DONE] {filepath}", flush=True)
    else:
        print("[ERROR] Tidak ada data", flush=True)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python aris_scraper_api.py <url> [limit]")
        sys.exit(1)

    url   = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    run(url, limit)
