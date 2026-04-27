import { readFileSync } from 'fs';

// Convert test.png to base64 the same way the browser does
const imageBuffer = readFileSync('./test.png');
const base64 = imageBuffer.toString('base64');

// We need a real subjectId from MongoDB — use a dummy one just to test the AI part
// The route will fail at MongoDB but we can see if Nebius responds first
const body = {
  images: [{ base64, mimeType: 'image/png' }],
  subjectId: '000000000000000000000000', // dummy — will 404 at DB step
  filename: 'test.png',
  sizeMB: 0.09,
};

console.log('Posting to local API...');
const res = await fetch('http://localhost:3000/api/extract-syllabus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const json = await res.json();
console.log('Status:', res.status);
console.log('Response:', JSON.stringify(json, null, 2).slice(0, 500));
