import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Annotated
import sqlite3
import uuid
import shutil
from datetime import datetime, timedelta
import json
import google.generativeai as genai

# File processing imports
import PyPDF2
from docx import Document
import pandas as pd

# Updated AI imports
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import timedelta
from typing import Annotated
from fastapi.responses import StreamingResponse
import io

# Security setup
SECRET_KEY = "supersecretkey123456789"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# User database (replace with real DB in production)
fake_users_db = {
    "testuser": {
        "username": "testuser",
        "full_name": "Test User",
        "email": "test@example.com",
        "hashed_password": pwd_context.hash("testpassword"),
        "disabled": False,
    }
}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Initialize FastAPI app
app = FastAPI(title="Document Tutor API", version="2.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DATABASE_NAME = "document_tutor.db"
# Use environment variable for Gemini API key
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_KEY = "AIzaSyBgmhBzT5ZOPXyXTUNyPoBcElXTkejWx84"

# Initialize Gemini client
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize GenerativeModel with a specific model
model = genai.GenerativeModel("gemini-2.5-flash")


# Database models
class DocumentModel(BaseModel):
    id: str
    name: str
    type: str
    upload_date: str
    processed: bool


class ConceptModel(BaseModel):
    id: str
    document_id: str
    title: str
    explanation: str
    importance: str
    related_concepts: Optional[List[str]] = None


class FlashcardModel(BaseModel):
    id: str
    concept_id: Optional[str] = None
    document_id: str
    question: str
    answer: str
    difficulty: float = 1.0
    last_reviewed: Optional[str] = None
    correct_count: int = 0
    incorrect_count: int = 0


class FlashcardReview(BaseModel):
    correct: bool


# Progress tracking model
class StudyProgress(BaseModel):
    documents_studied: int
    concepts_learned: int
    flashcards_reviewed: int
    correct_answers: int
    total_answers: int
    streak_days: int

# Folder models
class Folder(BaseModel):
    id: str
    name: str
    user_id: str
    created_at: str

class DocumentFolder(BaseModel):
    document_id: str
    folder_id: str

# Database initialization
def init_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    # Documents table
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        processed BOOLEAN DEFAULT FALSE
    )
    """
    )

    # Concepts table
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS concepts (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        title TEXT NOT NULL,
        explanation TEXT NOT NULL,
        importance TEXT NOT NULL,
        related_concepts TEXT,
        FOREIGN KEY (document_id) REFERENCES documents (id)
    )
    """
    )

    # Flashcards table
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        concept_id TEXT,
        document_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty REAL DEFAULT 1.0,
        last_reviewed TEXT,
        correct_count INTEGER DEFAULT 0,
        incorrect_count INTEGER DEFAULT 0,
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (concept_id) REFERENCES concepts (id)
    )
    """
    )

    # Folders table
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """
    )
    # Document-Folder mapping table
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS document_folders (
        document_id TEXT NOT NULL,
        folder_id TEXT NOT NULL,
        PRIMARY KEY (document_id, folder_id),
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (folder_id) REFERENCES folders (id)
    )
    """
    )

    conn.commit()
    conn.close()


init_db()


# File processing functions
def process_pdf(file_path: str) -> str:
    text = ""
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    return text


def process_docx(file_path: str) -> str:
    try:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing DOCX: {str(e)}")


def process_csv(file_path: str) -> str:
    try:
        df = pd.read_csv(file_path)
        return df.to_string()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")


def process_txt(file_path: str) -> str:
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing TXT: {str(e)}")


# Text processing utilities
def split_text(
    text: str, chunk_size: int = 2000, chunk_overlap: int = 200
) -> List[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    return splitter.split_text(text)


# Updated AI processing functions using Gemini API
def extract_concepts(text: str, document_id: str) -> List[ConceptModel]:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    try:
        # Updated to use the Gemini client
        prompt = f"""
        Extract 3-5 key concepts from this text. For each concept provide:
        - A short title (max 50 characters)
        - A brief explanation (2-3 sentences)
        - Importance (high/medium/low)

        Respond with a JSON array only, no additional text:
        [
            {{
                "title": "Concept Title",
                "explanation": "Brief explanation of the concept",
                "importance": "high"
            }}
        ]

        Text: {text[:3000]}
        """
        response = model.generate_content(prompt)

        content = response.text.strip()
        print("Raw AI Response:", content)  # Debug

        # Parse JSON response
        try:
            # Clean the response to ensure it is valid JSON
            # The model might sometimes add backticks around the JSON
            if content.startswith("```json"):
                content = content[7:-4]
            concepts_data = json.loads(content)
            concepts = []
            for concept in concepts_data:
                concepts.append(
                    ConceptModel(
                        id=str(uuid.uuid4()),
                        document_id=document_id,
                        title=concept.get("title", "Untitled"),
                        explanation=concept.get("explanation", "No explanation"),
                        importance=concept.get("importance", "medium"),
                        related_concepts=[],
                    )
                )
            return concepts
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Response content: {content}")
            return []

    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return []


def generate_flashcards(
    concepts: List[ConceptModel], document_id: str
) -> List[FlashcardModel]:
    flashcards = []
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    for concept in concepts:
        try:
            prompt = f"""
            Create 2-3 flashcards for this concept. Follow these rules:
            1. Questions should test understanding, not just memory
            2. Answers should be concise but complete
            3. Avoid simple definition questions
            4. Make questions practical and application-based
            
            Concept:
            Title: {concept.title}
            Explanation: {concept.explanation}
            
            Respond with a JSON array only:
            [
                {{
                    "question": "Clear, specific question here?",
                    "answer": "Complete but concise answer here."
                }}
            ]
            """
            response = model.generate_content(prompt)

            content = response.text.strip()

            try:
                # The model might sometimes add backticks around the JSON
                if content.startswith("```json"):
                    content = content[7:-4]
                concept_flashcards = json.loads(content)
                for card in concept_flashcards:
                    flashcard = FlashcardModel(
                        id=str(uuid.uuid4()),
                        concept_id=concept.id,
                        document_id=document_id,
                        question=card.get("question", ""),
                        answer=card.get("answer", ""),
                    )
                    flashcards.append(flashcard)
            except json.JSONDecodeError as e:
                print(f"Failed to parse flashcards: {str(e)}")
                print(f"Response: {content}")
                continue

        except Exception as e:
            print(f"Error generating flashcards: {str(e)}")
            continue

    return flashcards


# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Document Tutor API", "version": "2.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """Upload a document file for processing"""
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".docx", ".csv", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Supported types: .pdf, .docx, .csv, .txt",
        )

    os.makedirs("uploads", exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}{file_ext}"

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
        INSERT INTO documents (id, name, type, file_path, upload_date, processed)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                file_id,
                file.filename,
                file_ext[1:],
                file_path,
                datetime.now().isoformat(),
                False,
            ),
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

    return {"id": file_id, "name": file.filename, "status": "uploaded"}


@app.get("/documents/", response_model=List[DocumentModel])
def list_documents():
    """Get all uploaded documents"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, type, upload_date, processed FROM documents ORDER BY upload_date DESC"
    )
    rows = cursor.fetchall()
    conn.close()

    documents = [
        DocumentModel(
            id=row[0],
            name=row[1],
            type=row[2],
            upload_date=row[3],
            processed=bool(row[4]),
        )
        for row in rows
    ]
    return documents


@app.get("/documents/{document_id}")
def get_document(document_id: str):
    """Get document details"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, type, upload_date, processed FROM documents WHERE id = ?",
        (document_id,),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentModel(
        id=row[0], name=row[1], type=row[2], upload_date=row[3], processed=bool(row[4])
    )


@app.get("/documents/{document_id}/content")
def get_document_content(document_id: str):
    """Get document text content"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT type, file_path FROM documents WHERE id = ?", (document_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Document not found")

    file_type, file_path = row

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    if file_type == "pdf":
        content = process_pdf(file_path)
    elif file_type == "docx":
        content = process_docx(file_path)
    elif file_type == "csv":
        content = process_csv(file_path)
    elif file_type == "txt":
        content = process_txt(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    return {"content": content, "length": len(content)}


@app.post("/documents/{document_id}/process")
def process_document_with_ai(document_id: str):
    """Process document to extract concepts and generate flashcards"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT type, file_path, processed FROM documents WHERE id = ?", (document_id,)
    )
    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Document not found")

    file_type, file_path, already_processed = row

    if already_processed:
        return {
            "status": "already_processed",
            "message": "Document has already been processed",
        }

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    # Extract content
    if file_type == "pdf":
        content = process_pdf(file_path)
    elif file_type == "docx":
        content = process_docx(file_path)
    elif file_type == "csv":
        content = process_csv(file_path)
    elif file_type == "txt":
        content = process_txt(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    if not content.strip():
        raise HTTPException(status_code=400, detail="No text content found in document")

    # Process with AI
    concepts = extract_concepts(content, document_id)
    flashcards = generate_flashcards(concepts, document_id)

    # Save to database
    try:
        for concept in concepts:
            cursor.execute(
                """
            INSERT INTO concepts (id, document_id, title, explanation, importance, related_concepts)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
                (
                    concept.id,
                    concept.document_id,
                    concept.title,
                    concept.explanation,
                    concept.importance,
                    (
                        json.dumps(concept.related_concepts)
                        if concept.related_concepts
                        else None
                    ),
                ),
            )

        for card in flashcards:
            cursor.execute(
                """
            INSERT INTO flashcards (id, concept_id, document_id, question, answer, difficulty)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
                (
                    card.id,
                    card.concept_id,
                    card.document_id,
                    card.question,
                    card.answer,
                    card.difficulty,
                ),
            )

        cursor.execute(
            "UPDATE documents SET processed = TRUE WHERE id = ?", (document_id,)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

    return {
        "status": "success",
        "concepts_extracted": len(concepts),
        "flashcards_generated": len(flashcards),
    }


@app.get("/documents/{document_id}/concepts", response_model=List[ConceptModel])
def get_document_concepts(document_id: str):
    """Get concepts extracted from a document"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(
        """
    SELECT id, document_id, title, explanation, importance, related_concepts
    FROM concepts WHERE document_id = ?
    ORDER BY importance DESC, title ASC
    """,
        (document_id,),
    )

    rows = cursor.fetchall()
    conn.close()

    concepts = []
    for row in rows:
        concepts.append(
            ConceptModel(
                id=row[0],
                document_id=row[1],
                title=row[2],
                explanation=row[3],
                importance=row[4],
                related_concepts=json.loads(row[5]) if row[5] else [],
            )
        )

    return concepts


@app.get("/documents/{document_id}/flashcards", response_model=List[FlashcardModel])
def get_document_flashcards(document_id: str):
    """Get flashcards for a document"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(
        """
    SELECT id, concept_id, document_id, question, answer, difficulty, 
            last_reviewed, correct_count, incorrect_count
    FROM flashcards WHERE document_id = ?
    ORDER BY difficulty DESC, last_reviewed ASC
    """,
        (document_id,),
    )

    rows = cursor.fetchall()
    conn.close()

    flashcards = []
    for row in rows:
        flashcards.append(
            FlashcardModel(
                id=row[0],
                concept_id=row[1],
                document_id=row[2],
                question=row[3],
                answer=row[4],
                difficulty=row[5],
                last_reviewed=row[6],
                correct_count=row[7],
                incorrect_count=row[8],
            )
        )

    return flashcards


@app.post("/flashcards/{flashcard_id}/review")
def record_flashcard_review(flashcard_id: str, review: FlashcardReview):
    """Record a flashcard review result"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    try:
        # Check if flashcard exists
        cursor.execute("SELECT id FROM flashcards WHERE id = ?", (flashcard_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Flashcard not found")

        # Update flashcard stats
        if review.correct:
            cursor.execute(
                """
            UPDATE flashcards 
            SET correct_count = correct_count + 1,
                last_reviewed = ?,
                difficulty = MAX(0.1, difficulty * 0.9)
            WHERE id = ?
            """,
                (datetime.now().isoformat(), flashcard_id),
            )
        else:
            cursor.execute(
                """
            UPDATE flashcards 
            SET incorrect_count = incorrect_count + 1,
                last_reviewed = ?,
                difficulty = MIN(3.0, difficulty * 1.2)
            WHERE id = ?
            """,
                (datetime.now().isoformat(), flashcard_id),
            )

        conn.commit()
        return {"status": "success", "correct": review.correct}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    """Delete a document and all associated data"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    try:
        # Get file path before deletion
        cursor.execute("SELECT file_path FROM documents WHERE id = ?", (document_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")

        file_path = row[0]

        # Delete associated flashcards and concepts
        cursor.execute("DELETE FROM flashcards WHERE document_id = ?", (document_id,))
        cursor.execute("DELETE FROM concepts WHERE document_id = ?", (document_id,))
        cursor.execute("DELETE FROM documents WHERE id = ?", (document_id,))

        # Delete file from disk
        if os.path.exists(file_path):
            os.remove(file_path)

        conn.commit()
        return {"status": "deleted", "document_id": document_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error deleting document: {str(e)}"
        )
    finally:
        conn.close()


@app.post("/test-ai")
def test_ai_connection():
    """Test Gemini API connection"""
    if not GEMINI_API_KEY:
        return {"status": "error", "message": "Gemini API key not configured"}

    test_text = """
    Machine learning is a branch of artificial intelligence that focuses on building systems that learn from data. 
    Deep learning is a subset of machine learning that uses neural networks with multiple layers.
    Natural language processing enables computers to understand and generate human language.
    """

    try:
        test_concepts = extract_concepts(test_text, "test-doc")
        return {
            "status": "success",
            "concepts": [c.dict() for c in test_concepts],
            "ai_working": len(test_concepts) > 0,
            "api_key_configured": True,
        }
    except Exception as e:
        return {"status": "error", "message": str(e), "api_key_configured": True}


# Add to main.py


@app.get("/documents/{document_id}/study-plan")
def generate_study_plan(document_id: str):
    """Generate a recommended study plan based on concepts"""
    concepts = get_document_concepts(document_id)
    if not concepts:
        raise HTTPException(
            status_code=400, detail="No concepts found - process document first"
        )

    try:
        prompt = f"""
        Create a study plan for these concepts:
        {[c.title for c in concepts]}
        
        Include:
        - Recommended study order
        - Time estimates
        - Suggested activities
        - Key relationships between concepts
        
        Format as markdown with headings
        """
        response = model.generate_content(prompt)
        return {"study_plan": response.text}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating study plan: {str(e)}"
        )


@app.get("/flashcards/for-review")
def get_flashcards_for_review(limit: int = 10):
    """Get flashcards due for review (using spaced repetition)"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
    SELECT id, question, answer 
    FROM flashcards 
    ORDER BY 
        CASE WHEN last_reviewed IS NULL THEN 1 ELSE 0 END DESC,
        difficulty DESC,
        random()
    LIMIT ?
    """,
        (limit,),
    )

    flashcards = [
        {"id": row[0], "question": row[1], "answer": row[2]}
        for row in cursor.fetchall()
    ]

    conn.close()
    return flashcards


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str


@app.get("/documents/{document_id}/quiz", response_model=List[QuizQuestion])
def generate_quiz_questions(document_id: str, num_questions: int = 5):
    """Generate multiple choice quiz questions"""
    concepts = get_document_concepts(document_id)
    if not concepts:
        raise HTTPException(
            status_code=400, detail="No concepts found - process document first"
        )

    try:
        prompt = f"""
        Create {num_questions} multiple choice quiz questions based on these concepts:
        {[c.title for c in concepts]}
        
        For each question:
        - Provide 4 options
        - Mark the correct answer (0-3 index)
        - Include a brief explanation
        
        Format as JSON:
        {{
            "questions": [
                {{
                    "question": "...",
                    "options": ["...", "...", "...", "..."],
                    "correct_index": 0,
                    "explanation": "..."
                }}
            ]
        }}
        """
        response = model.generate_content(prompt)
        content = response.text

        # Clean response
        if content.startswith("```json"):
            content = content[7:-4]

        data = json.loads(content)
        return data.get("questions", [])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")


# Auth endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user

@app.get("/users/me/progress", response_model=StudyProgress)
async def get_user_progress(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM documents")
    documents_studied = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM concepts")
    concepts_learned = cursor.fetchone()[0]
    cursor.execute("SELECT SUM(correct_count + incorrect_count) FROM flashcards")
    total_reviews = cursor.fetchone()[0] or 0
    cursor.execute("SELECT SUM(correct_count) FROM flashcards")
    correct_answers = cursor.fetchone()[0] or 0
    streak_days = 3  # Placeholder for streak logic
    conn.close()
    return {
        "documents_studied": documents_studied,
        "concepts_learned": concepts_learned,
        "flashcards_reviewed": total_reviews,
        "correct_answers": correct_answers,
        "total_answers": total_reviews,
        "streak_days": streak_days
    }

# Folder endpoints
@app.post("/folders/", response_model=Folder)
async def create_folder(
    name: str,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    folder_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO folders (id, name, user_id, created_at) VALUES (?, ?, ?, ?)",
        (folder_id, name, current_user.username, created_at)
    )
    conn.commit()
    conn.close()
    return {
        "id": folder_id,
        "name": name,
        "user_id": current_user.username,
        "created_at": created_at
    }

@app.post("/documents/{document_id}/add-to-folder/{folder_id}")
async def add_document_to_folder(
    document_id: str,
    folder_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO document_folders (document_id, folder_id) VALUES (?, ?)",
            (document_id, folder_id)
        )
        conn.commit()
        return {"status": "success"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Document already in folder")
    finally:
        conn.close()

@app.get("/folders/", response_model=List[Folder])
async def get_user_folders(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, user_id, created_at FROM folders WHERE user_id = ?",
        (current_user.username,)
    )
    folders = [
        {
            "id": row[0],
            "name": row[1],
            "user_id": row[2],
            "created_at": row[3]
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return folders

@app.get("/folders/{folder_id}/documents", response_model=List[DocumentModel])
async def get_folder_documents(
    folder_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("""
    SELECT d.id, d.name, d.type, d.upload_date, d.processed
    FROM documents d
    JOIN document_folders df ON d.id = df.document_id
    WHERE df.folder_id = ?
    """, (folder_id,))
    documents = [
        DocumentModel(
            id=row[0],
            name=row[1],
            type=row[2],
            upload_date=row[3],
            processed=bool(row[4])
        )
        for row in cursor.fetchall()
    ]
    conn.close()
    return documents

# Export endpoints
@app.get("/documents/{document_id}/export/flashcards")
async def export_flashcards(
    document_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    format: str = "csv"
):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("""
    SELECT question, answer 
    FROM flashcards 
    WHERE document_id = ?
    """, (document_id,))
    flashcards = cursor.fetchall()
    conn.close()
    if format == "csv":
        output = io.StringIO()
        output.write("front,back\n")
        for card in flashcards:
            output.write(f'"{card[0]}","{card[1]}"\n')
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=flashcards_{document_id}.csv"
            }
        )
    elif format == "anki":
        output = io.StringIO()
        output.write("#separator:tab\n")
        output.write("#html:true\n")
        for card in flashcards:
            output.write(f"{card[0]}\t{card[1]}\n")
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename=flashcards_{document_id}.txt"
            }
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

@app.get("/documents/{document_id}/export/summary")
async def export_summary(
    document_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM documents WHERE id = ?", (document_id,))
    doc_name = cursor.fetchone()[0]
    cursor.execute("""
    SELECT title, explanation, importance 
    FROM concepts 
    WHERE document_id = ?
    ORDER BY importance DESC
    """, (document_id,))
    concepts = cursor.fetchall()
    conn.close()
    markdown = f"# Summary: {doc_name}\n\n"
    markdown += "## Key Concepts\n\n"
    for concept in concepts:
        stars = "★" * (3 if concept[2] == "high" else 2 if concept[2] == "medium" else 1)
        markdown += f"### {concept[0]} {stars}\n"
        markdown += f"{concept[1]}\n\n"
    return StreamingResponse(
        iter([markdown]),
        media_type="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename=summary_{document_id}.md"
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
