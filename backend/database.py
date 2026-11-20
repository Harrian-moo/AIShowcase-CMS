from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4


BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BACKEND_DIR / "data" / "aishowcase.db"

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
    return get_series(series_id)
