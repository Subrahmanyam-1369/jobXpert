import os
from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import jwt
from passlib.context import CryptContext
from .db import Base, engine, get_db
from .models import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"])
JWT_SECRET = os.getenv("JWT_SECRET", "secret")

class UserIn(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str

@app.get("/health")
async def health():
    return {"ok": True}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(minutes=60)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

@app.post("/auth/signup", response_model=Token)
def signup(data: UserIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email taken")
    user = User(email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id)
    return {"access_token": token}

@app.post("/auth/login", response_model=Token)
def login(data: UserIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
    token = create_token(user.id)
    return {"access_token": token}

