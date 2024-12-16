import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function filterComments(comments) {
  const API_KEY = process.env.HUGGING_FACE_API_KEY;  // Fetch API key from environment variables
  const modelEndpoint = 'https://api-inference.huggingface.co/models/unitary/toxic-bert';  // Hugging Face model endpoint
  const filteredComments = [];
  const maxRetries = 5;  
  const retryDelay = 20000; 
  const toxicityThreshold = 0.5; 

  for (const comment of comments) {
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        const response = await fetch(modelEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: comment.text }),
        });

        const result = await response.json();

        if (result.error && result.error.includes('currently loading')) {
          // If model is still loading, wait for a specified time and retry
          console.log(`Model is loading. Retrying in ${retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempt++;
          continue;  // Retry the request
        }

        // Handle multi-label classification response
        let isToxic = false;
        for (const label of result[0]) {
          if (label.label === 'toxic' && label.score > toxicityThreshold) {
            isToxic = true;
            break;
          }
        }

        // If the comment is not toxic, keep it
        if (!isToxic) {
          filteredComments.push(comment);
        } else {
          console.log(`Filtered out comment with id ${comment.id}:`, comment.text);
        }

        success = true;  // Exit the retry loop on success
      } catch (error) {
        console.error('Error communicating with Hugging Face API:', error);
        break;  // Break the loop if an error occurs
      }
    }

    if (attempt === maxRetries) {
      console.error(`Max retries reached for comment with id ${comment.id}`);
    }
  }

  return filteredComments;
}

export { filterComments };
