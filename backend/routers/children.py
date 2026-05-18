from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas

router = APIRouter()

@router.post("/", response_model=schemas.ChildResponse)
def create_child(child: schemas.ChildCreate, db: Session = Depends(get_db)):
    return crud.create_child(db, child)

@router.get("/", response_model=list[schemas.ChildResponse])
def list_children(db: Session = Depends(get_db)):
    return crud.get_all_children(db)

@router.get("/{child_id}", response_model=schemas.ChildResponse)
def get_child(child_id: int, db: Session = Depends(get_db)):
    child = crud.get_child(db, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child

@router.put("/{child_id}", response_model=schemas.ChildResponse)
def update_child(child_id: int, update: schemas.ChildUpdate, db: Session = Depends(get_db)):
    child = crud.update_child(db, child_id, update)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child

@router.delete("/{child_id}")
def delete_child(child_id: int, db: Session = Depends(get_db)):
    child = crud.delete_child(db, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return {"message": f"Child profile deleted"}

@router.post("/{child_id}/notes")
def add_note(child_id: int, note_data: schemas.CaregiverNoteCreate, db: Session = Depends(get_db)):
    note = crud.add_caregiver_note(db, child_id, note_data.note, note_data.category)
    return {"id": note.id, "note": note.note, "category": note.category}
