from pony.orm import Required, Optional, Set
from datetime import datetime
from src.db import db, DB_SCHEMA


class Lead(db.Entity):
    _table_ = (DB_SCHEMA, "leads")

    name         = Required(str)
    email        = Required(str)
    phone        = Required(str)

    # Respuestas del quiz
    situation    = Optional(str)   # P1: situación actual
    revenue      = Optional(str)   # P2: facturación actual
    obstacle     = Optional(str)   # P3: mayor obstáculo
    niche        = Optional(str)   # P4: nicho

    # Metadata
    created_at   = Required(datetime, default=datetime.utcnow)
    contacted    = Required(bool, default=False)
    notes        = Optional(str)
