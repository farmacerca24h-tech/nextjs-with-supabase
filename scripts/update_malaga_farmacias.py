import io
import os
import re
import time
import unicodedata
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup
from curl_cffi import requests as cffi_requests
from pdfminer.high_level import extract_text as pdf_extract_text
from pdfminer.layout import LAParams

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
    timeout: int = 40,
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
    chunks = [
        digits[i : i + 9]
        for i in range(0, len(digits), 9)
        if len(digits[i : i + 9]) == 9
    ]
    return " / ".join(chunks)


def normalize_locality_and_sector(raw_loc: str) -> Tuple[str, str]:
    clean = " ".join((raw_loc or "").split()).strip().rstrip(".")
    m_art = re.match(r"^(.+?)\s*\((El|La|Los|Las)\)$", clean, flags=re.IGNORECASE)
    if m_art:
        clean = f"{m_art.group(2)} {m_art.group(1)}"

    norm = unicodedata.normalize("NFKD", clean.upper())
    norm = "".join(ch for ch in norm if not unicodedata.combining(ch))

    if "CAMPANILLAS" in norm:
        return "Campanillas", clean
    if any(k in norm for k in ("SECTOR ", "BARRIADA ", "PARQUE DEL CINE", "CENTRO")):
        return "Málaga", clean
    if norm in MUNICIPALITY_CANONICAL:
        return MUNICIPALITY_CANONICAL[norm], ""
    return clean.title(), ""


def slugify_municipality(name: str) -> str:
    localidad, _ = normalize_locality_and_sector(name)
    norm = unicodedata.normalize("NFKD", localidad.lower())
    norm = "".join(ch for ch in norm if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", "-", norm).strip("-") or "malaga"


def normalize_street_key(address: str) -> str:
    s = unicodedata.normalize("NFKD", (address or "").upper())
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"(29\d{3})\s*[A-Z\s\-\(\)]*$", " ", s)
    s = re.sub(r"\([^)]*\)", " ", s)
    if " - " in s:
        s = s.split(" - ")[0]
    s = re.sub(r"\bS\s*/\s*N\b", " ", s)
    s = re.sub(r"(?:^|\s)(?:C/\.?|Pº|Nº)(?=\s|$)", " ", s)
    s = re.sub(
        r"\b(LOCAL|LCAL|BAJO|BLOQUE|BLQ|FASE|PORTAL|PISO)\s*[A-Z0-9\-\.]*$",
        " ",
        s,
    )
    s = re.sub(
        r"\b(CALLE|CL|AVENIDA|AVDA|AV|PLAZA|PZA|PL|PASEO|PSO|CARRETERA|CTRA|CRTA|"
        r"CARRIL|CAMINO|CMNO|BLVR|BULEVAR|PASAJE|PSJE|URBANIZACION|URB|BARRIADA|BDA|"
        r"EDIFICIO|EDIF|RESIDENCIAL|RES|CONJUNTO|CONJ|NUMERO|NUM|N|"
        r"DE|DEL|LA|LAS|EL|LOS|Y|A|AL|POR)\b",
        " ",
        s,
    )
    tokens = re.findall(r"[A-Z0-9]+", s)
    if not tokens:
        return ""
    words = [t for t in tokens if t.isalpha()]
    nums = [t for t in tokens if t.isdigit()]
    first_num = nums[0] if nums else ""
    return "".join(words)[:20] + first_num


def scrape_icofma_spd_pdf(now_iso: str) -> List[Dict[str, str]]:
    pdf_url = (
        "https://www.icofma.es/wp-content/uploads/2026/06/"
        "Listado_Farmacias_que_hacen_SPD_web_20230608.pdf"
    )
    resp = fetch_url(pdf_url, timeout=45)
    laparams = LAParams(char_margin=80.0, line_margin=0.25, word_margin=0.1)
    raw_pdf_text = pdf_extract_text(io.BytesIO(resp.content), laparams=laparams)

    cleaned_text = re.sub(
        r"Ubicaci[oó]n\s+C[oó]digo\s+postal\s+Farmacia\s+Direcci[oó]n\s+Tel[eé]fono",
        "\n",
        raw_pdf_text,
        flags=re.IGNORECASE,
    )

    row_pattern = re.compile(
        r"([A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-\(\)\.]+?)\s+"
        r"\b(29\d{3})\b\s+"
        r"(.*?)\s+"
        r"([679]\d{2}[\s\.]*\d{3}[\s\.]*\d{3}|[679]\d{2}[\s\.]*\d{2}[\s\.]*\d{2}[\s\.]*\d{2})",
        re.DOTALL,
    )

    street_split_pattern = re.compile(
        r"(?:^|\s)(C/\.?|CALLE|AV\.?|AVDA\.?|AVENIDA|PL\.?|PZA\.?|PLAZA|PASEO|Pº|"
        r"CARRIL|CTRA\.?|CARRETERA|CRTA\.?|BLVR\.?|BULEVAR|CAMINO|ALAMEDA|URB\.?|URBANIZACI[ÓO]N|"
        r"EDIF\.?|EDIFICIO|PUERTA|CAPIT[ÁA]N|PASAJE|BDA\.?|BARRIADA|JARDINES|MAESTRANZA|SAN\s+BARTOLOM[ÉE])(?=[\s,])",
        re.IGNORECASE,
    )

    results: List[Dict[str, str]] = []
    seen_keys = set()

    for match in row_pattern.finditer(cleaned_text):
        ubicacion_raw, cp, middle_raw, telefono_raw = match.groups()
        localidad, sector = normalize_locality_and_sector(ubicacion_raw)
        middle_clean = " ".join(middle_raw.split()).strip()

        street_match = street_split_pattern.search(middle_clean)
        if street_match and street_match.start() > 2:
            split_idx = street_match.start(1)
            titular = middle_clean[:split_idx].strip(" -.,")
            direccion = middle_clean[split_idx:].strip()
        else:
            titular = middle_clean
            direccion = middle_clean

        phone_norm = split_phones(telefono_raw)
        first_phone = phone_norm.split(" / ")[0] if phone_norm else ""
        slug = re.sub(r"[^A-Z0-9]", "", f"{cp}{titular}{direccion}".upper())[:24]
        unique_key = f"MALAGA-{cp}-{first_phone}" if first_phone else f"MALAGA-{cp}-{slug}"

        if unique_key in seen_keys:
            continue
        seen_keys.add(unique_key)

        results.append(
            {
                "pharmacy_key": unique_key,
                "titular": titular,
                "direccion": direccion,
                "codigo_postal": cp,
                "localidad": localidad,
                "sector": sector,
                "telefono": phone_norm,
                "horario_habitual": "Horario habitual",
                "service_status": "STANDARD",
                "source_url": pdf_url,
                "updated_at": now_iso,
            }
        )

    return results


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
    info = {
        "titular": "",
        "direccion": "",
        "codigo_postal": "",
        "localidad": "",
        "telefono": "",
    }
    for tr in soup.find_all("tr"):
        cells = [
            " ".join(td.get_text(" ", strip=True).split())
            for td in tr.find_all(["td", "th"])
        ]
        if len(cells) >= 2:
            label = cells[0].upper()
            val = cells[1].strip()
            if "TITULAR" in label:
                info["titular"] = val
            elif "DIRECCI" in label:
                info["direccion"] = val
            elif "LOCALIDAD" in label:
                cp_m = re.search(r"\((\d{5})\)", val)
                if cp_m:
                    info["codigo_postal"] = cp_m.group(1)
                loc_clean = re.sub(r"\(\d{5}\)\s*-?\s*", "", val).strip()
                if loc_clean:
                    info["localidad"] = loc_clean
            elif "TEL" in label and "FAX" not in label:
                info["telefono"] = split_phones(val)

    cache[datos_id] = info
    time.sleep(0.15)
    return info


def collect_official_malaga_pharmacies(
    rotation_days: int = 30,
    step_days: int = 1,
) -> List[Dict[str, str]]:
    madrid_now = datetime.now(ZoneInfo("Europe/Madrid"))
    now_iso = madrid_now.isoformat()

    records = scrape_icofma_spd_pdf(now_iso)
    print(f"Loaded {len(records)} official Málaga pharmacies from ICOFMA SPD PDF.")

    by_full_key: Dict[str, Dict[str, str]] = {}
    for rec in records:
        s_key = normalize_street_key(rec["direccion"])
        m_slug = slugify_municipality(rec["localidad"])
        if s_key:
            by_full_key[f"{m_slug}::{s_key}"] = rec

    index_url = "https://farmaciasguardia.farmaceuticos.com/web_guardias/publico/Provincia_pNew.asp?id=29"
    guardias_url = "https://farmaciasguardia.farmaceuticos.com/web_guardias/Guardias.asp"

    init_resp = fetch_url(index_url, timeout=30)
    init_soup = BeautifulSoup(decode_html_bytes(init_resp.content), "html.parser")

    seen_codes = {"29000089", "29000095", "29000096", "29000066"}
    zones: List[Tuple[str, str]] = []
    for opt in init_soup.find_all("option"):
        val = (opt.get("value") or "").strip()
        label = " ".join(opt.get_text().split())
        if val.isdigit() and val.startswith("29000") and val not in seen_codes:
            seen_codes.add(val)
            zones.append((val, label))

    sample_dates = [
        (madrid_now + timedelta(days=i * step_days)).strftime("%d/%m/%Y")
        for i in range(max(1, rotation_days))
    ]
    num_dates = len(sample_dates)
    perm_threshold = max(3, num_dates // 2) if num_dates >= 4 else 1

    duty_tracker: Dict[str, Dict[str, object]] = {}
    datos_cache: Dict[str, Dict[str, str]] = {}
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

    for d_idx, date_str in enumerate(sample_dates, start=1):
        before_count = len(records)
        for code, zone_label in zones:
            resp = fetch_url(
                guardias_url,
                params={
                    "date": date_str,
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
                id_m = re.search(
                    r"datos\.asp\?id=(\d+)", attr_blob, flags=re.IGNORECASE
                )
                if id_m and tag.parent:
                    parent_text = " ".join(
                        tag.parent.get_text(" ", strip=True).split()
                    )
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

                if not current_tier or any(
                    upper_line.startswith(p) for p in ignore_prefixes
                ):
                    continue

                if " - " not in line or len(line) < 8:
                    continue

                clean_entry = re.sub(
                    r"(?i)^.*?Datos\s+farmacia\s*", "", line
                ).strip()
                address_part, loc_part = clean_entry.rsplit(" - ", 1)
                address_clean = address_part.strip()
                raw_loc = loc_part.strip() or zone_label

                if not address_clean or not any(
                    c.isdigit() or "/" in c for c in address_clean
                ):
                    if "S/N" not in address_clean.upper() and not any(
                        kw in address_clean.upper()
                        for kw in (
                            "CALLE",
                            "C/",
                            "AV",
                            "PLAZA",
                            "PZA",
                            "PASEO",
                            "CTRA",
                            "CARRETERA",
                            "REAL",
                            "VERACRUZ",
                        )
                    ):
                        continue

                localidad, sector = normalize_locality_and_sector(raw_loc)
                street_key = normalize_street_key(address_clean)
                mun_slug = slugify_municipality(localidad)
                full_key = (
                    f"{mun_slug}::{street_key}"
                    if street_key
                    else re.sub(
                        r"[^A-Z0-9]", "", f"{localidad}{address_clean}".upper()
                    )
                )

                if full_key not in duty_tracker:
                    duty_tracker[full_key] = {
                        "dates_24h": set(),
                        "dates_ext": set(),
                        "hours_24h": "",
                        "hours_ext": "",
                    }
                tracker = duty_tracker[full_key]
                if "TODO EL D" in current_tier.upper():
                    tracker["dates_24h"].add(date_str)  # type: ignore[union-attr]
                    if current_hours:
                        tracker["hours_24h"] = current_hours
                else:
                    tracker["dates_ext"].add(date_str)  # type: ignore[union-attr]
                    if current_hours:
                        tracker["hours_ext"] = current_hours

                if full_key not in by_full_key:
                    datos_info = {
                        "titular": "",
                        "direccion": "",
                        "codigo_postal": "",
                        "localidad": "",
                        "telefono": "",
                    }
                    for row_txt, d_id in row_datos_map.items():
                        if address_clean[:18] in row_txt:
                            datos_info = fetch_datos_card(
                                d_id, str(resp.url), datos_cache
                            )
                            break

                    if datos_info["localidad"]:
                        canon_loc, _ = normalize_locality_and_sector(
                            datos_info["localidad"]
                        )
                        localidad = canon_loc or localidad

                    clean_slug = re.sub(r"[^A-Z0-9]", "", full_key.upper())[:28]
                    new_rec = {
                        "pharmacy_key": f"MALAGA-OFICIAL-{clean_slug}",
                        "titular": datos_info["titular"],
                        "direccion": datos_info["direccion"] or address_clean,
                        "codigo_postal": datos_info["codigo_postal"],
                        "localidad": localidad,
                        "sector": sector,
                        "telefono": datos_info["telefono"],
                        "horario_habitual": "Horario habitual",
                        "service_status": "STANDARD",
                        "source_url": str(resp.url),
                        "updated_at": now_iso,
                    }
                    records.append(new_rec)
                    by_full_key[full_key] = new_rec

            time.sleep(0.25)

        print(
            f"[Date {d_idx}/{num_dates}: {date_str}] "
            f"+{len(records) - before_count} new (total: {len(records)})"
        )

    for full_key, t_info in duty_tracker.items():
        rec = by_full_key.get(full_key)
        if rec is None:
            continue
        n_24h = len(t_info["dates_24h"])  # type: ignore[arg-type]
        n_ext = len(t_info["dates_ext"])  # type: ignore[arg-type]
        h_24h = str(t_info["hours_24h"] or "DE 9:30 DE HOY A 9:30 DE MAÑANA")
        h_ext = str(t_info["hours_ext"] or "DE 9:30 A 22:00")

        if n_24h >= perm_threshold:
            rec["service_status"] = "24H"
            rec["horario_habitual"] = f"Permanente 24H - {h_24h}"
        elif n_ext >= perm_threshold:
            rec["service_status"] = "EXTENDED_12H+"
            rec["horario_habitual"] = f"Horario ampliado 12H+ - {h_ext}"
        else:
            rec["service_status"] = "STANDARD"
            rec["horario_habitual"] = "Horario habitual"

    return records


def upsert_to_supabase(rows: List[Dict[str, str]]) -> None:
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    for idx in range(0, len(rows), 100):
        batch = rows[idx : idx + 100]
        resp = SESSION.post(
            f"{SUPABASE_URL}/rest/v1/farmacias_malaga",
            params={"on_conflict": "pharmacy_key"},
            json=batch,
            headers=headers,
            timeout=30,
        )
        resp.raise_for_status()


def main() -> None:
    rows = collect_official_malaga_pharmacies(rotation_days=30, step_days=1)
    print(f"Upserting {len(rows)} official Málaga pharmacies to Supabase...")
    upsert_to_supabase(rows)
    print("Weekly Málaga pharmacy directory sync complete.")


if __name__ == "__main__":
    main()
