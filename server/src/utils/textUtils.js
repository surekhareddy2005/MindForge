/**
 * Utilities for handling large text data sent to AI models.
 */

/**
 * Splits text into chunks of a specified size with overlap.
 * @param {string} text - The text to split.
 * @param {number} maxChunkSize - Maximum size of each chunk (in characters).
 * @param {number} overlap - Number of characters to overlap between chunks.
 * @returns {string[]} - Array of text chunks.
 */
export const chunkText = (text, maxChunkSize = 20000, overlap = 1000) => {
  if (!text || text.length <= maxChunkSize) return [text];

  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChunkSize;
    
    // If not at the end, try to find a natural break point (newline or period)
    if (endIndex < text.length) {
      const lastNewline = text.lastIndexOf('\n', endIndex);
      if (lastNewline > startIndex + (maxChunkSize * 0.8)) {
        endIndex = lastNewline;
      } else {
        const lastPeriod = text.lastIndexOf('. ', endIndex);
        if (lastPeriod > startIndex + (maxChunkSize * 0.8)) {
          endIndex = lastPeriod + 1;
        }
      }
    }

    chunks.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex - overlap;
    
    // Prevent infinite loop if overlap is somehow >= chunk size
    if (startIndex >= text.length || overlap >= maxChunkSize) break;
  }

  return chunks;
};

/**
 * Simple token estimator (4 chars per token average)
 */
export const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};
