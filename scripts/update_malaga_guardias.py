import os
import re
import time
import unicodedata
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup
from curl_cffi import requests as cffi_requests

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

MUNICIPALITY_CANONICAL: Dict[str, str] = {
    "MALAGA": "Málaga",
    "COIN": "Coín",
    "GUARO": "Guaro",
    "ALHAURIN DE LA TORRE": "Alhaurín de la Torre",
    "ALHAURIN EL GRANDE": "Alhaurín el Grande",
    "COMARES": "Comares",
    "ANTEQUERA": "Antequera",
    "VILLANUEVA DE ALGAIDAS": "Villanueva de Algaidas",
    "CAMPILLOS": "Campillos",
    "JIMERA DE LIBAR": "Jimera de Líbar",
    "RONDA": "Ronda",
    "YUNQUERA": "Yunquera",
    "MONTECORTO": "Montecorto",
    "PUJERRA": "Pujerra",
    "FARAJAN": "Faraján",
    "JUZCAR": "Júzcar",
    "BENADALID": "Benadalid",
    "CARRATRACA": "Carratraca",
    "MARBELLA": "Marbella",
    "TORREMOLINOS": "Torremolinos",
    "BENALMADENA": "Benalmádena",
    "BENALMADENA COSTA": "Benalmádena Costa",
    "COSTA": "Benalmádena Costa",
    "ARROYO DE LA MIEL": "Arroyo de la Miel",
    "FUENGIROLA": "Fuengirola",
    "MIJAS": "Mijas",
    "MIJAS COSTA": "Mijas Costa",
    "LAS LAGUNAS": "Las Lagunas",
    "VELEZ-MALAGA": "Vélez-Málaga",
    "VELEZ MALAGA": "Vélez-Málaga",
    "TORRE DEL MAR": "Torre del Mar",
    "CALETA DE VELEZ": "Caleta de Vélez",
    "ALMAYATE": "Almayate",
    "BENAJARAFE": "Benajarafe",
    "TORRE DE BENAGALBON": "Torre de Benagalbón",
    "ALMACHAR": "Almáchar",
    "TORROX": "Torrox",
    "NERJA": "Nerja",
    "RINCON DE LA VICTORIA": "Rincón de la Victoria",
    "CUEVAS DEL BECERRO": "Cuevas del Becerro",
    "PIZARRA": "Pizarra",
    "CAMPANILLAS": "Campanillas",
    "ALORA": "Álora",
    "ESTEPONA": "Estepona",
    "SAN PEDRO ALCANTARA": "San Pedro Alcántara",
    "SAN PEDRO DE ALCANTARA": "San Pedro Alcántara",
    "BENAHAVIS": "Benahavís",
    "EL BURGO": "El Burgo",
    "BURGO (EL)": "El Burgo",
    "ALAMEDA": "Alameda",
    "ALOZAINA": "Alozaina",
    "ARCHIDONA": "Archidona",
    "ARDALES": "Ardales",
    "CARTAMA": "Cártama",
    "ESTACION": "Cártama",
    "CASABERMEJA": "Casabermeja",
    "CUEVAS DE SAN MARCOS": "Cuevas de San Marcos",
    "MANILVA": "Manilva",
}


def build_session() -> cffi_requests.Session:
    session = cffi_requests.Session(impersonate="chrome", verify=False)
    session.headers.update(
        {
            "Accept-Language": "es-ES,es;q=0.9",
            "Cache-Control": "no-cache",
        }
    )
    return session


SESSION = build_session()


def decode_html_bytes(raw_bytes: bytes) -> str:
    try:
        return raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return raw_bytes.decode("windows-1252", errors="replace")


def fetch_url(
    url: str,
    params: Optional[Dict[str, str]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 35,
    max_retries: int = 4,
) -> cffi_requests.Response:
    global SESSION
    for attempt in range(1, max_retries + 1):
        try:
            resp = SESSION.get(url, params=params, headers=headers, timeout=timeout)
        except cffi_requests.exceptions.RequestException:
            if attempt < max_retries:
                try:
                    SESSION.close()
                except Exception:
                    pass
                SESSION = build_session()
                time.sleep(3 * (2 ** (attempt - 1)))
                continue
            raise

        if resp.status_code in (429, 502, 503, 504) and attempt < max_retries:
            time.sleep(3 * (2 ** (attempt - 1)))
            continue
        resp.raise_for_status()
        return resp
    raise RuntimeError(f"Exhausted retries for {url}")


def split_phones(raw_phone: str) -> str:
    digits = re.sub(r"\D", "", raw_phone or "")
    if not digits:
        return ""
    chunks = [digits[i : i + 9] for i in range(0, len(digits), 9) if len(digits[i : i + 9]) == 9]
    return " / ".join(chunks)


def normalize_locality_and_sector(raw_loc: str) -> Tuple[str, str]:
    clean = " ".join((raw_loc or "").split()).strip().rstrip(".")
    norm = unicodedata.normalize("NFKD", clean.upper())
    norm = "".join(ch for ch in norm if not unicodedata.combining(ch))

    if "CAMPANILLAS" in norm:
        return "Campanillas", clean
    if any(k in norm for k in ("SECTOR ", "BARRIADA ", "PARQUE DEL CINE", "CENTRO")):
        return "Málaga", clean
    if norm in MUNICIPALITY_CANONICAL:
        return MUNICIPALITY_CANONICAL[norm], ""
    return clean.title(), ""


def fetch_datos_card(
    datos_id: str, referer_url: str, cache: Dict[str, Dict[str, str]]
) -> Dict[str, str]:
    if datos_id in cache:
        return cache[datos_id]

    resp = fetch_url(
        "https://farmaciasguardia.farmaceuticos.com/web_guardias/datos.asp",
        params={"id": datos_id},
        headers={"Referer": referer_url},
        timeout=25,
    )
    soup = BeautifulSoup(decode_html_bytes(resp.content), "html.parser")
    info = {"titular": "", "telefono": ""}
    for tr in soup.find_all("tr"):
        cells = [" ".join(td.get_text(" ", strip=True).split()) for td in tr.find_all(["td", "th"])]
        if len(cells) >= 2:
            label = cells[0].upper()
            val = cells[1].strip()
            if "TITULAR" in label:
                info["titular"] = val
            elif "TEL" in label and "FAX" not in label:
                info["telefono"] = split_phones(val)

    cache[datos_id] = info
    time.sleep(0.15)
    return info


def scrape_dates(target_dates: List[datetime]) -> List[Dict[str, str]]:
    index_url = "https://farmaciasguardia.farmaceuticos.com/web_guardias/publico/Provincia_pNew.asp?id=29"
    guardias_url = "https://farmaciasguardia.farmaceuticos.com/web_guardias/Guardias.asp"

    init_resp = fetch_url(index_url, timeout=30)
    init_soup = BeautifulSoup(decode_html_bytes(init_resp.content), "html.parser")

    # Skip duplicate zone aliases (89, 95, 96 duplicate 01; 66 duplicates 71)
    seen_codes = {"29000089", "29000095", "29000096", "29000066"}
    zones: List[Tuple[str, str]] = []
    for opt in init_soup.find_all("option"):
        val = (opt.get("value") or "").strip()
        label = " ".join(opt.get_text().split())
        if val.isdigit() and val.startswith("29000") and val not in seen_codes:
            seen_codes.add(val)
            zones.append((val, label))

    ignore_prefixes = (
        "SON LAS ",
        "RECUERDE ",
        "GUARDIAS ",
        "DE 9",
        "DE 0",
        "DE 1",
        "DE 2",
        "SELECCIONE",
        "FECHA",
        "NOTA",
        "AVISO",
    )

    rows_by_key: Dict[Tuple[str, str, str, str], Dict[str, str]] = {}
    datos_cache: Dict[str, Dict[str, str]] = {}

    for dt in target_dates:
        date_es = dt.strftime("%d/%m/%Y")
        date_iso = dt.strftime("%Y-%m-%d")

        for code, zone_label in zones:
            resp = fetch_url(
                guardias_url,
                params={
                    "date": date_es,
                    "vzona": code,
                    "vmenu": "1",
                    "provincia": "29",
                },
                headers={"Referer": index_url},
                timeout=30,
            )
            soup = BeautifulSoup(decode_html_bytes(resp.content), "html.parser")

            row_datos_map: Dict[str, str] = {}
            for tag in soup.find_all(["a", "img", "td", "div"]):
                attr_blob = f"{tag.get('href', '')} {tag.get('onclick', '')}"
                id_m = re.search(r"datos\.asp\?id=(\d+)", attr_blob, flags=re.IGNORECASE)
                if id_m and tag.parent:
                    parent_text = " ".join(tag.parent.get_text(" ", strip=True).split())
                    row_datos_map[parent_text] = id_m.group(1)

            text_lines = [
                " ".join(line.split())
                for line in soup.get_text("\n", strip=True).splitlines()
                if line.strip()
            ]

            current_tier = ""
            current_hours = ""

            for i, line in enumerate(text_lines):
                upper_line = line.upper()
                if "GUARDIAS TODO EL D" in upper_line:
                    current_tier = "GUARDIAS TODO EL DÍA"
                    if i + 1 < len(text_lines) and "DE " in text_lines[i + 1].upper():
                        current_hours = text_lines[i + 1]
                    continue

                if "GUARDIAS DE D" in upper_line or "GUARDIAS DIURNAS" in upper_line:
                    current_tier = "GUARDIAS DE DÍA"
                    if i + 1 < len(text_lines) and "DE " in text_lines[i + 1].upper():
                        current_hours = text_lines[i + 1]
                    continue

                if not current_tier or any(upper_line.startswith(p) for p in ignore_prefixes):
                    continue

                if " - " not in line or len(line) < 8:
                    continue

                clean_entry = re.sub(r"(?i)^.*?Datos\s+farmacia\s*", "", line).strip()
                address_part, loc_part = clean_entry.rsplit(" - ", 1)
                address_clean = address_part.strip()
                raw_loc = loc_part.strip() or zone_label

                if not address_clean or not any(c.isdigit() or "/" in c for c in address_clean):
                    if "S/N" not in address_clean.upper() and not any(
                        kw in address_clean.upper()
                        for kw in ("CALLE", "C/", "AV", "PLAZA", "PZA", "PASEO", "CTRA", "CARRETERA", "REAL", "VERACRUZ")
                    ):
                        continue

                localidad, sector = normalize_locality_and_sector(raw_loc)
                tipo_guardia = "24H" if "TODO EL D" in current_tier.upper() else "EXTENDED_12H+"
                horario = " - ".join(p for p in (current_tier, current_hours) if p)

                datos_info = {"titular": "", "telefono": ""}
                for row_txt, d_id in row_datos_map.items():
                    if address_clean[:18] in row_txt:
                        datos_info = fetch_datos_card(d_id, str(resp.url), datos_cache)
                        break

                dedup_key = (date_iso, localidad, address_clean, tipo_guardia)
                rows_by_key[dedup_key] = {
                    "fecha": date_iso,
                    "zona_codigo": code,
                    "localidad": localidad,
                    "sector": sector,
                    "direccion": address_clean,
                    "tipo_guardia": tipo_guardia,
                    "horario": horario,
                    "titular": datos_info["titular"],
                    "telefono": datos_info["telefono"],
                }

            time.sleep(0.25)

    return list(rows_by_key.values())


def sync_to_supabase(rows: List[Dict[str, str]], oldest_keep_iso: str) -> None:
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    # Remove shifts older than yesterday so the table stays clean
    del_resp = SESSION.delete(
        f"{SUPABASE_URL}/rest/v1/guardias_malaga",
        params={"fecha": f"lt.{oldest_keep_iso}"},
        headers=headers,
        timeout=30,
    )
    del_resp.raise_for_status()

    # Upsert in batches of 100
    for idx in range(0, len(rows), 100):
        batch = rows[idx : idx + 100]
        up_resp = SESSION.post(
            f"{SUPABASE_URL}/rest/v1/guardias_malaga",
            params={"on_conflict": "fecha,localidad,direccion,tipo_guardia"},
            json=batch,
            headers=headers,
            timeout=30,
        )
        up_resp.raise_for_status()


def main() -> None:
    madrid_now = datetime.now(ZoneInfo("Europe/Madrid"))
    # Capture yesterday (active overnight shift before 09:30), today, and tomorrow
    target_dates = [
        madrid_now - timedelta(days=1),
        madrid_now,
        madrid_now + timedelta(days=1),
    ]
    print(f"Scraping Málaga guardias for {[d.strftime('%Y-%m-%d') for d in target_dates]}...")
    rows = scrape_dates(target_dates)
    print(f"Collected {len(rows)} unique guardia shift rows. Syncing to Supabase...")
    sync_to_supabase(rows, oldest_keep_iso=target_dates[0].strftime("%Y-%m-%d"))
    print("Sync complete.")


if __name__ == "__main__":
    main()
