import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

/**
 * Script to debug the upload API functionality
 */
async function main() {
  try {
    // Get sample image file
    const testImagePath = path.join(__dirname, '../public/placeholder.png');

    if (!fs.existsSync(testImagePath)) {
      console.error(`Test image not found at ${testImagePath}`);
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));
    formData.append('type', 'debug-test');

    console.log('Sending test upload to API...');

    // Get auth cookie first
    const authCookie = process.env.AUTH_COOKIE;
    if (!authCookie) {
      console.error('No AUTH_COOKIE environment variable found. Please set it to a valid session cookie.');
      return;
    }

    // Send request to upload API
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': authCookie
      }
    });

    // Log response
    if (response.ok) {
      const data = await response.json();
      console.log('Upload successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('Upload failed with status:', response.status);
      try {
        const errorData = await response.json();
        console.error('Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        const text = await response.text();
        console.error('Error response:', text);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();