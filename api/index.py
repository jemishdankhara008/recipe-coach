import os
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI

app = FastAPI()
clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)


class RecipeRecord(BaseModel):
    dish_name: str
    dietary_restrictions: str
    cooking_skill_level: str
    available_time_minutes: str
    health_goal: str


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
substitutions or variations (e.g. for different dietary needs, budget options,
or flavour preferences). Close with one motivational sentence encouraging the
user on their cooking journey.

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


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0"}


@app.post("/api")
def get_recipe(
    record: RecipeRecord,
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard),
):
    user_id = creds.decoded["sub"]
    client = OpenAI()

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt_for(record)},
    ]

    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        stream=True,
    )

    def event_stream():
        for chunk in stream:
            text = chunk.choices[0].delta.content
            if text:
                lines = text.split("\n")
                for line in lines[:-1]:
                    yield f"data: {line}\n\n"
                    yield "data:  \n"
                yield f"data: {lines[-1]}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")