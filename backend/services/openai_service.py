import base64
from openai import AsyncOpenAI

from config import OPENAI_API_KEY

client = AsyncOpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)


async def generate_thumbnail(prompt: str, style_prompt: str, headshot_url: str) -> bytes:
    """
    Generate a thumbnail using Responses API + image_generation tool.
    Returns raw PNG bytes.
    """

    full_prompt = (
        f"{style_prompt}\n\n"
        f"User request: {prompt}\n\n"
        "IMPORTANT: The generated thumbnail MUST prominently feature the person "
        "shown in the provided reference headshot photo. Keep their likeness accurate."
    )

    response = await client.responses.create(
        model="gpt-5-mini",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_image",
                        "image_url": headshot_url,
                    },
                    {
                        "type": "input_text",
                        "text": full_prompt,
                    },
                ],
            }
        ],
        tools=[
            {
                "type": "image_generation",
                "size": "1536x1024",
                "quality": "low",
            }
        ],
    )


    for item in response.output:
        if item.type == "image_generation_call":
            if hasattr(item, "result") and item.result:
                return base64.b64decode(item.result)

    raise RuntimeError("No image generated in response")