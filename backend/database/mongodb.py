import os
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logger = logging.getLogger("UniAssistAI.Database")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "university_chatbot")

class FallbackCollection:
    """
    In-memory fallback collection for graceful offline execution
    when MongoDB is not running locally or credentials are not yet entered.
    Ensures the demo/viva never crashes.
    """
    def __init__(self, name: str):
        self.name = name
        self._data = []

    async def find_one(self, filter_dict: dict):
        for doc in self._data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    async def insert_one(self, document: dict):
        import uuid
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        self._data.append(doc)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc["_id"])

    async def update_one(self, filter_dict: dict, update_dict: dict, upsert: bool = False):
        set_vals = update_dict.get("$set", {})
        inc_vals = update_dict.get("$inc", {})
        for doc in self._data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                for sk, sv in set_vals.items():
                    doc[sk] = sv
                for ik, iv in inc_vals.items():
                    doc[ik] = doc.get(ik, 0) + iv
                class UpdateResult:
                    matched_count = 1
                    modified_count = 1
                return UpdateResult()

        if upsert:
            import uuid
            new_doc = dict(filter_dict)
            new_doc["_id"] = str(uuid.uuid4())
            new_doc.update(set_vals)
            self._data.append(new_doc)
            class UpsertResult:
                matched_count = 0
                modified_count = 1
                upserted_id = new_doc["_id"]
            return UpsertResult()

        class UpdateResultZero:
            matched_count = 0
            modified_count = 0
        return UpdateResultZero()

    async def delete_one(self, filter_dict: dict):
        for i, doc in enumerate(self._data):
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                del self._data[i]
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        class DeleteResultZero:
            deleted_count = 0
        return DeleteResultZero()

    async def delete_many(self, filter_dict: dict):
        count = 0
        kept = []
        for doc in self._data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                count += 1
            else:
                kept.append(doc)
        self._data = kept
        class DeleteResult:
            def __init__(self, c):
                self.deleted_count = c
        return DeleteResult(count)

    def find(self, filter_dict: dict = None):
        if filter_dict is None:
            filter_dict = {}
        matched = []
        for doc in self._data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(dict(doc))
        
        class Cursor:
            def __init__(self, items):
                self.items = items
            def sort(self, field, direction=-1):
                # Reverse sort if direction is -1
                rev = (direction == -1)
                try:
                    self.items.sort(key=lambda x: x.get(field, ""), reverse=rev)
                except Exception:
                    pass
                return self
            def limit(self, n):
                self.items = self.items[:n]
                return self
            async def to_list(self, length=100):
                return self.items[:length]
            def __aiter__(self):
                self._iter = iter(self.items)
                return self
            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration

        return Cursor(matched)


class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False
        self._fallback_mode = False
        self._fallback_collections = {}

    async def connect(self):
        """Attempt connection to MongoDB with timeout."""
        mongodb_uri = os.getenv("MONGODB_URI", MONGODB_URI)
        db_name = os.getenv("DATABASE_NAME", DATABASE_NAME)
        try:
            logger.info(f"Connecting to MongoDB database '{db_name}'...")
            client_kwargs = {
                "serverSelectionTimeoutMS": 5000,
                "connectTimeoutMS": 5000,
            }
            try:
                import certifi
                client_kwargs["tlsCAFile"] = certifi.where()
            except ImportError:
                pass

            self.client = AsyncIOMotorClient(mongodb_uri, **client_kwargs)
            # Ping database to verify connection
            await self.client.admin.command('ping')
            self.db = self.client[db_name]
            self.is_connected = True
            self._fallback_mode = False
            logger.info("Successfully connected to MongoDB.")
        except Exception as e:
            logger.warning(
                f"MongoDB connection failed: {e}. "
                "Activating in-memory fallback database for development/evaluation. "
                "To persist data across restarts, configure MONGODB_URI in backend/.env with a valid MongoDB Atlas connection string."
            )
            self.is_connected = False
            self._fallback_mode = True

    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            return self.db[name]
        
        if name not in self._fallback_collections:
            self._fallback_collections[name] = FallbackCollection(name)
        return self._fallback_collections[name]

    @property
    def users(self):
        return self.get_collection("users")

    @property
    def otp_verifications(self):
        return self.get_collection("otp_verifications")

    @property
    def chat_messages(self):
        return self.get_collection("chat_messages")

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")


db_manager = DatabaseManager()
