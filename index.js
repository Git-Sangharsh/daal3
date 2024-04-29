import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import OpenAI from 'openai';
import axios from 'axios';
import GIFEncoder from 'gifencoder';
import { createCanvas, loadImage } from 'canvas';

const app = express();
const port = 5000; // Change to your desired port

// Replace 'your-api-key' with your actual OpenAI API key
const openai = new OpenAI({ apiKey: 'your-api-key' });

// CORS middleware
app.use(cors());

// Body Parser middleware
app.use(bodyParser.json());

// Define the parameters for image generation
const params = {
  model: "dall-e-3",
  prompt: "today's meme token",
  n: 1,
  size: "1024x1024"
};

// Define an async function to generate the image
const generateImage = async () => {
  try {
    // Make the request to generate the image
    const response = await openai.images.generate(params);

    // Extract the URL of the generated image from the response
    const imageUrl = response.data[0].url;
    // Fetch the image data
    const imageData = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    // Return the image data
    return imageData.data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Route to generate and serve the GIF
app.get('/generate- ', async (req, res) => {
  try {
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');
    const encoder = new GIFEncoder(1024, 1024);

    // Pipe the GIF encoder output to the response
    encoder.createReadStream().pipe(res);

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500);  // frame delay in ms

    for (let i = 0; i < 5; i++) { // Generating 5 frames
      const imageData = await generateImage();
      const image = await loadImage(imageData);
      ctx.drawImage(image, 0, 0, 1024, 1024);
      encoder.addFrame(ctx);
    }

    encoder.finish();
  } catch (error) {
    console.error("Error generating GIF:", error);
    res.status(500).send('Error generating GIF');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
