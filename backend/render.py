from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests
import time
from dotenv import load_dotenv
from typing import Optional
import logging
import google.generativeai as genai
import json

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="PrepAI Interview Assistant", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hugging Face API Configuration
HF_API_URL = "https://api-inference.huggingface.co/models/Linus011/PrepAi"
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    logger.warning("HF_TOKEN not found. Hugging Face requests may be rate limited.")

# Set up Gemini API
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    error_msg = "GOOGLE_API_KEY not found in environment variables"
    logger.error(error_msg)
    raise ValueError(error_msg)

genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

logger.info("FastAPI server initialized with Hugging Face API integration")

# Pydantic V1 compatible model
class ChatRequest(BaseModel):
    message: Optional[str] = None
    role: Optional[str] = "Software Engineer"
    technology: Optional[str] = "Python"
    level: Optional[str] = "Intermediate"
    content_type: Optional[str] = "question"
    question: Optional[str] = None
    answer: Optional[str] = None
    
    class Config:
        # Pydantic V1 configuration
        schema_extra = {
            "example": {
                "role": "Software Engineer",
                "technology": "Python",
                "level": "Intermediate",
                "content_type": "question"
            }
        }

class HuggingFaceService:
    def __init__(self):
        self.api_url = HF_API_URL
        self.headers = {}
        if HF_TOKEN:
            self.headers["Authorization"] = f"Bearer {HF_TOKEN}"
    
    def query_model(self, payload, max_retries=3):
        """Query the Hugging Face model with retry logic"""
        for attempt in range(max_retries):
            try:
                logger.info(f"Querying HF model (attempt {attempt + 1})")
                
                response = requests.post(
                    self.api_url, 
                    headers=self.headers, 
                    json=payload, 
                    timeout=120
                )
                
                if response.status_code == 503:
                    logger.info("Model is loading, waiting 20 seconds...")
                    time.sleep(20)
                    continue
                elif response.status_code == 429:
                    logger.warning("Rate limited, waiting 30 seconds...")
                    time.sleep(30)
                    continue
                elif response.status_code != 200:
                    logger.error(f"HF API error: {response.status_code} - {response.text}")
                    if attempt == max_retries - 1:
                        raise Exception(f"HF API error: {response.status_code}")
                    time.sleep(5)
                    continue
                
                result = response.json()
                logger.info("Successfully received response from HF model")
                return result
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise Exception(f"Failed to connect to Hugging Face API: {e}")
                time.sleep(5)
        
        return None

    def fallback_to_gemini(self, instruction):
        """Fallback to Gemini API if HF model fails"""
        try:
            logger.info("Using Gemini as fallback")
            response = gemini_model.generate_content(instruction)
            return response.text
        except Exception as e:
            logger.error(f"Gemini fallback failed: {e}")
            return "Sorry, I'm unable to process your request at the moment. Please try again later."

hf_service = HuggingFaceService()

def generate_interview_content(content_type, role, technology, level, question=None, answer=None):
    """Generate interview content using the Hugging Face model API"""
    logger.info(f"Generating {content_type} for {level} {role} with {technology}")
    
    # Create appropriate prompt based on content type
    if content_type == "question":
        instruction = f"""
You are an AI interviewer for a {role} position.
Generate a precise {level} level technical question about {technology}.
IMPORTANT: 
1. The question MUST be under 40 words maximum.
2. Make it direct, clear, and specific.
3. Focus on concepts, architecture, best practices, or technical understanding.
4. The question should test knowledge without requiring code writing.
5. Avoid any explanations or context - just ask the question directly.
"""
    elif content_type == "answer":
        if not question:
            raise ValueError("Question is required for generating answers")
        instruction = f"""
You are an AI interviewer for a {role} position.
Provide a detailed answer to this {level} level {technology} question:
"{question}"
"""
    elif content_type == "evaluation":
        if not question or not answer:
            raise ValueError("Both question and answer are required for evaluation")
        instruction = f"""
You are an AI interviewer for a {role} position.
Evaluate this candidate's answer to the following {level} level {technology} question:

Question: {question}

Candidate's Answer: {answer}

Provide detailed feedback on the strengths and weaknesses of the answer.
Include what was correct, what was incorrect or missing, and suggestions for improvement.
"""
    else:
        raise ValueError("Invalid content type. Choose 'question', 'answer', or 'evaluation'")
    
    # Format prompt for the model
    prompt = f"<s>[INST] {instruction} [/INST]"
    logger.info(f"Generated prompt: {prompt[:100]}...")
    
    try:
        # Prepare payload for Hugging Face API
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.7,
                "top_p": 0.95,
                "repetition_penalty": 1.15,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        # Query the Hugging Face model
        result = hf_service.query_model(payload)
        
        if result and isinstance(result, list) and len(result) > 0:
            response = result[0].get('generated_text', '').strip()
            
            # For questions, verify and trim if needed
            if content_type == "question" and response:
                words = response.split()
                if len(words) > 40:
                    response = " ".join(words[:40]) + "..."
                    logger.info("Question was trimmed to 40 words")
            
            logger.info(f"HF Model generated response: {response[:100]}...")
            return response
        else:
            # Fallback to Gemini if HF model fails
            logger.warning("HF model returned invalid response, using Gemini fallback")
            return hf_service.fallback_to_gemini(instruction)
            
    except Exception as e:
        logger.error(f"Error with HF model: {e}, using Gemini fallback")
        return hf_service.fallback_to_gemini(instruction)

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received chat request: {request.dict()}")
        
        # Process the request using the Hugging Face model
        response = generate_interview_content(
            content_type=request.content_type,
            role=request.role,
            technology=request.technology,
            level=request.level,
            question=request.question,
            answer=request.answer
        )
        
        return {
            "response": response,
            "source": "huggingface",
            "status": "success"
        }
        
    except ValueError as e:
        error_msg = str(e)
        logger.error(f"Value error: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        error_msg = f"Internal server error: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        return {
            "status": "healthy",
            "service": "PrepAI Interview Assistant",
            "model": "Linus011/PrepAi",
            "gemini_configured": bool(GEMINI_API_KEY),
            "hf_token_configured": bool(HF_TOKEN)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.get("/")
async def root():
    return {
        "message": "PrepAI Interview Assistant API is running",
        "model": "Linus011/PrepAi via Hugging Face API",
        "endpoints": ["/chat", "/health", "/docs"],
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)