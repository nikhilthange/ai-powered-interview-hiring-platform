const fs = require('fs');
const path = require('path');
const { extractTextFromFile } = require('../utils/fileParser');
const AppError = require('../utils/appError');

function cleanup(filePath) {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('[resumeService] Cleanup error:', err.message);
    });
  }
}

async function extractText(filePath, originalName) {
  const text = await extractTextFromFile(filePath, originalName);
  if (!text || text.trim().length < 50) {
    cleanup(filePath);
    throw new AppError('Could not extract enough text from the uploaded file. Please ensure the file contains readable text.', 400);
  }
  return text;
}

async function extractTextFromUrl(resumeUrl) {
  if (!resumeUrl) return '';
  const filename = path.basename(resumeUrl);
  const filePath = path.join(__dirname, '../uploads', filename);
  try {
    if (!fs.existsSync(filePath)) return '';
    return await extractTextFromFile(filePath, filename);
  } catch (err) {
    console.error('[resumeService] Failed to extract text from existing resume:', err.message);
    return '';
  }
}

module.exports = { extractText, cleanup, extractTextFromUrl };
