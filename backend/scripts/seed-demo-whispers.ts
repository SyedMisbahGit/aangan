import db from "../db";

async function seedDemoWhispers() {
  await db.whisper.createMany([
    { content: "फिक्रें हवा हैं आज...", emotion: "Calm", zone: "Tapri" },
    { content: "Library की ख़ामोशी दिल धड़का रही थी", emotion: "Anxious", zone: "Library" },
  ]);
  console.log("Seeded demo whispers.");
  process.exit();
}

seedDemoWhispers(); 