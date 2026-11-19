import os
from uuid import UUID

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from postgrest import APIError
from supabase import Client, create_client

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()

app = Flask(__name__)


# ---------------------------------------------------------
# CORS Preflight and Header Handlers
# ---------------------------------------------------------
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, X-Requested-With"
        return response


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, X-Requested-With"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


# ---------------------------------------------------------
# Supabase Client Setup
# ---------------------------------------------------------
supabase_url = os.environ.get("SUPABASE_URL")
# Use a server-only key for database writes protected by Row Level Security.
supabase_key = (
    os.environ.get("SUPABASE_SECRET_KEY")
    or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_PUBLISHABLE_KEY")
)

supabase: Client | None = (
    create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
)


def handle_db_error(error):
    """Map database errors to descriptive, user-friendly HTTP responses instead of crashing with 500."""
    app.logger.error("Database request failed: %s", error)
    err_str = str(error).lower()

    # Duplicate / Unique violation
    if "23505" in err_str or "duplicate" in err_str or "unique" in err_str:
        return jsonify({"error": "Already registered", "message": "You are already registered for this event."}), 409

    # Foreign key violation
    if "23503" in err_str or "foreign key" in err_str:
        if "user_id" in err_str:
            return jsonify({"error": "User not found", "message": "The specified user ID does not exist."}), 404
        if "event_id" in err_str:
            return jsonify({"error": "Event not found", "message": "The specified event does not exist."}), 404
        return jsonify({"error": "Reference error", "message": "The referenced user or event was not found."}), 400

    # Invalid UUID syntax in query
    if "22p02" in err_str or "invalid input syntax" in err_str:
        return jsonify({"error": "Invalid identifier", "message": "A provided UUID was malformed."}), 400

    # Row-Level Security / Permission denied
    if "42501" in err_str or "permission denied" in err_str:
        return jsonify({"error": "Permission denied", "message": "Database permission denied for this operation."}), 403

    # PostgREST single-object coercion error (multiple rows found)
    if "pgrst116" in err_str or "cannot coerce" in err_str or "more than one row" in err_str:
        return jsonify({"error": "Already registered", "message": "You are already registered for this event."}), 409

    # Database connection / temporary outage
    return jsonify({
        "error": "Database service unavailable",
        "message": "The database is currently unreachable or busy. Please try again shortly."
    }), 503


def require_database():
    if supabase is None:
        return jsonify({
            "error": "Database is not configured",
            "message": "SUPABASE_URL and SUPABASE_SECRET_KEY must be set."
        }), 503
    return None


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------
@app.route("/", methods=["GET", "OPTIONS"])
def index():
    return jsonify({
        "message": "Events API",
        "status": "online",
        "endpoints": [
            "GET /api/events",
            "GET /api/events/<id>",
            "GET /api/users?role=<student|organizer|admin>",
            "POST /api/registrations",
            "GET /api/me/registrations?user_id=<uuid>",
            "GET /api/events/<id>/registrations?user_id=<organizer_uuid>",
        ]
    })


@app.route("/api/users", methods=["GET", "OPTIONS"])
def list_users():
    unavailable = require_database()
    if unavailable:
        return unavailable

    role = request.args.get("role", "").strip().lower()
    if role not in ("student", "organizer", "organiser", "admin"):
        return jsonify({"error": "role must be student, organizer, or admin"}), 400

    try:
        query = supabase.table("users").select("id,role,email")
        if role in ("organizer", "organiser"):
            query = query.in_("role", ["organizer", "organiser"])
        elif role == "student":
            query = query.in_("role", ["student", "attendee"])
        else:
            query = query.eq("role", role)
        response = query.order("id").limit(500).execute()
        return jsonify({"users": response.data})
    except Exception as error:
        return handle_db_error(error)


@app.route("/api/events", methods=["GET", "OPTIONS"])
def list_events():
    unavailable = require_database()
    if unavailable:
        return unavailable

    try:
        # Fetch events along with the current registration count
        query = supabase.table("events").select("*, registrations(count)")
        status = request.args.get("status")
        if status:
            query = query.eq("status", status)

        response = query.order("id").execute()
        events = []
        for item in (response.data or []):
            event = dict(item)
            regs = event.pop("registrations", [])
            reg_count = 0
            if isinstance(regs, list) and len(regs) > 0 and isinstance(regs[0], dict):
                reg_count = int(regs[0].get("count", 0))
            event["registration_count"] = reg_count
            event["attendee_count"] = reg_count
            events.append(event)

        return jsonify({"events": events})
    except Exception as error:
        app.logger.warning("Event list with count relation failed, falling back: %s", error)
        try:
            fallback = supabase.table("events").select("*").order("id").execute()
            return jsonify({"events": fallback.data or []})
        except Exception as fb_err:
            return handle_db_error(fb_err)


@app.route("/api/events/<event_id>", methods=["GET", "OPTIONS"])
def get_event(event_id):
    unavailable = require_database()
    if unavailable:
        return unavailable

    try:
        clean_id = str(UUID(str(event_id)))
    except (ValueError, TypeError, AttributeError):
        return jsonify({"error": "Event not found"}), 404

    try:
        response = (
            supabase.table("events")
            .select("*, registrations(count)")
            .eq("id", clean_id)
            .limit(1)
            .execute()
        )
        if not response.data or len(response.data) == 0:
            return jsonify({"error": "Event not found"}), 404

        event = dict(response.data[0])
        regs = event.pop("registrations", [])
        reg_count = 0
        if isinstance(regs, list) and len(regs) > 0 and isinstance(regs[0], dict):
            reg_count = int(regs[0].get("count", 0))
        event["registration_count"] = reg_count
        event["attendee_count"] = reg_count
        return jsonify({"event": event})
    except Exception as error:
        return handle_db_error(error)


@app.route("/api/registrations", methods=["POST", "OPTIONS"])
def create_registration():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    unavailable = require_database()
    if unavailable:
        return unavailable

    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id")
    event_id = payload.get("event_id")

    if not user_id or not event_id:
        return jsonify({"error": "user_id and event_id are required"}), 400

    try:
        user_uuid = str(UUID(str(user_id)))
        event_uuid = str(UUID(str(event_id)))
    except (ValueError, TypeError, AttributeError):
        return jsonify({"error": "user_id and event_id must be valid UUIDs"}), 400

    try:
        # Check if user has already registered using limit(1) instead of maybe_single()
        existing = (
            supabase.table("registrations")
            .select("id")
            .eq("user_id", user_uuid)
            .eq("event_id", event_uuid)
            .limit(1)
            .execute()
        )
        if existing.data and len(existing.data) > 0:
            return jsonify({"error": "Already registered", "registration": existing.data[0]}), 409

        # Fetch event details and verify it is open
        event_res = (
            supabase.table("events")
            .select("id,capacity,status")
            .eq("id", event_uuid)
            .limit(1)
            .execute()
        )
        if not event_res.data or len(event_res.data) == 0:
            return jsonify({"error": "Event not found"}), 404

        event_data = event_res.data[0]
        event_status = str(event_data.get("status", "")).lower()
        if event_status not in ("open", "published", "active"):
            return jsonify({"error": "Event is not open for registration"}), 409

        # Verify capacity
        capacity = event_data.get("capacity")
        if capacity is not None and capacity > 0:
            count_response = (
                supabase.table("registrations")
                .select("id", count="exact")
                .eq("event_id", event_uuid)
                .execute()
            )
            current_count = count_response.count if count_response.count is not None else 0
            if current_count >= capacity:
                return jsonify({"error": "Event is at capacity"}), 409

        # Verify user exists in users table to prevent foreign key errors
        user_check = (
            supabase.table("users")
            .select("id")
            .eq("id", user_uuid)
            .limit(1)
            .execute()
        )
        if not user_check.data or len(user_check.data) == 0:
            return jsonify({"error": "User not found", "message": "The selected user ID does not exist in the database."}), 404

        # Insert new registration
        created = (
            supabase.table("registrations")
            .insert({"user_id": user_uuid, "event_id": event_uuid})
            .execute()
        )
        registration = created.data[0] if (created.data and len(created.data) > 0) else {"user_id": user_uuid, "event_id": event_uuid}
        return jsonify({"registration": registration}), 201

    except APIError as error:
        return handle_db_error(error)
    except Exception as error:
        app.logger.exception("Unexpected registration failure: %s", error)
        return handle_db_error(error)


@app.route("/api/me/registrations", methods=["GET", "OPTIONS"])
def my_registrations():
    unavailable = require_database()
    if unavailable:
        return unavailable

    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id query parameter is required"}), 400

    try:
        clean_user_id = str(UUID(str(user_id)))
    except (ValueError, TypeError, AttributeError):
        return jsonify({"error": "user_id must be a valid UUID"}), 400

    try:
        response = (
            supabase.table("registrations")
            .select("*, events(*)")
            .eq("user_id", clean_user_id)
            .execute()
        )
        return jsonify({"registrations": response.data or []})
    except Exception as error:
        return handle_db_error(error)


@app.route("/api/events/<event_id>/registrations", methods=["GET", "OPTIONS"])
def event_registrations(event_id):
    unavailable = require_database()
    if unavailable:
        return unavailable

    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id query parameter is required"}), 400

    try:
        clean_event_id = str(UUID(str(event_id)))
        clean_user_id = str(UUID(str(user_id)))
    except (ValueError, TypeError, AttributeError):
        return jsonify({"error": "event_id and user_id must be valid UUIDs"}), 400

    try:
        event_response = (
            supabase.table("events")
            .select("id,organizer_id")
            .eq("id", clean_event_id)
            .limit(1)
            .execute()
        )
        if not event_response.data or len(event_response.data) == 0:
            return jsonify({"error": "Event not found"}), 404

        if event_response.data[0].get("organizer_id") != clean_user_id:
            return jsonify({"error": "Only the event organizer can view attendees"}), 403

        response = (
            supabase.table("registrations")
            .select("*, users(id,email,role)")
            .eq("event_id", clean_event_id)
            .execute()
        )
        return jsonify({"registrations": response.data or []})
    except Exception as error:
        return handle_db_error(error)


# ---------------------------------------------------------
# Global Error Handlers (Always return structured JSON, never HTML)
# ---------------------------------------------------------
@app.errorhandler(400)
def bad_request_handler(e):
    return jsonify({"error": "Bad request", "message": str(e)}), 400


@app.errorhandler(404)
def not_found_handler(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed_handler(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_server_error_handler(e):
    app.logger.error("Internal server error: %s", e)
    return jsonify({"error": "Internal server error", "message": "An unexpected error occurred."}), 500


@app.errorhandler(Exception)
def unhandled_exception_handler(e):
    app.logger.exception("Unhandled application error: %s", e)
    return jsonify({"error": "Service temporarily unavailable", "message": str(e)}), 503


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "10000")))
