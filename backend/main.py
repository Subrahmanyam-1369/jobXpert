import os
from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import jwt
from passlib.context import CryptContext
from .db import Base, engine, get_db
from .models import User, Resume, Job, JobStatus

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


from fastapi import UploadFile, File, Header
from uuid import uuid4

class ResumeOut(BaseModel):
    id: int
    user_id: int
    path: str
    uploaded_at: datetime
    class Config:
        orm_mode = True

def get_current_user(db: Session = Depends(get_db), authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split()[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(int(payload.get("sub")))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user

@app.post("/resumes/upload", response_model=ResumeOut)
async def upload_resume(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in {"pdf", "txt"}:
        raise HTTPException(status_code=400, detail="Invalid file type")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    user_dir = os.path.join("backend", "uploads", str(user.id))
    os.makedirs(user_dir, exist_ok=True)
    name = f"{uuid4()}.{ext}"
    path = os.path.join(user_dir, name)
    with open(path, "wb") as f:
        f.write(data)
    resume = Resume(user_id=user.id, path=path, uploaded_at=datetime.utcnow())
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

@app.get("/resumes", response_model=list[ResumeOut])
def list_resumes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Resume).filter(Resume.user_id == user.id).all()

class JobBase(BaseModel):
    company: str | None = None
    role: str | None = None
    link: str | None = None
    status: JobStatus | None = JobStatus.applied
    applied_at: datetime | None = None
    notes: str | None = None

class JobCreate(JobBase):
    company: str
    role: str

class JobUpdate(JobBase):
    pass

class JobRead(JobBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

@app.post("/jobs", response_model=JobRead)
def create_job(data: JobCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = Job(user_id=user.id, **data.dict(exclude_unset=True))
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@app.get("/jobs", response_model=list[JobRead])
def list_jobs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Job).filter(Job.user_id == user.id).all()

@app.get("/jobs/{job_id}", response_model=JobRead)
def get_job(job_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.put("/jobs/{job_id}", response_model=JobRead)
def update_job(job_id: int, data: JobUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(job, k, v)
    db.commit()
    db.refresh(job)
    return job

@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"ok": True}
