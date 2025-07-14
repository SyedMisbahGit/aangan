# AI Listener in College Whisper (Aangan/CUJ)

This document explains how the AI listener works, with a focus on its probabilistic, poetic, and CUJ zone/emotion-specific behavior.

---

## Purpose
The AI listener enhances the campus experience by generating poetic, context-aware replies to user whispers. It is designed to:
- Encourage emotional expression
- Foster a sense of wonder and connection
- Tailor responses to campus zones and emotional themes (CUJ/Aangan)

---

## When Does the AI Reply?
- The AI listener is triggered when a user posts a new whisper (via `/api/whispers`).
- Not every whisper receives an AI reply—responses are **probabilistic** (e.g., 30-50% chance, tunable).
- The decision to reply is influenced by:
  - Zone (e.g., Courtyard, Library)
  - Emotion (e.g., Joy, Melancholy)
  - Whisper content (length, sentiment, novelty)
  - Each whisper now includes a `guestId` (if available), so AI replies are always attached to the correct user's whisper and appear in their personal history.

---

## How Does the AI Generate Replies?
1. **Context Gathering:**
   - The system collects the zone, emotion, and content of the whisper.
   - The `guestId` (if present) is included in the whisper data and preserved in the AI reply.
2. **Probabilistic Trigger:**
   - A random check (with zone/emotion weighting) determines if the AI will reply.
3. **Prompt Construction:**
   - The AI is prompted with the user’s message, zone, and emotion, plus poetic/empathetic instructions.
4. **Poetic Generation:**
   - The AI crafts a short, poetic, and emotionally resonant reply.
   - Replies are tailored to the zone’s theme (e.g., tranquil in Courtyard, studious in Library).
5. **Safety & Moderation:**
   - All AI replies are checked for safety and appropriateness before being sent.
6. **Delivery:**
   - The reply is attached to the original whisper and delivered in real-time via Socket.IO.
   - The reply is attached to the original whisper, which is associated with the user's guestId for history and diary features.

---

## Example Flow
1. User posts a whisper in the "Courtyard" zone with emotion "Hopeful":
   > "I wish for a gentle rain to cool this summer day."
   (The request includes the user's guestId for association.)
2. AI listener is triggered (passes probability check).
3. AI receives prompt:
   > "Reply poetically to this message, as if you are the spirit of the Courtyard, feeling Hopeful."
4. AI generates:
   > "A breeze stirs, promising clouds and gentle relief."
5. Reply is checked for safety and sent to the user.
6. The reply is attached to the original whisper, which is associated with the user's guestId for history and diary features.

---

## Extensibility
- **Zones:** New campus zones can be added with unique AI personas or reply styles.
- **Emotions:** The AI can be tuned for new emotional states or themes.
- **Prompting:** Prompts can be refined for more creative or context-aware responses.
- **Probability:** Reply rates can be adjusted per zone/emotion.

---

## Safety & Guardrails
- All AI replies are filtered for inappropriate or unsafe content.
- Moderation rules are enforced before replies are shown.
- The system can be configured to disable AI replies in sensitive contexts.

---

For more on system integration, see [ARCHITECTURE.md]. For API usage, see [API_REFERENCE.md]. 