from pydantic import BaseModel

class AddToListRequest(BaseModel):
    media_id: int
    status: str = "PLANNING"
