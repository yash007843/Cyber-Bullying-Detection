import dotenv from 'dotenv';  // Import dotenv to load environment variables
import fs from 'fs';           // Import fs to read and write files
import { filterComments } from './src/filter.js'; 

dotenv.config();

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY; 
console.log('HUGGING_FACE_API_KEY:', HUGGING_FACE_API_KEY);

const inputFilePath = './data/input.json'; 
const outputFilePath = './data/output.json';

fs.readFile(inputFilePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading input file:', err); 
    return;
  }

  console.log('Input file read successfully.');
  const inputComments = JSON.parse(data);  // Parse the input file content as JSON
  const filteredComments = await filterComments(inputComments);  // Filter the comments

  fs.writeFile(outputFilePath, JSON.stringify(filteredComments, null, 2), (err) => {
    if (err) {
      console.error('Error writing output file:', err); 
    } else {
      console.log('Filtered comments saved to:', outputFilePath); 
    }
  });
});
