from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_audit():
    print("=== Testing Core Root Endpoints ===")
    r = client.get("/")
    assert r.status_code == 200
    print("GET / ->", r.status_code, r.json())

    r = client.get("/health")
    assert r.status_code == 200
    print("GET /health ->", r.status_code, r.json())

    print("\n=== Testing Customer Endpoints ===")
    r = client.get("/api/customers/")
    assert r.status_code == 200
    data = r.json()
    print("GET /api/customers/ ->", r.status_code, f"Total customers: {data.get('total')}")
    assert data.get("total") == 10

    r = client.get("/api/customers/1")
    assert r.status_code == 200
    print("GET /api/customers/1 ->", r.status_code, r.json().get("name"))

    r = client.get("/api/customers/999")
    assert r.status_code == 404
    print("GET /api/customers/999 ->", r.status_code, r.json())

    print("\n=== Testing Recovery Decision Endpoints ===")
    # Payment 1 (Sarah Jenkins - Insufficient Funds, Failed, Approved)
    r = client.get("/api/recovery/decision/1")
    assert r.status_code == 200
    print("GET /api/recovery/decision/1 (Eligible failed) ->", r.status_code, r.json()["decision"]["recommended_action"])

    # Payment 6 (Thomas Wright - Card Expired, Failed, Opted Out)
    r = client.get("/api/recovery/decision/6")
    assert r.status_code == 200
    print("GET /api/recovery/decision/6 (Opted out) ->", r.status_code, r.json()["decision"]["recommended_action"])
    assert r.json()["decision"]["recommended_action"] == "suppress"
    assert r.json()["decision"]["eligible_for_outreach"] is False

    # Payment 4 (David Kim - Payment Timeout, Recovered, Approved)
    r = client.get("/api/recovery/decision/4")
    assert r.status_code == 200
    print("GET /api/recovery/decision/4 (Already recovered) ->", r.status_code, r.json()["decision"]["recommended_action"])
    assert r.json()["decision"]["recommended_action"] == "no_action"
    assert r.json()["decision"]["eligible_for_outreach"] is False

    # Payment 999 (Invalid ID)
    r = client.get("/api/recovery/decision/999")
    assert r.status_code == 404
    print("GET /api/recovery/decision/999 (Invalid payment ID) ->", r.status_code, r.json())

    print("\nALL AUDIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_audit()

