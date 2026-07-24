from pony.orm import Database
from decouple import config

db = Database()
DB_SCHEMA = config("DB_SCHEMA", default="landing")

def init_db():
    from src import models  # noqa: F401
    db.bind(
        provider="postgres",
        host=config("DB_HOST"),
        port=int(config("DB_PORT", default=5432)),
        database=config("DB_NAME"),
        user=config("DB_USER"),
        password=config("DB_PASSWORD"),
    )
    _migrate()
    db.generate_mapping(create_tables=True, check_tables=False)


def _migrate():
    import psycopg2
    from psycopg2 import sql

    conn = psycopg2.connect(
        host=config("DB_HOST"),
        port=int(config("DB_PORT", default=5432)),
        dbname=config("DB_NAME"),
        user=config("DB_USER"),
        password=config("DB_PASSWORD"),
    )
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                sql.SQL('ALTER TABLE {}.{} ADD COLUMN IF NOT EXISTS access_count INTEGER NOT NULL DEFAULT 0').format(
                    sql.Identifier(DB_SCHEMA),
                    sql.Identifier('leads'),
                )
            )
    finally:
        conn.close()
