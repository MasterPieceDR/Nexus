import csv
import json
import os
import random
import re
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv

try:
    from duckduckgo_search import DDGS
    HAS_DDG = True
except ImportError:
    HAS_DDG = False

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "").strip()
PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY", "").strip()
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "").strip()

LOCAL_API_BASE = os.getenv("NEXUS_LOCAL_API_BASE", "http://127.0.0.1:8000").rstrip("/")
DB_NAME = os.getenv("NEXUS_DB_NAME", "NexusDB")
OWNER_USER_ID = int(os.getenv("NEXUS_OWNER_USER_ID", "1"))
TARGET_IMAGES = int(os.getenv("NEXUS_TARGET_IMAGES", "60"))

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_STATIC_DIR = ROOT_DIR / "backend" / "static" / "seed" / "images"
DATA_DIR = ROOT_DIR / "backend" / "scripts" / "data"
SQL_DIR = ROOT_DIR / "backend" / "sql"

BACKEND_STATIC_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
SQL_DIR.mkdir(parents=True, exist_ok=True)

REQUEST_DELAY = 0.5
PER_PAGE = 30

CATEGORIES = [
    {
        "slug": "innovacion",
        "name": "Innovación",
        "description": "Ideas, creatividad, laboratorios y proyectos innovadores",
        "queries": [
            "innovation technology lab",
            "creative technology workspace",
            "startup innovation",
            "digital innovation"
        ],
        "tags": "innovacion, creatividad, tecnologia, ideas, nexus"
    },
    {
        "slug": "cloud-computing",
        "name": "Cloud Computing",
        "description": "Infraestructura cloud, servidores, arquitectura y servicios en la nube",
        "queries": [
            "cloud computing server",
            "data center cloud",
            "cloud infrastructure",
            "server infrastructure"
        ],
        "tags": "cloud, aws, infraestructura, servidores, terraform"
    },
    {
        "slug": "bases-de-datos",
        "name": "Bases de Datos",
        "description": "SQL Server, datos, analítica, modelado y almacenamiento",
        "queries": [
            "database server technology",
            "data analytics dashboard",
            "server room data",
            "database technology"
        ],
        "tags": "sqlserver, database, datos, consultas, backend"
    },
    {
        "slug": "ciberseguridad",
        "name": "Ciberseguridad",
        "description": "Seguridad digital, privacidad, accesos y protección de sistemas",
        "queries": [
            "cybersecurity technology",
            "digital security laptop",
            "network security",
            "information security"
        ],
        "tags": "seguridad, privacidad, iam, accesos, proteccion"
    },
    {
        "slug": "inteligencia-artificial",
        "name": "Inteligencia Artificial",
        "description": "IA, automatización, redes neuronales y análisis inteligente",
        "queries": [
            "artificial intelligence abstract",
            "machine learning technology",
            "neural network",
            "ai technology"
        ],
        "tags": "ia, machine-learning, automatizacion, datos, neural"
    },
    {
        "slug": "diseno-ui-ux",
        "name": "Diseño UI/UX",
        "description": "Interfaces, experiencia de usuario, prototipos y diseño visual",
        "queries": [
            "user interface design",
            "ux design wireframe",
            "web design workspace",
            "interface prototype"
        ],
        "tags": "ui, ux, diseno, interfaz, prototipo"
    },
    {
        "slug": "programacion-web",
        "name": "Programación Web",
        "description": "HTML, CSS, JavaScript, frontend, backend y desarrollo web",
        "queries": [
            "programming code screen",
            "web development code",
            "software developer laptop",
            "coding workspace"
        ],
        "tags": "html, css, javascript, fastapi, frontend"
    },
    {
        "slug": "devops",
        "name": "DevOps",
        "description": "Automatización, despliegue, infraestructura como código y operación",
        "queries": [
            "software deployment",
            "automation technology",
            "infrastructure engineering",
            "devops workflow"
        ],
        "tags": "devops, terraform, despliegue, automatizacion, ec2"
    },
    {
        "slug": "redes",
        "name": "Redes",
        "description": "Conectividad, servidores, redes informáticas e infraestructura",
        "queries": [
            "computer network cables",
            "network server room",
            "internet connection technology",
            "network infrastructure"
        ],
        "tags": "redes, conectividad, servidores, infraestructura, red"
    },
    {
        "slug": "prototipos",
        "name": "Prototipos",
        "description": "Prototipado, validación de ideas, diseño de producto y experimentación",
        "queries": [
            "prototype design desk",
            "product design prototype",
            "creative prototype",
            "design thinking"
        ],
        "tags": "prototipo, producto, creatividad, validacion, idea"
    },
    {
        "slug": "robotica-iot",
        "name": "Robótica e IoT",
        "description": "Robótica, sensores, dispositivos conectados e internet de las cosas",
        "queries": [
            "robotics technology",
            "iot devices",
            "smart sensors technology",
            "electronics prototype"
        ],
        "tags": "robotica, iot, sensores, dispositivos, automatizacion"
    },
    {
        "slug": "sostenibilidad-tech",
        "name": "Sostenibilidad Tecnológica",
        "description": "Tecnología verde, eficiencia, sostenibilidad e innovación responsable",
        "queries": [
            "green technology",
            "sustainable technology",
            "renewable energy technology",
            "eco innovation"
        ],
        "tags": "sostenibilidad, tecnologia-verde, innovacion, energia, impacto"
    }
]

TITLE_TEMPLATES = [
    "Nodo de {category} para explorar nuevas ideas",
    "Referencia visual sobre {category}",
    "Inspiración aplicada a {category}",
    "Recurso visual de {category}",
    "Conexión creativa para proyectos de {category}",
    "Idea destacada de {category}",
    "Evidencia visual relacionada con {category}",
    "Concepto moderno sobre {category}",
    "Mapa visual de {category}",
    "Recurso para constelaciones de {category}"
]

COMMENT_TEMPLATES = [
    "Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.",
    "Recurso útil para probar el feed visual, la búsqueda y el filtrado por categorías.",
    "Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.",
    "Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.",
    "Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.",
    "Nodo útil para validar la vista de detalle, comentarios y guardados.",
    "Contenido inicial para alimentar la plataforma y probar la API localmente.",
    "Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.",
    "Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.",
    "Nodo visual preparado para probar el flujo de Nexus en ambiente local."
]

SOURCES = [
    "duckduckgo",
    "pexels",
    "pixabay",
    "unsplash",
    "wikimedia"
]

def slugify(value):
    value = value.lower().strip()
    value = re.sub(r"[áàäâ]", "a", value)
    value = re.sub(r"[éèëê]", "e", value)
    value = re.sub(r"[íìïî]", "i", value)
    value = re.sub(r"[óòöô]", "o", value)
    value = re.sub(r"[úùüû]", "u", value)
    value = re.sub(r"ñ", "n", value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-")

def sql_text(value):
    if value is None:
        return ""
    return str(value).replace("'", "''")

def image_extension(url):
    return ".webp"

def request_json(url, headers=None, params=None):
    _headers = {"User-Agent": "NexusLocalDataset/1.0 (Contact: diego@example.com)"}
    if headers:
        _headers.update(headers)
    response = requests.get(url, headers=_headers, params=params or {}, timeout=40)
    response.raise_for_status()
    return response.json()

def download_binary(url, output_path):
    from io import BytesIO
    from PIL import Image
    _headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/"
    }
    response = requests.get(url, timeout=30, headers=_headers)
    response.raise_for_status()
    try:
        img = Image.open(BytesIO(response.content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(output_path, "WEBP", quality=80)
    except Exception as e:
        raise RuntimeError(f"Error procesando imagen: {e}")

def search_duckduckgo(query, page):
    if not HAS_DDG:
        return []
    results = []
    try:
        with DDGS() as ddgs:
            # DuckDuckGo yields a generator, we just get a few depending on the page
            limit = PER_PAGE
            ddg_results = list(ddgs.images(query, max_results=limit * page))
            # Slice the current page
            start_idx = (page - 1) * limit
            page_results = ddg_results[start_idx:start_idx + limit]
            
            for idx, r in enumerate(page_results):
                image_url = r.get("image")
                if image_url:
                    results.append({
                        "source": "duckduckgo",
                        "source_id": str(hash(image_url)),
                        "image_url": image_url,
                        "page_url": r.get("url", ""),
                        "author": r.get("source", "DuckDuckGo Image Search"),
                        "author_url": "",
                        "license": "Unknown / Fair Use"
                    })
    except Exception as e:
        print(f"Error DuckDuckGo: {e}")
    return results

def search_pexels(query, page):
    if not PEXELS_API_KEY:
        return []
    data = request_json(
        "https://api.pexels.com/v1/search",
        headers={"Authorization": PEXELS_API_KEY},
        params={"query": query, "page": page, "per_page": PER_PAGE, "orientation": "portrait"}
    )
    results = []
    for photo in data.get("photos", []):
        src = photo.get("src", {})
        image_url = src.get("large2x") or src.get("large") or src.get("original")
        if image_url:
            results.append({
                "source": "pexels",
                "source_id": str(photo.get("id")),
                "image_url": image_url,
                "page_url": photo.get("url", ""),
                "author": photo.get("photographer", ""),
                "author_url": photo.get("photographer_url", ""),
                "license": "Pexels License"
            })
    return results

def search_pixabay(query, page):
    if not PIXABAY_API_KEY:
        return []
    data = request_json(
        "https://pixabay.com/api/",
        params={
            "key": PIXABAY_API_KEY,
            "q": query,
            "image_type": "photo",
            "orientation": "vertical",
            "safesearch": "true",
            "page": page,
            "per_page": PER_PAGE
        }
    )
    results = []
    for hit in data.get("hits", []):
        image_url = hit.get("largeImageURL") or hit.get("webformatURL")
        if image_url:
            results.append({
                "source": "pixabay",
                "source_id": str(hit.get("id")),
                "image_url": image_url,
                "page_url": hit.get("pageURL", ""),
                "author": hit.get("user", ""),
                "author_url": f"https://pixabay.com/users/{hit.get('user', '')}-{hit.get('user_id', '')}/",
                "license": "Pixabay Content License"
            })
    return results

def search_unsplash(query, page):
    if not UNSPLASH_ACCESS_KEY:
        return []
    data = request_json(
        "https://api.unsplash.com/search/photos",
        headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
        params={"query": query, "page": page, "per_page": PER_PAGE, "orientation": "portrait"}
    )
    results = []
    for photo in data.get("results", []):
        photo_id = photo.get("id")
        image_url = photo.get("urls", {}).get("regular") or photo.get("urls", {}).get("full")
        download_location = photo.get("links", {}).get("download_location")
        if download_location:
            try:
                request_json(
                    download_location,
                    headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}
                )
            except Exception:
                pass
        if image_url:
            user = photo.get("user", {})
            results.append({
                "source": "unsplash",
                "source_id": str(photo_id),
                "image_url": image_url,
                "page_url": photo.get("links", {}).get("html", ""),
                "author": user.get("name", ""),
                "author_url": user.get("links", {}).get("html", ""),
                "license": "Unsplash License"
            })
    return results

def search_wikimedia(query, page):
    offset = (page - 1) * PER_PAGE
    data = request_json(
        "https://commons.wikimedia.org/w/api.php",
        params={
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": "6",
            "gsrlimit": str(PER_PAGE),
            "gsroffset": str(offset),
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|mime",
            "iiurlwidth": "1200",
            "origin": "*"
        }
    )
    pages = data.get("query", {}).get("pages", {})
    results = []
    for _, item in pages.items():
        info_list = item.get("imageinfo", [])
        if not info_list:
            continue
        info = info_list[0]
        mime = info.get("mime", "")
        if not mime.startswith("image/"):
            continue
        image_url = info.get("thumburl") or info.get("url")
        if not image_url:
            continue
        metadata = info.get("extmetadata", {})
        author = metadata.get("Artist", {}).get("value", "")
        license_name = metadata.get("LicenseShortName", {}).get("value", "Wikimedia Commons")
        results.append({
            "source": "wikimedia",
            "source_id": str(item.get("pageid")),
            "image_url": image_url,
            "page_url": f"https://commons.wikimedia.org/wiki/File:{item.get('title', '').replace('File:', '')}",
            "author": re.sub(r"<[^>]+>", "", author),
            "author_url": "",
            "license": re.sub(r"<[^>]+>", "", license_name)
        })
    return results

def search_source(source, query, page):
    if source == "duckduckgo":
        return search_duckduckgo(query, page)
    if source == "pexels":
        return search_pexels(query, page)
    if source == "pixabay":
        return search_pixabay(query, page)
    if source == "unsplash":
        return search_unsplash(query, page)
    if source == "wikimedia":
        return search_wikimedia(query, page)
    return []

def build_title(category_name, index):
    return f"{random.choice(TITLE_TEMPLATES).format(category=category_name)} #{index}"

def build_comment():
    return random.choice(COMMENT_TEMPLATES)

def build_record(category, item, global_index, local_path):
    relative_static = local_path.relative_to(ROOT_DIR / "backend" / "static").as_posix()
    media_url = f"http://localhost:8000/static/{relative_static}"
    object_key = relative_static
    return {
        "id": global_index,
        "category_slug": category["slug"],
        "category_name": category["name"],
        "title": build_title(category["name"], global_index),
        "description": build_comment(),
        "comment": build_comment(),
        "tags": category["tags"],
        "source": item["source"],
        "source_id": item["source_id"],
        "source_page_url": item["page_url"],
        "source_image_url": item["image_url"],
        "source_author": item["author"],
        "source_author_url": item["author_url"],
        "source_license": item["license"],
        "local_path": local_path.relative_to(ROOT_DIR).as_posix(),
        "media_url": media_url,
        "bucket_name": "local-dev",
        "object_key": object_key,
        "media_kind": "IMAGE",
        "mime_type": "image/webp",
        "created_at": datetime.now().isoformat(timespec="seconds")
    }

def collect_dataset():
    records = []
    per_category = TARGET_IMAGES // len(CATEGORIES)
    remainder = TARGET_IMAGES % len(CATEGORIES)

    for category_index, category in enumerate(CATEGORIES):
        category_target = per_category + (1 if category_index < remainder else 0)
        category_dir = BACKEND_STATIC_DIR / category["slug"]
        category_dir.mkdir(parents=True, exist_ok=True)
        category_count = 0

        while category_count < category_target:
            global_index = len(records) + 1
            seed = f"{category['slug']}-{global_index}"
            image_url = f"https://picsum.photos/seed/{seed}/800/1200"

            ext = ".webp"
            filename = f"{category['slug']}-{global_index:03d}{ext}"
            local_path = category_dir / filename

            try:
                download_binary(image_url, local_path)
            except Exception as error:
                print(f"Error descargando {image_url}: {error}")
                continue

            item = {
                "source": "picsum",
                "source_id": seed,
                "image_url": image_url,
                "page_url": image_url,
                "author": "Picsum Photos",
                "author_url": "https://picsum.photos",
                "license": "Free to use"
            }

            record = build_record(category, item, global_index, local_path)
            records.append(record)
            category_count += 1

            print(f"{len(records):03d}/{TARGET_IMAGES} {category['slug']} <- {item['source']}")

    return records

def write_categories_sql():
    path = SQL_DIR / "seed_nexus_categories.sql"
    lines = []
    lines.append(f"USE {DB_NAME};")
    lines.append("GO")
    lines.append("")
    lines.append("INSERT INTO core.Categories (Name, Slug, Description, SortOrder)")
    lines.append("SELECT Name, Slug, Description, SortOrder")
    lines.append("FROM (VALUES")
    values = []
    for index, category in enumerate(CATEGORIES, start=1):
        values.append(
            f"    (N'{sql_text(category['name'])}', N'{sql_text(category['slug'])}', "
            f"N'{sql_text(category['description'])}', {index})"
        )
    lines.append(",\n".join(values))
    lines.append(") C(Name, Slug, Description, SortOrder)")
    lines.append("WHERE NOT EXISTS (")
    lines.append("    SELECT 1")
    lines.append("    FROM core.Categories X")
    lines.append("    WHERE X.Slug = C.Slug")
    lines.append(");")
    lines.append("GO")
    path.write_text("\n".join(lines), encoding="utf-8")
    return path

def write_metadata(records):
    csv_path = DATA_DIR / "nexus_local_images_metadata.csv"
    json_path = DATA_DIR / "nexus_local_images_metadata.json"

    with csv_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(records[0].keys()))
        writer.writeheader()
        writer.writerows(records)

    with json_path.open("w", encoding="utf-8") as file:
        json.dump(records, file, ensure_ascii=False, indent=2)

    return csv_path, json_path

def write_seed_sql(records):
    path = SQL_DIR / "seed_nexus_local_images.sql"
    lines = []
    lines.append(f"USE {DB_NAME};")
    lines.append("GO")
    lines.append("")
    lines.append(f"DECLARE @OwnerUserId BIGINT = {OWNER_USER_ID};")
    lines.append("DECLARE @CategoryId INT;")
    lines.append("DECLARE @MediaId BIGINT;")
    lines.append("DECLARE @PinId BIGINT;")
    lines.append("")

    for record in records:
        lines.append(f"SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'{sql_text(record['category_slug'])}';")
        lines.append("IF @CategoryId IS NOT NULL")
        lines.append("BEGIN")
        lines.append("    SET @MediaId = NULL;")
        lines.append("    EXEC content.usp_CreateMediaAsset")
        lines.append("        @OwnerUserId = @OwnerUserId,")
        lines.append(f"        @BucketName = N'{sql_text(record['bucket_name'])}',")
        lines.append(f"        @ObjectKey = N'{sql_text(record['object_key'])}',")
        lines.append(f"        @MediaUrl = N'{sql_text(record['media_url'])}',")
        lines.append("        @MediaKind = N'IMAGE',")
        lines.append(f"        @MimeType = N'{sql_text(record['mime_type'])}',")
        lines.append(f"        @OriginalFileName = N'{sql_text(Path(record['local_path']).name)}',")
        try:
            size_bytes = (ROOT_DIR / record["local_path"]).stat().st_size
        except OSError:
            size_bytes = 0
        lines.append(f"        @SizeBytes = {size_bytes},")
        lines.append("        @NewMediaId = @MediaId OUTPUT;")
        lines.append("")
        lines.append("    SET @PinId = NULL;")
        lines.append("    EXEC content.usp_CreatePin")
        lines.append("        @OwnerUserId = @OwnerUserId,")
        lines.append("        @BoardId = NULL,")
        lines.append("        @CategoryId = @CategoryId,")
        lines.append(f"        @Title = N'{sql_text(record['title'])}',")
        lines.append(f"        @Description = N'{sql_text(record['description'])}',")
        lines.append(f"        @SourceUrl = N'{sql_text(record['source_page_url'])}',")
        lines.append("        @Visibility = N'PUBLIC',")
        lines.append("        @IsAiGenerated = 0,")
        lines.append("        @IsSensitive = 0,")
        lines.append("        @MediaId = @MediaId,")
        lines.append(f"        @TagsCsv = N'{sql_text(record['tags'])}',")
        lines.append("        @NewPinId = @PinId OUTPUT;")
        lines.append("")
        lines.append("    EXEC content.usp_UpdatePinStatus")
        lines.append("        @PinId = @PinId,")
        lines.append("        @Status = N'APPROVED',")
        lines.append("        @ActorUserId = @OwnerUserId;")
        lines.append("END")
        lines.append("")

    lines.append("GO")
    path.write_text("\n".join(lines), encoding="utf-8")
    return path

def main():
    categories_sql = write_categories_sql()
    records = collect_dataset()

    if not records:
        raise RuntimeError("No se descargaron imágenes. Revisa tus API keys o conexión.")

    csv_path, json_path = write_metadata(records)
    seed_sql = write_seed_sql(records)

    print("")
    print("Descarga finalizada")
    print(f"Imágenes descargadas: {len(records)}")
    print(f"Carpeta local: {BACKEND_STATIC_DIR}")
    print(f"SQL categorías: {categories_sql}")
    print(f"SQL imágenes: {seed_sql}")
    print(f"CSV: {csv_path}")
    print(f"JSON: {json_path}")
    print("")
    print("Siguiente paso:")
    print("1. Ejecuta backend/sql/seed_nexus_categories.sql en SSMS")
    print("2. Ejecuta backend/sql/seed_nexus_local_images.sql en SSMS")
    print("3. Levanta FastAPI y abre /api/pins/feed")

if __name__ == "__main__":
    main()
