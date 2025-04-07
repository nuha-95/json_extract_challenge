import { createWorker } from 'tesseract.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, message: "Missing imageBase64" });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const worker = await createWorker('eng');
    const {
      data: { text }
    } = await worker.recognize(imageBuffer);

    await worker.terminate();

    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const extracted = text.slice(jsonStart, jsonEnd + 1);

    const data = JSON.parse(extracted);

    return res.status(200).json({
      success: true,
      data,
      message: "Successfully extracted JSON from image"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to extract JSON: " + err.message
    });
  }
}
