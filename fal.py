from dotenv import load_dotenv
load_dotenv()
import fal_client

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

result = fal_client.subscribe(
    "fal-ai/recraft/v3/image-to-image",
    arguments={
        "prompt": "winter",
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/recraft/recraft-upscaler-1.jpeg"
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
