from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class ContractorRegister(BaseModel):
    email: str
    password: str
    company_name: str
    specialties: List[str] = []
    service_zip_codes: List[str] = []
    phone: str = ""
    description: str = ""
    latitude: float = 0.0
    longitude: float = 0.0


class ContractorLogin(BaseModel):
    email: str
    password: str


class ContractorUpdate(BaseModel):
    company_name: Optional[str] = None
    specialties: Optional[List[str]] = None
    service_zip_codes: Optional[List[str]] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class LeadCreate(BaseModel):
    name: str
    phone: str
    email: str
    zip_code: str
    project_description: str = ""
    selected_design_style: str = ""
    room_photo: str = ""
    project_id: Optional[str] = None
    contractor_id: Optional[str] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_type: str
    zip_code: str
    budget: Optional[str] = None
    status: str
    created_at: str
    original_image: Optional[str] = None
    additional_images: List[str] = []
    designs: List[dict] = []
    cost_estimate: Optional[dict] = None


class VoteData(BaseModel):
    design_index: int


class AdminLogin(BaseModel):
    password: str
