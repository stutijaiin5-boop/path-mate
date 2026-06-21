import sqlite3
import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

DB_PATH = Path(__file__).parent / "reports.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal TEXT NOT NULL,
            current_situation TEXT NOT NULL,
            report_json TEXT NOT NULL,
            report_markdown TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER NOT NULL,
            section TEXT NOT NULL,
            action_text TEXT NOT NULL,
            checked INTEGER DEFAULT 0,
            checked_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_actions_report ON actions(report_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_actions_checked ON actions(checked)")
    conn.commit()
    conn.close()


def save_report(goal: str, current_situation: str, report_json: Dict[str, Any], report_markdown: str) -> int:
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO reports (goal, current_situation, report_json, report_markdown) VALUES (?, ?, ?, ?)",
        (goal, current_situation, json.dumps(report_json), report_markdown)
    )
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return report_id


def get_all_reports() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, goal, created_at FROM reports ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [
        {"id": row["id"], "goal": row["goal"], "created_at": row["created_at"]}
        for row in rows
    ]


def get_report(report_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM reports WHERE id = ?", (report_id,)
    ).fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "goal": row["goal"],
            "current_situation": row["current_situation"],
            "report_json": json.loads(row["report_json"]),
            "report_markdown": row["report_markdown"],
            "created_at": row["created_at"]
        }
    return None


def delete_report(report_id: int) -> bool:
    conn = get_connection()
    conn.execute("DELETE FROM actions WHERE report_id = ?", (report_id,))
    cursor = conn.execute("DELETE FROM reports WHERE id = ?", (report_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


def search_reports(query: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, goal, created_at FROM reports WHERE goal LIKE ? OR current_situation LIKE ? ORDER BY created_at DESC",
        (f"%{query}%", f"%{query}%")
    ).fetchall()
    conn.close()
    return [
        {"id": row["id"], "goal": row["goal"], "created_at": row["created_at"]}
        for row in rows
    ]


def save_actions(report_id: int, section: str, action_texts: List[str]) -> None:
    conn = get_connection()
    for text in action_texts:
        conn.execute(
            "INSERT INTO actions (report_id, section, action_text) VALUES (?, ?, ?)",
            (report_id, section, text.strip())
        )
    conn.commit()
    conn.close()


def toggle_action(action_id: int, checked: bool) -> Dict[str, Any]:
    conn = get_connection()
    now = datetime.now().isoformat() if checked else None
    conn.execute(
        "UPDATE actions SET checked = ?, checked_at = ? WHERE id = ?",
        (1 if checked else 0, now, action_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM actions WHERE id = ?", (action_id,)).fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "report_id": row["report_id"],
            "section": row["section"],
            "action_text": row["action_text"],
            "checked": bool(row["checked"]),
            "checked_at": row["checked_at"]
        }
    return None


def get_actions_for_report(report_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM actions WHERE report_id = ? ORDER BY id", (report_id,)
    ).fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "report_id": row["report_id"],
            "section": row["section"],
            "action_text": row["action_text"],
            "checked": bool(row["checked"]),
            "checked_at": row["checked_at"]
        }
        for row in rows
    ]


def get_action_history() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("""
        SELECT a.*, r.goal 
        FROM actions a 
        JOIN reports r ON a.report_id = r.id 
        WHERE a.checked = 1 
        ORDER BY a.checked_at DESC 
        LIMIT 200
    """).fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "report_id": row["report_id"],
            "section": row["section"],
            "action_text": row["action_text"],
            "checked_at": row["checked_at"],
            "goal": row["goal"]
        }
        for row in rows
    ]


def get_analytics() -> Dict[str, Any]:
    conn = get_connection()
    total_goals = conn.execute("SELECT COUNT(*) as c FROM reports").fetchone()["c"]
    total_actions = conn.execute("SELECT COUNT(*) as c FROM actions").fetchone()["c"]
    completed_actions = conn.execute("SELECT COUNT(*) as c FROM actions WHERE checked=1").fetchone()["c"]
    completion_rate = round((completed_actions / total_actions * 100), 1) if total_actions > 0 else 0

    # Action sections breakdown
    sections_row = conn.execute("""
        SELECT section, COUNT(*) as c, SUM(checked) as done 
        FROM actions GROUP BY section ORDER BY c DESC
    """).fetchall()

    # Average time to first action (hours from report creation to first action check)
    avg_time = conn.execute("""
        SELECT AVG(
            (julianday(a.checked_at) - julianday(r.created_at)) * 24
        ) as avg_hours
        FROM actions a 
        JOIN reports r ON a.report_id = r.id 
        WHERE a.checked = 1
    """).fetchone()["avg_hours"]

    # Goals over time (per day)
    goals_over_time = conn.execute("""
        SELECT DATE(created_at) as day, COUNT(*) as c 
        FROM reports GROUP BY day ORDER BY day DESC LIMIT 30
    """).fetchall()

    conn.close()
    return {
        "total_goals": total_goals,
        "total_actions": total_actions,
        "completed_actions": completed_actions,
        "completion_rate": completion_rate,
        "avg_time_to_first_action": round(avg_time, 1) if avg_time else 0,
        "section_breakdown": [
            {"section": r["section"], "count": r["c"], "completed": r["done"]}
            for r in sections_row
        ],
        "goals_over_time": [
            {"day": r["day"], "count": r["c"]} for r in goals_over_time
        ]
    }


def get_calendar_data() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("""
        SELECT r.id, r.goal, r.created_at, 
               COUNT(a.id) as total_actions,
               SUM(a.checked) as completed_actions
        FROM reports r
        LEFT JOIN actions a ON a.report_id = r.id
        GROUP BY r.id
        ORDER BY r.created_at DESC
    """).fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "goal": row["goal"],
            "created_at": row["created_at"],
            "total_actions": row["total_actions"],
            "completed_actions": row["completed_actions"] or 0
        }
        for row in rows
    ]
