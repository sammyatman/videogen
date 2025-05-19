#!/usr/bin/env python
# queue_workflows.py
import argparse, base64, glob, json, os, uuid, requests
from pathlib import Path

COMFY_URL = "http://127.0.0.1:8188"      # change if your ComfyUI host/port differ
TEMPLATE_DIR = "comfyui_templates"

# -------- helpers ----------------------------------------------------------- #
def _upload_image(image_path: Path) -> str:
    """Uploads an image once; returns the internal filename ComfyUI gives it."""
    with open(image_path, "rb") as f:
        payload = {
            "type": "input",
            "image": base64.b64encode(f.read()).decode()
        }
    r = requests.post(f"{COMFY_URL}/upload/image", json=payload, timeout=60)
    r.raise_for_status()
    return r.json()["name"]  # e.g. "cat.png"

def _patch_nodes(nodes: dict, prompt: str, image_name: str | None):
    """Replace prompt‐ and image‐related inputs in-place."""
    PROMPT_KEYS  = {"text", "prompt", "positive", "negative"}
    IMAGE_KEYS   = {"image", "filename"}

    for node in nodes.values():
        inp = node.get("inputs", {})
        # text prompt
        for k in PROMPT_KEYS & inp.keys():
            inp[k] = prompt

        # image prompt (only if user supplied an image)
        if image_name and (IMAGE_KEYS & inp.keys()):
            # some nodes use 'image', others store the name separately
            if "image" in inp:
                inp["image"] = image_name
            if "filename" in inp:
                inp["filename"] = image_name

def queue_workflow(workflow: dict) -> str:
    """POST /prompt; returns ComfyUI's prompt_id."""
    client_id = str(uuid.uuid4())
    payload   = {"prompt": workflow, "client_id": client_id}
    r = requests.post(f"{COMFY_URL}/prompt", json=payload, timeout=60)
    r.raise_for_status()
    return r.json()["prompt_id"]

# -------- main -------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True, help="text prompt for every workflow")
    ap.add_argument("--image",  help="optional image file for every workflow")
    args = ap.parse_args()

    image_name = None
    if args.image:
        image_name = _upload_image(Path(args.image).expanduser())
        print(f"Uploaded image → ComfyUI filename: {image_name}")

    templates = sorted(glob.glob(os.path.join(TEMPLATE_DIR, "*.json")))
    if not templates:
        raise SystemExit(f"No *.json files found in {TEMPLATE_DIR!r}")

    print(f"Queuing {len(templates)} workflows …")
    for tmpl in templates:
        with open(tmpl, "r", encoding="utf-8") as f:
            wf = json.load(f)

        _patch_nodes(wf["nodes"], args.prompt, image_name)
        pid = queue_workflow(wf)
        print(f"• {Path(tmpl).name:<30} → prompt_id {pid}")

    print("\nAll workflows queued — monitor progress in ComfyUI or poll /history/<prompt_id>.")

if __name__ == "__main__":
    main()

