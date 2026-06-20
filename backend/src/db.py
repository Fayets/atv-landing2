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
    db.generate_mapping(create_tables=True)
