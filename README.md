# 🎬 GenAI Media Showdown

**A static, interactive page for comparing state-of-the-art video generation models.**

This single-page app visually contrasts the performance of cutting-edge generative video models across two major tasks:

- 🖼️ **Image-to-Video (I2V)** — video generated from a single reference image  
- ✍️ **Text-to-Video (T2V)** — video generated from a prompt only  

Each model’s output is displayed side by side with scored evaluations, allowing for intuitive comparison across multiple qualities.

---

## 🧠 Compared Models

| Model Name              | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| **Veo 3**               | Latest iteration of Google's Veo, known for high realism and smooth motion |
| **Veo 2**               | Predecessor to Veo 3, still strong in fidelity and consistency               |
| **Sora**                | OpenAI’s text-to-video model with a focus on cinematic visuals              |
| **Luma Ray 2**          | Luma Labs’ photorealistic scene rendering engine                            |
| **Kling 1.6 / 2.0**     | ByteDance’s video models focused on stylized motion and scene composition   |
| **Wan 2.1**             | Tencent’s generative system, often outputs static image frames              |
| **CogVideoX 1.5**       | Tsinghua’s autoregressive video generator                                   |
| **FramePack + HunYuan**| Frame-conditioned variant of HunYuan with boosted temporal coherence        |

---

## 📊 Evaluation Metrics

Each model output is scored (1–10) across the following dimensions:

- **Instruction Following**  
  How closely the video reflects the given prompt or reference.

- **Consistency**  
  Stability of visual elements across frames (e.g. character appearance, scene layout).

- **Realism**  
  Photorealistic fidelity in lighting, textures, and motion.

- **Animation Quality**  
  Smoothness and naturalness of dynamic motion and transitions.

- **Creativity**  
  Novelty and imagination in rendering, composition, or stylistic choices.
