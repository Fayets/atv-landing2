"""
Prueba final: intro VSL solo para leads nuevos (1 vez), leads viejos sin intro.
Correr desde backend/: python scripts/test_intro_flow.py
"""
from datetime import datetime
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pony.orm import db_session
from src.db import init_db, db
from src.models import Lead
from src.services.leads_services import LeadsServices
from src.schemas import LoginRequest

NEW_CODE = "ATV-TEST-NEW"
OLD_CODE = "ATV-TEST-OLD"

def pp(label, data):
    print(f"\n=== {label} ===")
    print(json.dumps(data, indent=2, default=str))

def main():
    init_db()
    svc = LeadsServices()
    results = []

    with db_session:
        # limpiar leftovers
        for code in (NEW_CODE, OLD_CODE):
            existing = Lead.get(access_code=code)
            if existing:
                existing.delete()
        db.commit()

        # Lead NUEVO: nunca entró
        Lead(
            name="Lead Nuevo Test",
            email="nuevo@test.local",
            phone="000",
            access_code=NEW_CODE,
            created_at=datetime.utcnow(),
            last_access=None,
        )
        # Lead VIEJO: ya entró antes
        Lead(
            name="Lead Viejo Test",
            email="viejo@test.local",
            phone="000",
            access_code=OLD_CODE,
            created_at=datetime.utcnow(),
            last_access=datetime(2026, 1, 1, 12, 0, 0),
        )
        db.commit()

    # 1) Lead viejo → NO first login
    r1 = svc.login(LoginRequest(access_code=OLD_CODE))
    pp("Lead VIEJO - login", r1)
    ok1 = r1 is not None and r1.get("is_first_login") is False
    results.append(("Viejo: is_first_login=False", ok1))

    # 2) Lead nuevo 1ra vez → first login
    r2 = svc.login(LoginRequest(access_code=NEW_CODE))
    pp("Lead NUEVO - 1er login", r2)
    ok2 = r2 is not None and r2.get("is_first_login") is True
    results.append(("Nuevo 1er login: is_first_login=True", ok2))

    # 3) Lead nuevo 2da vez → ya no first login
    r3 = svc.login(LoginRequest(access_code=NEW_CODE))
    pp("Lead NUEVO - 2do login", r3)
    ok3 = r3 is not None and r3.get("is_first_login") is False
    results.append(("Nuevo 2do login: is_first_login=False", ok3))

    # 4) Clave inválida
    r4 = svc.login(LoginRequest(access_code="NO-EXISTE-XYZ"))
    ok4 = r4 is None
    results.append(("Clave inválida: None", ok4))
    print(f"\n=== Clave inválida ===\n{r4}")

    # cleanup
    with db_session:
        for code in (NEW_CODE, OLD_CODE):
            existing = Lead.get(access_code=code)
            if existing:
                existing.delete()
        db.commit()

    print("\n========== RESUMEN ==========")
    all_ok = True
    for name, ok in results:
        mark = "OK" if ok else "FAIL"
        print(f"[{mark}] {name}")
        all_ok = all_ok and ok

    # Frontend logic simulation
    print("\n========== FRONTEND (simulación) ==========")

    def should_show_intro(user, storage):
        code = user.get("access_code")
        if not code:
            return False
        if storage.get(f"atv_intro_done_{code}"):
            return False
        return storage.get(f"atv_intro_pending_{code}") == "1"

    def simulate_login(user, storage):
        if user.get("is_first_login") and user.get("access_code"):
            storage[f"atv_intro_pending_{user['access_code']}"] = "1"
            storage.pop(f"atv_intro_done_{user['access_code']}", None)
            return "intro"
        if should_show_intro(user, storage):
            return "intro"
        return "contenido"

    def simulate_continue(user, storage):
        code = user["access_code"]
        storage[f"atv_intro_done_{code}"] = "1"
        storage.pop(f"atv_intro_pending_{code}", None)
        return "contenido"

    store = {}
    # Viejo
    dest = simulate_login({"access_code": OLD_CODE, "is_first_login": False}, store)
    ok_f1 = dest == "contenido" and not should_show_intro({"access_code": OLD_CODE}, store)
    print(f"[{'OK' if ok_f1 else 'FAIL'}] Viejo va a contenido (sin VSL)")
    all_ok = all_ok and ok_f1

    # Nuevo 1ra vez
    store2 = {}
    dest2 = simulate_login({"access_code": NEW_CODE, "is_first_login": True}, store2)
    ok_f2 = dest2 == "intro" and should_show_intro({"access_code": NEW_CODE}, store2)
    print(f"[{'OK' if ok_f2 else 'FAIL'}] Nuevo 1ra vez va a intro")
    all_ok = all_ok and ok_f2

    # Nuevo completa intro
    dest3 = simulate_continue({"access_code": NEW_CODE}, store2)
    ok_f3 = dest3 == "contenido" and not should_show_intro({"access_code": NEW_CODE}, store2)
    print(f"[{'OK' if ok_f3 else 'FAIL'}] Tras continuar, no vuelve a intro")
    all_ok = all_ok and ok_f3

    # Nuevo 2do login (is_first=false, done marcado)
    dest4 = simulate_login({"access_code": NEW_CODE, "is_first_login": False}, store2)
    ok_f4 = dest4 == "contenido"
    print(f"[{'OK' if ok_f4 else 'FAIL'}] Nuevo 2do login va a contenido")
    all_ok = all_ok and ok_f4

    # Nuevo cierra sin terminar intro → pending queda → sigue viendo intro
    store3 = {}
    simulate_login({"access_code": NEW_CODE, "is_first_login": True}, store3)
    dest5 = simulate_login({"access_code": NEW_CODE, "is_first_login": False}, store3)
    ok_f5 = dest5 == "intro"
    print(f"[{'OK' if ok_f5 else 'FAIL'}] Si no terminó intro, la vuelve a ver")
    all_ok = all_ok and ok_f5

    print("\n" + ("TODO OK ✅" if all_ok else "HAY FALLOS ❌"))
    sys.exit(0 if all_ok else 1)

if __name__ == "__main__":
    main()
