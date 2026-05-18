from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud

router = APIRouter()

@router.get("/{child_id}")
def get_dashboard(child_id: int, db: Session = Depends(get_db)):
    data = crud.get_dashboard_data(db, child_id)
    if not data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return data
