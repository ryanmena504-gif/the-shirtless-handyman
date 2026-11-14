"""
Database connection for the website API.

Two modes:

* MONGO_URL is set (recommended): a real MongoDB, e.g. a free MongoDB Atlas
  M0 cluster. Leads, bookings, chat history, the admin inbox, and the
  calendar's booked-slot checks all persist across restarts.

* MONGO_URL is NOT set: an in-memory database (mongomock-motor). The site
  still works end to end, and every lead is still delivered to Airtable /
  email / SMS by the notification code, but anything stored only in the
  database (admin inbox history, booked calendar slots, chat history,
  scheduled follow-up emails) is wiped whenever the server restarts.
  This keeps the forms working at $0 before a database is set up.

DB_NAME defaults to "shirtless_handyman" so it does not have to be set.
"""
import logging
import os

logger = logging.getLogger(__name__)

MONGO_URL = (os.environ.get("MONGO_URL") or "").strip()
DB_NAME = (os.environ.get("DB_NAME") or "shirtless_handyman").strip()
IN_MEMORY = not MONGO_URL

if IN_MEMORY:
    from mongomock_motor import AsyncMongoMockClient

    logger.warning(
        "MONGO_URL is not set — using an IN-MEMORY database. Leads are still "
        "delivered to Airtable/email/SMS, but stored data resets on restart. "
        "Set MONGO_URL (free MongoDB Atlas M0) to keep data."
    )
    client = AsyncMongoMockClient()
else:
    from motor.motor_asyncio import AsyncIOMotorClient

    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=8000)

db = client[DB_NAME]


def open_thread_db():
    """Return (client, db) for work that runs on a separate thread/event loop.

    A real Mongo gets its own client per thread (Motor clients are bound to an
    event loop). The in-memory DB cannot be shared through a second client, so
    the shared one is reused and close() becomes a no-op.
    """
    if IN_MEMORY:
        class _NoClose:
            def close(self):
                pass
        return _NoClose(), db
    from motor.motor_asyncio import AsyncIOMotorClient

    c = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=8000)
    return c, c[DB_NAME]
