#!/usr/bin/env python3
"""Build the master dashboard's real-data mock from the master CSV exports.

    python3 scripts/build-dashboard-fixture.py <warranties.csv> <claims.csv>

Writes src/mocks/dashboardFixture.json (gitignored) for VITE_DASHBOARD_SOURCE=mock. Only the
fields the dashboard aggregates are kept - timestamps, status, brand, quantity, rejection reason.
No names, phone numbers, emails, car plates, IDs or receipt/document links are copied.

Brand normalisation matches the backend (tayaria-warranty-be/db/dashboard.go): '', 'Unknown'
and missing brands become null ("not recorded"). Resolution time is date_settled, falling back
to updated_at for approved/rejected claims without one.
"""
import csv
import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "mocks" / "dashboardFixture.json"


def brand(value):
    v = (value or "").strip()
    return None if not v or v.lower() == "unknown" else v


def text(value):
    v = (value or "").strip()
    return v or None


def rows(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def main(warranties_csv, claims_csv):
    warranties = sorted(
        [[r["created_at"], brand(r.get("brand"))] for r in rows(warranties_csv)],
        key=lambda w: w[0],
    )

    claims = []
    for r in rows(claims_csv):
        status = r["status"].strip()
        resolved = text(r.get("date_settled")) or (text(r.get("updated_at")) if status in ("approved", "rejected") else None)
        quantity = text(r.get("quantity"))
        claims.append([
            r["created_at"],
            resolved if status in ("approved", "rejected") else None,
            status,
            brand(r.get("brand")),
            int(quantity) if quantity else None,
            text(r.get("rejection_reason")),
        ])
    claims.sort(key=lambda c: c[0])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"warranties": warranties, "claims": claims}, separators=(",", ":")))
    branded = sum(1 for w in warranties if w[1])
    print(f"Wrote {OUT.relative_to(Path.cwd()) if OUT.is_relative_to(Path.cwd()) else OUT}: "
          f"{len(warranties)} warranties ({branded} with brand), {len(claims)} claims")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
