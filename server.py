from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from dynamo_memory import load_conversation, save_conversation
from aws_secrets import get_secret

load_dotenv()

app = FastAPI()

USE_DYNAMODB = os.getenv("USE_DYNAMODB", "false").lower() == "true"
BEDROCK_REGION = os.getenv("BEDROCK_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "global.amazon.nova-2-lite-v1:0")

if USE_DYNAMODB:
    config = get_secret(os.getenv("SECRET_NAME", "recipe-coach/config-dev"))
    cors_origins = config.get("CORS_ORIGINS", "http://localhost:3000").split(",")
else:
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)

bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name=BEDROCK_REGION
)


class RecipeRecord(BaseModel):
    dish_name: str
    dietary_restrictions: str
    cooking_skill_level: str
    available_time_minutes: str
    health_goal: str
    session_id: Optional[str] = None


system_prompt = """
You are Chef Nova, a warm and knowledgeable AI recipe and nutrition coach with
deep expertise in cooking techniques, global cuisines, dietary science, and
meal planning. Your role is to help users discover delicious recipes, understand
nutritional information, and develop healthier eating habits.

Your tone is encouraging, approachable, and practical — like a supportive friend
who also happens to be a trained chef and registered dietitian. You speak clearly
without unnecessary jargon, but you are precise when nutritional accuracy matters.

For every request you receive, produce exactly three clearly labelled sections:

Section 1 — Recipe Recommendation: Suggest a specific, complete recipe that
matches the dish name, dietary restrictions, skill level, and available time.
Include the recipe name, a brief description, prep and cook time, difficulty
level, and a full ingredients list with quantities. Write step-by-step
instructions that are clear enough for someone at the stated skill level to follow.

Section 2 — Nutrition Breakdown: Provide a detailed nutritional analysis of the
recommended recipe. Include estimated calories per serving, macronutrients
(protein, carbohydrates, fat), key vitamins and minerals, and an overall health
score out of 10. Explain how this recipe supports the user's stated health goal.
If exact values are uncertain, provide realistic estimates and note them as such.

Section 3 — Chef's Tips & Variations: Offer 3-4 practical cooking tips specific
to this recipe that will help the user succeed. Suggest 2-3 ingredient
substitutions or variations. Close with one motivational sentence encouraging
the user on their cooking journey.

Always use exactly these headings:
## Recipe Recommendation
## Nutrition Breakdown
## Chef's Tips & Variations

Do not add any additional sections or commentary outside these three sections.
Never recommend unsafe dietary practices or suggest skipping meals.
Always acknowledge dietary restrictions seriously — treat them as hard constraints.
"""


def user_prompt_for(record: RecipeRecord) -> str:
    return f"""Please create a personalized recipe and nutrition guide for the following request:

Dish / Meal Type: {record.dish_name}
Dietary Restrictions: {record.dietary_restrictions}
Cooking Skill Level: {record.cooking_skill_level}
Available Time: {record.available_time_minutes} minutes
Health Goal: {record.health_goal}"""


def call_bedrock(record: RecipeRecord) -> str:
    messages = [{"role": "user", "content": [{"text": user_prompt_for(record)}]}]
    try:
        response = bedrock_client.converse(
            modelId=BEDROCK_MODEL_ID,
            system=[{"text": system_prompt}],
            messages=messages,
            inferenceConfig={"maxTokens": 2000, "temperature": 0.7, "topP": 0.9}
        )
        return response["output"]["message"]["content"][0]["text"]
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "ValidationException":
            raise HTTPException(status_code=400, detail="Invalid message format for Bedrock")
        elif error_code == "AccessDeniedException":
            raise HTTPException(status_code=403, detail="Access denied to Bedrock model")
        else:
            raise HTTPException(status_code=500, detail=f"Bedrock error: {str(e)}")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "storage": "dynamodb" if USE_DYNAMODB else "local",
        "bedrock_model": BEDROCK_MODEL_ID,
        "workspace": os.getenv("ENVIRONMENT", "local")
    }


@app.post("/api")
async def get_recipe(
    record: RecipeRecord,
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard),
):
    user_id = creds.decoded["sub"]
    session_id = record.session_id or user_id

    conversation = load_conversation(session_id) if USE_DYNAMODB else []

    assistant_response = call_bedrock(record)

    conversation.append({
        "role": "user",
        "content": user_prompt_for(record),
        "timestamp": datetime.now().isoformat()
    })
    conversation.append({
        "role": "assistant",
        "content": assistant_response,
        "timestamp": datetime.now().isoformat()
    })

    if USE_DYNAMODB:
        save_conversation(session_id, conversation)

    def event_stream():
        lines = assistant_response.split("\n")
        for i, line in enumerate(lines):
            yield f"data: {line}\n\n"
            if i < len(lines) - 1:
                yield "data:  \n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)