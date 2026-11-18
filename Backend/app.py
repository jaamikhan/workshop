import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from postgrest import APIError
from supabase import Client, create_client

load_dotenv()

app = Flask(__name__)

# Public API: browsers on any origin may call these endpoints.
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY")
supabase: Client | None = (
    create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
)


def database_error(error):
    return jsonify({"error": "Database request failed", "details": str(error)}), 500


def require_database():
    if supabase is None:
        return jsonify({"error": "Database is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY."}), 503
    return None


@app.get("/")
def index():
    return jsonify({"message": "Events API", "endpoints": [
        "GET /api/events",
        "GET /api/events/<id>",
        "GET /api/users?role=<student|organizer|admin>",
        "POST /api/registrations",
        "GET /api/me/registrations?user_id=<uuid>",
        "GET /api/events/<id>/registrations?user_id=<organizer_uuid>",
    ]})


@app.get("/api/users")
def list_users():
    unavailable = require_database()
    if unavailable:
        return unavailable
    role = request.args.get("role", "").strip().lower()
    if role not in ("student", "organizer", "organiser", "admin"):
        return jsonify({"error": "role must be student, organizer, or admin"}), 400
    try:
        query = supabase.table("users").select("id,role")
        query = query.in_("role", ["organizer", "organiser"]) if role in ("organizer", "organiser") else query.eq("role", role)
        response = query.order("id").limit(500).execute()
        return jsonify({"users": response.data})
    except APIError as error:
        return database_error(error)


@app.get("/api/events")
def list_events():
    unavailable = require_database()
    if unavailable:
        return unavailable
    try:
        query = supabase.table("events").select("*")
        status = request.args.get("status")
        if status:
            query = query.eq("status", status)
        response = query.execute()
        return jsonify({"events": response.data})
    except APIError as error:
        return database_error(error)


@app.get("/api/events/<event_id>")
def get_event(event_id):
    unavailable = require_database()
    if unavailable:
        return unavailable
    try:
        response = supabase.table("events").select("*").eq("id", event_id).maybe_single().execute()
        if not response.data:
            return jsonify({"error": "Event not found"}), 404
        return jsonify({"event": response.data})
    except APIError as error:
        return database_error(error)


@app.post("/api/registrations")
def create_registration():
    unavailable = require_database()
    if unavailable:
        return unavailable
    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id")
    event_id = payload.get("event_id")
    if not user_id or not event_id:
        return jsonify({"error": "user_id and event_id are required"}), 400

    try:
        existing = (supabase.table("registrations").select("id")
                    .eq("user_id", user_id).eq("event_id", event_id).maybe_single().execute())
        if existing.data:
            return jsonify({"error": "Already registered", "registration": existing.data}), 409

        event_response = supabase.table("events").select("id,capacity,status").eq("id", event_id).maybe_single().execute()
        if not event_response.data:
            return jsonify({"error": "Event not found"}), 404
        if event_response.data.get("status", "").lower() not in ("open", "published", "active"):
            return jsonify({"error": "Event is not open for registration"}), 409

        capacity = event_response.data.get("capacity")
        if capacity is not None:
            count_response = supabase.table("registrations").select("id", count="exact").eq("event_id", event_id).execute()
            if count_response.count is not None and count_response.count >= capacity:
                return jsonify({"error": "Event is at capacity"}), 409

        created = supabase.table("registrations").insert({"user_id": user_id, "event_id": event_id}).execute()
        registration = created.data[0] if created.data else None
        return jsonify({"registration": registration}), 201
    except APIError as error:
        # Also translate a concurrent duplicate insert / unique constraint failure.
        message = str(error).lower()
        if "duplicate" in message or "unique" in message or "23505" in message:
            return jsonify({"error": "Already registered"}), 409
        return database_error(error)


@app.get("/api/me/registrations")
def my_registrations():
    unavailable = require_database()
    if unavailable:
        return unavailable
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id query parameter is required"}), 400
    try:
        response = (supabase.table("registrations").select("*, events(*)")
                    .eq("user_id", user_id).execute())
        return jsonify({"registrations": response.data})
    except APIError as error:
        return database_error(error)


@app.get("/api/events/<event_id>/registrations")
def event_registrations(event_id):
    unavailable = require_database()
    if unavailable:
        return unavailable
    # With auth intentionally disabled, organizer identity is a caller-supplied claim.
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id query parameter is required"}), 400
    try:
        event_response = supabase.table("events").select("id,organizer_id").eq("id", event_id).maybe_single().execute()
        if not event_response.data:
            return jsonify({"error": "Event not found"}), 404
        if event_response.data.get("organizer_id") != user_id:
            return jsonify({"error": "Only the event organizer can view attendees"}), 403
        response = (supabase.table("registrations").select("*, users(id,email,role)")
                    .eq("event_id", event_id).execute())
        return jsonify({"registrations": response.data})
    except APIError as error:
        return database_error(error)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "10000")))
