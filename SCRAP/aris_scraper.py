import json
import time
import csv
import re
import random
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from curl_cffi.requests import Session
import urllib3

urllib3.disable_warnings()

# ── KONFIGURASI ──────────────────────────────────────────────
COOKIE_FILE = Path("tokopedia_cookies.json")
CHROME_IMPERSONATE = "chrome110"

GQL_HEADERS = {
    "accept": "*/*",
    "content-type": "application/json",
    "origin": "https://www.tokopedia.com",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "x-device": "desktop",
    "x-source": "tokopedia-lite",
}

HTML_HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", 
    "user-agent": GQL_HEADERS["user-agent"]
}

REVIEW_QUERY = """
query productReviewList($productID: String!, $page: Int!, $limit: Int!, $sortBy: String, $filterBy: String) {
  productrevGetProductReviewList(productID: $productID, page: $page, limit: $limit, sortBy: $sortBy, filterBy: $filterBy) {
    list {
      id: feedbackID
      variantName
      message
      productRating
      reviewCreateTime
      reviewCreateTimestamp
      isAnonymous
      imageAttachments { attachmentID }
      videoAttachments { attachmentID }
      reviewResponse { message }
      user { fullName }
      likeDislike { totalLike }
    }
    hasNext
    totalReviews
  }
}
"""

# ── FUNGSI INTI ──────────────────────────────────────────────

def load_cookies() -> dict:
    if not COOKIE_FILE.exists():
        print(f"[ERROR] File {COOKIE_FILE.name} tidak ditemukan.")
        return {}
    with open(COOKIE_FILE, encoding="utf-8") as f:
        data = json.load(f)
        return {item["name"]: item["value"] for item in data if "name" in item and "value" in item} if isinstance(data, list) else data

def resolve_short_url(url: str) -> str:
    if "tokopedia.link" not in url and "tk.tokopedia.com" not in url: return url
    print("  [INFO] Memecahkan short link...")
    try:
        with Session(impersonate=CHROME_IMPERSONATE) as s:
            return s.get(url, allow_redirects=True, timeout=15).url
    except Exception: return url

def extract_id_from_url(url: str) -> str:
    match = re.search(r'-(\d{9,25})(?:\?|$)', url)
    return match.group(1) if match else None

def extract_name_from_url(url: str) -> str:
    clean_url = url.split("?")[0].rstrip("/")
    path = urlparse(clean_url).path
    parts = path.strip("/").split("/")
    if len(parts) >= 2:
        slug = parts[1]
        name_slug = re.sub(r'-\d+$', '', slug)
        return name_slug.replace('-', ' ').title()
    return "Produk_Tanpa_Nama"

def get_product_info(url: str, cookies: dict) -> dict:
    clean_url = url.split("?")[0].rstrip("/")
    try:
        with Session(impersonate=CHROME_IMPERSONATE) as s:
            r = s.get(clean_url, headers=HTML_HEADERS, cookies=cookies, timeout=15)
            html = r.text
        
        product_id = next((re.search(p, html).group(1) for p in [r'"productID"\s*:\s*"(\d+)"', r'"productId"\s*:\s*(\d+)'] if re.search(p, html)), None)
        name = (re.search(r'<title>([^<]+)</title>', html).group(1).split("|")[0].strip() if re.search(r'<title>([^<]+)</title>', html) else None)
        return {"product_id": product_id, "product_name": name}
    except Exception:
        return {} 

def fetch_reviews(product_id: str, referer_url: str, cookies: dict, page: int) -> dict:
    headers = GQL_HEADERS.copy()
    headers["referer"] = referer_url
    payload = [{"operationName": "productReviewList", "query": REVIEW_QUERY, "variables": {"productID": str(product_id), "page": page, "limit": 10, "sortBy": "create_time desc", "filterBy": ""}}]

    with Session(impersonate=CHROME_IMPERSONATE) as s:
        resp = s.post("https://gql.tokopedia.com/graphql/productReviewList", headers=headers, cookies=cookies, json=payload, timeout=20)
        return resp.json()[0].get("data", {}).get("productrevGetProductReviewList", {}) if resp.status_code == 200 else {}

def parse_reviews(raw_list: list, p_name: str) -> list:
    cleaned = []
    for r in raw_list:
        msg = r.get("message", "").strip()
        if not msg: continue
        cleaned.append({
            "product_name": p_name,
            "id": r.get("id", ""),
            "rating": r.get("productRating", 0),
            "message": msg,
            "date": r.get("reviewCreateTime", ""),
            "timestamp": r.get("reviewCreateTimestamp", 0),
            "variant": r.get("variantName", ""),
            "is_anonymous": r.get("isAnonymous", False),
            "username": "Anonymous" if r.get("isAnonymous") else r.get("user", {}).get("fullName", "Anonymous"),
            "total_likes": r.get("likeDislike", {}).get("totalLike", 0),
            "has_image": len(r.get("imageAttachments", [])) > 0,
            "has_video": len(r.get("videoAttachments", [])) > 0,
            "seller_reply": r.get("reviewResponse", {}).get("message", "") if r.get("reviewResponse") else ""
        })
    return cleaned

# ── EKSEKUSI ───────────────────────────────────────────────

def main():
    cookies = load_cookies()
    if not cookies: return
    
    raw_url = input("Masukkan URL Produk: ").strip()
    url = resolve_short_url(raw_url)
    
    print("\n[1/3] Mengambil metadata produk...")
    
    info = get_product_info(url, cookies)
    auto_id = extract_id_from_url(url)
    
    p_id = info.get("product_id") or auto_id
    if not p_id: 
        p_id = input("  [WARN] Gagal ekstrak ID. Masukkan ID Produk manual: ").strip()
    else:
        print(f"  ✓ ID Produk: {p_id}")

    p_name = info.get("product_name")
    if not p_name or p_name == "Produk":
        p_name = extract_name_from_url(url)
        print(f"  ✓ Nama Produk (dari URL): {p_name}")
    else:
        print(f"  ✓ Nama Produk: {p_name}")

    print("-" * 40)
    
    res = fetch_reviews(p_id, url, cookies, 1)
    total_reviews = res.get("totalReviews", 0)
    print(f"Total ulasan tersedia: {total_reviews}")
    
    if total_reviews == 0:
        print("[INFO] Tidak ada ulasan untuk discrape atau produk diblokir API.")
        return

    target_input = input(f"Jumlah ulasan yang ingin diambil (Enter = Ambil Semua): ").strip()
    target = int(target_input) if target_input else total_reviews

    print(f"\n[2/3] Scraping {target} ulasan...")
    all_raws = []
    page = 1
    
    while len(all_raws) < target:
        res = fetch_reviews(p_id, url, cookies, page)
        if not res or not res.get("list"): break
        
        all_raws.extend(res.get("list"))
        print(f" -> Halaman {page} (Total: {len(all_raws)})")
        
        if not res.get("hasNext") or len(all_raws) >= target: break
        page += 1
        time.sleep(random.uniform(0.7, 1.3))

    print("\n[3/3] Memproses data...")
    final_data = parse_reviews(all_raws[:target], p_name)
    
    tanggal = datetime.now().strftime("%Y%m%d")
    filename = f"raw_{p_id}_{tanggal}.csv"
    
    if final_data:
        with open(filename, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(final_data[0].keys()))
            w.writeheader()
            w.writerows(final_data)
        print(f"\n[SUCCESS] Berhasil! Data tersimpan sebagai: {filename}")

if __name__ == "__main__":
    main()