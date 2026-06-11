const fs = require('fs');
const path = require('path');
const util = require('util');
const AppError = require('./appError');

const readFile = util.promisify(fs.readFile);

async function extractTextFromPDF(filePath) {
  let pdfParse;
  try {
    const pdfParseModule = require('pdf-parse');
    pdfParse = pdfParseModule.default || pdfParseModule;
  } catch (err) {
    console.error('[fileParser] Failed to load pdf-parse module:', err.message);
    throw new AppError('PDF parsing library is not available.', 500);
  }

  let buffer;
  try {
    buffer = await readFile(filePath);
  } catch (err) {
    console.error(`[fileParser] Failed to read file at ${filePath}:`, err.message);
    throw new AppError('Failed to read uploaded file.', 500);
  }

  try {
    const data = await pdfParse(buffer);
    const text = data.text || '';
    console.log(`[fileParser] Extracted ${text.length} chars from PDF`);
    return text;
  } catch (err) {
    console.error('[fileParser] PDF extraction failed:', err.message, err.stack);
    throw new AppError(
      'Failed to extract text from PDF. The file may be corrupted or password-protected.',
      400
    );
  }
}

async function extractTextFromDOCX(filePath) {
  let buffer;
  try {
    buffer = await readFile(filePath);
  } catch (err) {
    console.error(`[fileParser] Failed to read file at ${filePath}:`, err.message);
    throw new AppError('Failed to read uploaded file.', 500);
  }

  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';
    console.log(`[fileParser] Extracted ${text.length} chars from DOCX`);
    return text;
  } catch (err) {
    console.error('[fileParser] DOCX extraction failed:', err.message, err.stack);
    throw new AppError(
      'Failed to extract text from DOCX. The file may be corrupted.',
      400
    );
  }
}

async function extractTextFromFile(filePath, originalName) {
  if (!filePath) {
    throw new AppError('No file path provided.', 500);
  }
  const ext = path.extname(originalName || '').toLowerCase();
  console.log(`[fileParser] Extracting text from ${ext} file: ${filePath}`);
  if (ext === '.pdf') return extractTextFromPDF(filePath);
  if (ext === '.docx' || ext === '.doc') return extractTextFromDOCX(filePath);
  throw new AppError('Unsupported file format. Only PDF and DOCX files are supported.', 400);
}

module.exports = { extractTextFromFile, extractTextFromPDF, extractTextFromDOCX };
