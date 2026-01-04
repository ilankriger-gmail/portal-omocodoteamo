import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

/**
 * Simpler script to debug the upload API functionality
 */
async function main() {
  try {
    console.log('Starting upload test');

    // Create a test file
    const testDir = path.join(__dirname, '../temp');
    const testFilePath = path.join(testDir, 'test-image.png');

    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create a simple PNG-like file (not actually valid, but enough for testing)
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
    ]);

    fs.writeFileSync(testFilePath, Buffer.concat([
      pngHeader,
      Buffer.from('Test PNG file for debug purposes')
    ]));

    console.log(`Created test file at: ${testFilePath}`);

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('type', 'debug-test');

    console.log('Sending test upload to API...');

    // Send request to upload API
    const port = 3001; // Use the port your server is running on
    const response = await fetch(`http://localhost:${port}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Mock a basic auth header to test the upload endpoint
        'Authorization': 'Basic dGVzdDp0ZXN0' // test:test in base64
      }
    });

    console.log(`Response status: ${response.status}`);

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

    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('Test file removed');

  } catch (error) {
    console.error('Error:', error);
  }
}

main();