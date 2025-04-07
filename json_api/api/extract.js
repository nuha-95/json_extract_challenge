import { createWorker } from 'tesseract.js';

export default async function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', '*');  
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { imageBase64 } = req.body;

 
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: "Missing imageBase64" });
  }

  try {
    
    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
    console.log("Base64 Data:", base64Data);  

    
    const buffer = Buffer.from(base64Data, 'base64');

    
    const worker = await createWorker({
      logger: (m) => console.log(m), 
    });

    
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();

    console.log("Extracted Text:", text);  

   
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(400).json({ success: false, message: "No valid JSON found in extracted text" });
    }

    const extracted = text.slice(jsonStart, jsonEnd + 1);
    console.log("Extracted JSON:", extracted);  

    
    let data = null;
    try {
      data = JSON.parse(extracted);
    } catch (err) {
      console.error("Failed to parse JSON", err);  
      return res.status(400).json({ success: false, message: "Invalid JSON extracted" });
    }

    
    return res.status(200).json({
      success: true,
      data,
      message: "Successfully extracted JSON from image"
    });

  } catch (err) {
    console.error("Error occurred:", err);  
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to extract JSON: " + err.message
    });
  }
}
