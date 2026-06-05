from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from PIL import Image
import io
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class URLRequest(BaseModel):
    url: str

def scrape_article(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text() for p in paragraphs[:20]])
        return text[:3000]
    except Exception as e:
        return f"Could not scrape article: {str(e)}"

def analyze_with_groq(content: str, content_type: str) -> dict:
    prompt = f"""
You are a professional fact-checker and misinformation analyst.

Analyze the following {content_type} content and return a JSON response with exactly these fields:
- score: integer from 0 to 100 (0 = definitely fake, 100 = definitely credible)
- analysis: 2-3 sentence summary of your findings
- red_flags: list of specific red flags found (empty list if none)

Content to analyze:
{content}

Respond with only valid JSON, no extra text.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    import json
    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)

def check_image_integrity(image_bytes: bytes) -> str:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        import numpy as np
        img_array = np.array(img)
        
        resaved = io.BytesIO()
        img.save(resaved, format="JPEG", quality=90)
        resaved.seek(0)
        img2 = Image.open(resaved).convert("RGB")
        img2_array = np.array(img2)
        
        diff = np.abs(img_array.astype(int) - img2_array.astype(int))
        ela_score = diff.mean()
        
        width, height = img.size
        info = img.info
        
        findings = f"Image size: {width}x{height}. ELA score: {ela_score:.2f}. "
        
        if ela_score > 15:
            findings += "High ELA score suggests possible image manipulation. "
        else:
            findings += "ELA score is normal, no obvious manipulation detected. "
            
        if "exif" not in str(info).lower():
            findings += "No EXIF metadata found, which can indicate editing."
        else:
            findings += "EXIF metadata present."
            
        return findings
    except Exception as e:
        return f"Image analysis error: {str(e)}"

@app.post("/analyze/text")
async def analyze_text(request: URLRequest):
    article_text = scrape_article(request.url)
    result = analyze_with_groq(article_text, "news article")
    return result

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_findings = check_image_integrity(image_bytes)
    result = analyze_with_groq(image_findings, "image analysis report")
    return result