from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from .sku_seed import INITIAL_SKUS


BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BACKEND_DIR / "data" / "aishowcase.db"
SUPPORTED_LOCALES = ("zh-CN", "en", "fr", "ar")

INITIAL_SERIES = (
    {
        "id": "xo",
        "name": "XO",
        "subtitle": "COGNAC FINE CHAMPAGNE",
        "tagline_zh": "璀璨典范",
        "tagline_en": "OPULENCE",
        "description": "首席酿酒大师臻选多达400种珍稀生命之水调配而成，释放繁复华丽的果香与花香交响。天鹅绒般丰盈醇厚的质感，呈现无与伦比的奢华余韵。",
        "image_url": "/assets/remy/bottle-xo.png",
        "aroma_label": "香气",
        "aroma_value": "茉莉 · 晚香玉",
        "palate_label": "口感",
        "palate_value": "醇厚 · 丝滑",
        "finish_label": "余韵",
        "finish_value": "悠长 · 奢华",
        "origin": "大香槟区 & 小香槟区",
        "abv": "40% VOL.",
        "updated_at": "2026-11-18T14:20:00+08:00",
    },
    {
        "id": "vsop",
        "name": "VSOP",
        "subtitle": "COGNAC FINE CHAMPAGNE",
        "tagline_zh": "经典和谐",
        "tagline_en": "HARMONY",
        "description": "自1927年诞生以来始终定义优质香槟区干邑典范。香草、成熟杏桃与柔和甘草优雅交融，呈现平衡圆润且极具辨识度的经典风味。",
        "image_url": "/assets/remy/bottle-vsop.png",
        "aroma_label": "香气",
        "aroma_value": "香草 · 杏桃",
        "palate_label": "口感",
        "palate_value": "圆润 · 平衡",
        "finish_label": "余韵",
        "finish_value": "柔顺 · 绵长",
        "origin": "大香槟区 & 小香槟区",
        "abv": "40% VOL.",
        "updated_at": "2026-11-17T16:45:00+08:00",
    },
    {
        "id": "club",
        "name": "CLUB",
        "subtitle": "COGNAC FINE CHAMPAGNE",
        "tagline_zh": "多面风范",
        "tagline_en": "MULTIFACETED",
        "description": "甄选大香槟区与小香槟区生命之水，呈现强烈而复杂的多面香气。烘烤杏仁、肉桂与杏子的丰沛层次，带来持久而鲜明的品鉴体验。",
        "image_url": "/assets/remy/bottle-club.png",
        "aroma_label": "香气",
        "aroma_value": "杏仁 · 肉桂",
        "palate_label": "口感",
        "palate_value": "浓郁 · 复杂",
        "finish_label": "余韵",
        "finish_value": "持久 · 鲜明",
        "origin": "大香槟区 & 小香槟区",
        "abv": "40% VOL.",
        "updated_at": "2026-11-18T18:30:00+08:00",
    },
    {
        "id": "1738",
        "name": "1738",
        "subtitle": "COGNAC FINE CHAMPAGNE",
        "tagline_zh": "皇家礼赞",
        "tagline_en": "ACCORD ROYAL",
        "description": "致敬1738年法国国王路易十五授予人头马的皇家特许状。经深度烘烤橡木桶熟成，散发浓郁无花果、烘焙香料与绵密奶油太妃风味。",
        "image_url": "/assets/remy/bottle-1738.png",
        "aroma_label": "香气",
        "aroma_value": "无花果 · 李子",
        "palate_label": "口感",
        "palate_value": "馥郁 · 橡木",
        "finish_label": "余韵",
        "finish_value": "温润 · 奶油",
        "origin": "大香槟区 & 小香槟区",
        "abv": "40% VOL.",
        "updated_at": "2026-11-15T11:10:00+08:00",
    },
)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database() -> None:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS product_series (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                subtitle TEXT NOT NULL DEFAULT '',
                tagline_zh TEXT NOT NULL DEFAULT '',
                tagline_en TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                image_url TEXT NOT NULL DEFAULT '',
                aroma_label TEXT NOT NULL DEFAULT '',
                aroma_value TEXT NOT NULL DEFAULT '',
                palate_label TEXT NOT NULL DEFAULT '',
                palate_value TEXT NOT NULL DEFAULT '',
                finish_label TEXT NOT NULL DEFAULT '',
                finish_value TEXT NOT NULL DEFAULT '',
                origin TEXT NOT NULL DEFAULT '',
                abv TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL
            )
            """
        )

        content_columns = {
            "image_url": "TEXT NOT NULL DEFAULT ''",
            "aroma_label": "TEXT NOT NULL DEFAULT ''",
            "aroma_value": "TEXT NOT NULL DEFAULT ''",
            "palate_label": "TEXT NOT NULL DEFAULT ''",
            "palate_value": "TEXT NOT NULL DEFAULT ''",
            "finish_label": "TEXT NOT NULL DEFAULT ''",
            "finish_value": "TEXT NOT NULL DEFAULT ''",
            "origin": "TEXT NOT NULL DEFAULT ''",
            "abv": "TEXT NOT NULL DEFAULT ''",
        }
        existing_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(product_series)")
        }
        added_columns: list[str] = []
        for column, definition in content_columns.items():
            if column not in existing_columns:
                connection.execute(
                    f"ALTER TABLE product_series ADD COLUMN {column} {definition}"
                )
                added_columns.append(column)

        if added_columns:
            assignments = ", ".join(f"{column} = ?" for column in added_columns)
            for seed in INITIAL_SERIES:
                connection.execute(
                    f"UPDATE product_series SET {assignments} WHERE id = ?",
                    tuple(seed[column] for column in added_columns) + (seed["id"],),
                )

        connection.executemany(
            """
            INSERT OR IGNORE INTO product_series (
                id, name, subtitle, tagline_zh, tagline_en, description,
                image_url, aroma_label, aroma_value, palate_label, palate_value,
                finish_label, finish_value, origin, abv, updated_at
            ) VALUES (
                :id, :name, :subtitle, :tagline_zh, :tagline_en, :description,
                :image_url, :aroma_label, :aroma_value, :palate_label, :palate_value,
                :finish_label, :finish_value, :origin, :abv, :updated_at
            )
            """,
            INITIAL_SERIES,
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS app_metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS product_skus (
                id TEXT PRIMARY KEY,
                series_id TEXT NOT NULL,
                sku_code TEXT NOT NULL,
                name TEXT NOT NULL,
                english_name TEXT NOT NULL DEFAULT '',
                volume TEXT NOT NULL DEFAULT '',
                abv TEXT NOT NULL DEFAULT '',
                price TEXT NOT NULL DEFAULT '',
                packaging TEXT NOT NULL DEFAULT '',
                shelf_slot TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
                sort_order INTEGER NOT NULL DEFAULT 0,
                highlight TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                serving_suggestion TEXT NOT NULL DEFAULT '',
                image_url TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES product_series(id) ON DELETE CASCADE
            )
            """
        )
        sku_seeded = connection.execute(
            "SELECT value FROM app_metadata WHERE key = 'sku_seed_v1'"
        ).fetchone()
        if sku_seeded is None:
            connection.executemany(
                """
                INSERT OR IGNORE INTO product_skus (
                    id, series_id, sku_code, name, english_name, volume, abv,
                    price, packaging, shelf_slot, status, sort_order, highlight,
                    description, serving_suggestion, image_url, updated_at
                ) VALUES (
                    :id, :series_id, :sku_code, :name, :english_name, :volume, :abv,
                    :price, :packaging, :shelf_slot, :status, :sort_order, :highlight,
                    :description, :serving_suggestion, :image_url, :updated_at
                )
                """,
                INITIAL_SKUS,
            )
            connection.execute(
                "INSERT INTO app_metadata (key, value) VALUES ('sku_seed_v1', 'complete')"
            )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS series_translations (
                series_id TEXT NOT NULL,
                locale TEXT NOT NULL CHECK (locale IN ('zh-CN', 'en', 'fr', 'ar')),
                name TEXT NOT NULL DEFAULT '',
                subtitle TEXT NOT NULL DEFAULT '',
                tagline TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                aroma_label TEXT NOT NULL DEFAULT '',
                aroma_value TEXT NOT NULL DEFAULT '',
                palate_label TEXT NOT NULL DEFAULT '',
                palate_value TEXT NOT NULL DEFAULT '',
                finish_label TEXT NOT NULL DEFAULT '',
                finish_value TEXT NOT NULL DEFAULT '',
                origin TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL,
                PRIMARY KEY (series_id, locale),
                FOREIGN KEY (series_id) REFERENCES product_series(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS sku_translations (
                sku_id TEXT NOT NULL,
                locale TEXT NOT NULL CHECK (locale IN ('zh-CN', 'en', 'fr', 'ar')),
                name TEXT NOT NULL DEFAULT '',
                packaging TEXT NOT NULL DEFAULT '',
                highlight TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                serving_suggestion TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL,
                PRIMARY KEY (sku_id, locale),
                FOREIGN KEY (sku_id) REFERENCES product_skus(id) ON DELETE CASCADE
            )
            """
        )

        connection.execute(
            """
            INSERT OR IGNORE INTO series_translations (
                series_id, locale, name, subtitle, tagline, description,
                aroma_label, aroma_value, palate_label, palate_value,
                finish_label, finish_value, origin, updated_at
            )
            SELECT id, 'zh-CN', name, subtitle, tagline_zh, description,
                   aroma_label, aroma_value, palate_label, palate_value,
                   finish_label, finish_value, origin, updated_at
            FROM product_series
            """
        )
        connection.execute(
            """
            INSERT OR IGNORE INTO series_translations (
                series_id, locale, name, subtitle, tagline, updated_at
            )
            SELECT id, 'en', name, subtitle, tagline_en, updated_at
            FROM product_series
            """
        )
        connection.execute(
            """
            INSERT OR IGNORE INTO sku_translations (
                sku_id, locale, name, packaging, highlight, description,
                serving_suggestion, updated_at
            )
            SELECT id, 'zh-CN', name, packaging, highlight, description,
                   serving_suggestion, updated_at
            FROM product_skus
            """
        )
        connection.execute(
            """
            INSERT OR IGNORE INTO sku_translations (
                sku_id, locale, name, updated_at
            )
            SELECT id, 'en', english_name, updated_at
            FROM product_skus
            """
        )


def _row_to_series(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "subtitle": row["subtitle"],
        "taglineZh": row["tagline_zh"],
        "taglineEn": row["tagline_en"],
        "description": row["description"],
        "imageUrl": row["image_url"],
        "tasting": {
            "aromaLabel": row["aroma_label"],
            "aromaValue": row["aroma_value"],
            "palateLabel": row["palate_label"],
            "palateValue": row["palate_value"],
            "finishLabel": row["finish_label"],
            "finishValue": row["finish_value"],
        },
        "origin": row["origin"],
        "abv": row["abv"],
        "updatedAt": row["updated_at"],
    }


def _empty_series_translation(locale: str) -> dict[str, Any]:
    return {
        "locale": locale,
        "name": "",
        "subtitle": "",
        "tagline": "",
        "description": "",
        "tasting": {
            "aromaLabel": "",
            "aromaValue": "",
            "palateLabel": "",
            "palateValue": "",
            "finishLabel": "",
            "finishValue": "",
        },
        "origin": "",
        "updatedAt": "",
    }


def _row_to_series_translation(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "locale": row["locale"],
        "name": row["name"],
        "subtitle": row["subtitle"],
        "tagline": row["tagline"],
        "description": row["description"],
        "tasting": {
            "aromaLabel": row["aroma_label"],
            "aromaValue": row["aroma_value"],
            "palateLabel": row["palate_label"],
            "palateValue": row["palate_value"],
            "finishLabel": row["finish_label"],
            "finishValue": row["finish_value"],
        },
        "origin": row["origin"],
        "updatedAt": row["updated_at"],
    }


def list_series_translations(series_id: str) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM series_translations WHERE series_id = ?",
            (series_id,),
        ).fetchall()
    translations = {
        row["locale"]: _row_to_series_translation(row) for row in rows
    }
    return [
        translations.get(locale, _empty_series_translation(locale))
        for locale in SUPPORTED_LOCALES
    ]


def upsert_series_translation(
    series_id: str, locale: str, payload: dict[str, Any]
) -> dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    tasting = payload["tasting"]
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO series_translations (
                series_id, locale, name, subtitle, tagline, description,
                aroma_label, aroma_value, palate_label, palate_value,
                finish_label, finish_value, origin, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(series_id, locale) DO UPDATE SET
                name = excluded.name,
                subtitle = excluded.subtitle,
                tagline = excluded.tagline,
                description = excluded.description,
                aroma_label = excluded.aroma_label,
                aroma_value = excluded.aroma_value,
                palate_label = excluded.palate_label,
                palate_value = excluded.palate_value,
                finish_label = excluded.finish_label,
                finish_value = excluded.finish_value,
                origin = excluded.origin,
                updated_at = excluded.updated_at
            """,
            (
                series_id, locale, payload["name"], payload["subtitle"],
                payload["tagline"], payload["description"],
                tasting["aromaLabel"], tasting["aromaValue"],
                tasting["palateLabel"], tasting["palateValue"],
                tasting["finishLabel"], tasting["finishValue"],
                payload["origin"], updated_at,
            ),
        )
        row = connection.execute(
            """
            SELECT * FROM series_translations
            WHERE series_id = ? AND locale = ?
            """,
            (series_id, locale),
        ).fetchone()
    if row is None:
        raise RuntimeError("Saved series translation could not be read back")
    return _row_to_series_translation(row)


def list_series() -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT *
            FROM product_series
            ORDER BY CASE id
                WHEN 'xo' THEN 1
                WHEN 'vsop' THEN 2
                WHEN 'club' THEN 3
                WHEN '1738' THEN 4
                ELSE 5
            END, name
            """
        ).fetchall()
    return [_row_to_series(row) for row in rows]


def get_series(series_id: str) -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM product_series
            WHERE id = ?
            """,
            (series_id,),
        ).fetchone()
    return _row_to_series(row) if row else None


def create_series(payload: dict[str, Any]) -> dict[str, Any]:
    series_id = f"series-{uuid4().hex[:12]}"
    updated_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO product_series (
                id, name, subtitle, tagline_zh, tagline_en, description,
                image_url, aroma_label, aroma_value, palate_label, palate_value,
                finish_label, finish_value, origin, abv, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                series_id,
                payload["name"],
                payload["subtitle"],
                payload["taglineZh"],
                payload["taglineEn"],
                payload["description"],
                payload["imageUrl"],
                payload["tasting"]["aromaLabel"],
                payload["tasting"]["aromaValue"],
                payload["tasting"]["palateLabel"],
                payload["tasting"]["palateValue"],
                payload["tasting"]["finishLabel"],
                payload["tasting"]["finishValue"],
                payload["origin"],
                payload["abv"],
                updated_at,
            ),
        )
    upsert_series_translation(
        series_id,
        "zh-CN",
        {
            "name": payload["name"],
            "subtitle": payload["subtitle"],
            "tagline": payload["taglineZh"],
            "description": payload["description"],
            "tasting": payload["tasting"],
            "origin": payload["origin"],
        },
    )
    upsert_series_translation(
        series_id,
        "en",
        {
            "name": payload["name"],
            "subtitle": payload["subtitle"],
            "tagline": payload["taglineEn"],
            "description": "",
            "tasting": {
                "aromaLabel": "",
                "aromaValue": "",
                "palateLabel": "",
                "palateValue": "",
                "finishLabel": "",
                "finishValue": "",
            },
            "origin": "",
        },
    )
    created = get_series(series_id)
    if created is None:
        raise RuntimeError("Created product series could not be read back")
    return created


def update_series(series_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
    updated_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE product_series
            SET name = ?,
                subtitle = ?,
                tagline_zh = ?,
                tagline_en = ?,
                description = ?,
                image_url = ?,
                aroma_label = ?,
                aroma_value = ?,
                palate_label = ?,
                palate_value = ?,
                finish_label = ?,
                finish_value = ?,
                origin = ?,
                abv = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                payload["name"],
                payload["subtitle"],
                payload["taglineZh"],
                payload["taglineEn"],
                payload["description"],
                payload["imageUrl"],
                payload["tasting"]["aromaLabel"],
                payload["tasting"]["aromaValue"],
                payload["tasting"]["palateLabel"],
                payload["tasting"]["palateValue"],
                payload["tasting"]["finishLabel"],
                payload["tasting"]["finishValue"],
                payload["origin"],
                payload["abv"],
                updated_at,
                series_id,
            ),
        )
        if cursor.rowcount == 0:
            return None
    upsert_series_translation(
        series_id,
        "zh-CN",
        {
            "name": payload["name"],
            "subtitle": payload["subtitle"],
            "tagline": payload["taglineZh"],
            "description": payload["description"],
            "tasting": payload["tasting"],
            "origin": payload["origin"],
        },
    )
    english_translation = next(
        item for item in list_series_translations(series_id) if item["locale"] == "en"
    )
    english_translation.update(
        {
            "name": payload["name"],
            "subtitle": payload["subtitle"],
            "tagline": payload["taglineEn"],
        }
    )
    upsert_series_translation(series_id, "en", english_translation)
    return get_series(series_id)


def _row_to_sku(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "seriesId": row["series_id"],
        "skuCode": row["sku_code"],
        "name": row["name"],
        "englishName": row["english_name"],
        "volume": row["volume"],
        "abv": row["abv"],
        "price": row["price"],
        "packaging": row["packaging"],
        "shelfSlot": row["shelf_slot"],
        "status": row["status"],
        "sortOrder": row["sort_order"],
        "highlight": row["highlight"],
        "description": row["description"],
        "servingSuggestion": row["serving_suggestion"],
        "imageUrl": row["image_url"],
        "updatedAt": row["updated_at"],
    }


def _empty_sku_translation(locale: str) -> dict[str, Any]:
    return {
        "locale": locale,
        "name": "",
        "packaging": "",
        "highlight": "",
        "description": "",
        "servingSuggestion": "",
        "updatedAt": "",
    }


def _row_to_sku_translation(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "locale": row["locale"],
        "name": row["name"],
        "packaging": row["packaging"],
        "highlight": row["highlight"],
        "description": row["description"],
        "servingSuggestion": row["serving_suggestion"],
        "updatedAt": row["updated_at"],
    }


def list_sku_translations(sku_id: str) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM sku_translations WHERE sku_id = ?",
            (sku_id,),
        ).fetchall()
    translations = {
        row["locale"]: _row_to_sku_translation(row) for row in rows
    }
    return [
        translations.get(locale, _empty_sku_translation(locale))
        for locale in SUPPORTED_LOCALES
    ]


def upsert_sku_translation(
    sku_id: str, locale: str, payload: dict[str, Any]
) -> dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO sku_translations (
                sku_id, locale, name, packaging, highlight, description,
                serving_suggestion, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(sku_id, locale) DO UPDATE SET
                name = excluded.name,
                packaging = excluded.packaging,
                highlight = excluded.highlight,
                description = excluded.description,
                serving_suggestion = excluded.serving_suggestion,
                updated_at = excluded.updated_at
            """,
            (
                sku_id, locale, payload["name"], payload["packaging"],
                payload["highlight"], payload["description"],
                payload["servingSuggestion"], updated_at,
            ),
        )
        row = connection.execute(
            """
            SELECT * FROM sku_translations
            WHERE sku_id = ? AND locale = ?
            """,
            (sku_id, locale),
        ).fetchone()
    if row is None:
        raise RuntimeError("Saved SKU translation could not be read back")
    return _row_to_sku_translation(row)


def list_skus(series_id: str) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT * FROM product_skus
            WHERE series_id = ?
            ORDER BY sort_order, name
            """,
            (series_id,),
        ).fetchall()
    return [_row_to_sku(row) for row in rows]


def get_sku(series_id: str, sku_id: str) -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM product_skus WHERE series_id = ? AND id = ?",
            (series_id, sku_id),
        ).fetchone()
    return _row_to_sku(row) if row else None


def create_sku(series_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    sku_id = f"sku-{uuid4().hex[:12]}"
    updated_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO product_skus (
                id, series_id, sku_code, name, english_name, volume, abv,
                price, packaging, shelf_slot, status, sort_order, highlight,
                description, serving_suggestion, image_url, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sku_id, series_id, payload["skuCode"], payload["name"],
                payload["englishName"], payload["volume"], payload["abv"],
                payload["price"], payload["packaging"], payload["shelfSlot"],
                payload["status"], payload["sortOrder"], payload["highlight"],
                payload["description"], payload["servingSuggestion"],
                payload["imageUrl"], updated_at,
            ),
        )
    upsert_sku_translation(
        sku_id,
        "zh-CN",
        {
            "name": payload["name"],
            "packaging": payload["packaging"],
            "highlight": payload["highlight"],
            "description": payload["description"],
            "servingSuggestion": payload["servingSuggestion"],
        },
    )
    upsert_sku_translation(
        sku_id,
        "en",
        {
            "name": payload["englishName"],
            "packaging": "",
            "highlight": "",
            "description": "",
            "servingSuggestion": "",
        },
    )
    created = get_sku(series_id, sku_id)
    if created is None:
        raise RuntimeError("Created SKU could not be read back")
    return created


def update_sku(
    series_id: str, sku_id: str, payload: dict[str, Any]
) -> dict[str, Any] | None:
    updated_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE product_skus
            SET sku_code = ?, name = ?, english_name = ?, volume = ?, abv = ?,
                price = ?, packaging = ?, shelf_slot = ?, status = ?, sort_order = ?,
                highlight = ?, description = ?, serving_suggestion = ?, image_url = ?,
                updated_at = ?
            WHERE series_id = ? AND id = ?
            """,
            (
                payload["skuCode"], payload["name"], payload["englishName"],
                payload["volume"], payload["abv"], payload["price"],
                payload["packaging"], payload["shelfSlot"], payload["status"],
                payload["sortOrder"], payload["highlight"], payload["description"],
                payload["servingSuggestion"], payload["imageUrl"], updated_at,
                series_id, sku_id,
            ),
        )
        if cursor.rowcount == 0:
            return None
    upsert_sku_translation(
        sku_id,
        "zh-CN",
        {
            "name": payload["name"],
            "packaging": payload["packaging"],
            "highlight": payload["highlight"],
            "description": payload["description"],
            "servingSuggestion": payload["servingSuggestion"],
        },
    )
    english_translation = next(
        item for item in list_sku_translations(sku_id) if item["locale"] == "en"
    )
    english_translation["name"] = payload["englishName"]
    upsert_sku_translation(sku_id, "en", english_translation)
    return get_sku(series_id, sku_id)


def delete_sku(series_id: str, sku_id: str) -> bool:
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM product_skus WHERE series_id = ? AND id = ?",
            (series_id, sku_id),
        )
    return cursor.rowcount > 0
