const Resume = require('../models/Resume');
const aiService = require('../services/aiService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

exports.createResume = async (req, res) => {
  try {
    const resume = await Resume.create({
      userId: req.user.id,
      title: req.body.title || 'Untitled Resume',
      template: req.body.template || 'classic',
      content: req.body.content || {}
    });
    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.importResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    let text = '';
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Only PDF and DOCX files are supported' });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the file' });
    }

    // Call AI service to parse
    const parsedData = await aiService.parseResumeToJson(text);

    res.status(200).json({ success: true, data: parsedData });
  } catch (error) {
    console.error('Import Resume Error:', error);
    res.status(500).json({ success: false, message: 'Error importing resume' });
  }
};

exports.aiAssist = async (req, res) => {
  try {
    const { text, action } = req.body;
    if (!text || !action) {
      return res.status(400).json({ success: false, message: 'Please provide text and action' });
    }

    const validActions = ['grammar', 'rewrite', 'ats'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const enhancedText = await aiService.enhanceResumeContent(text, action);
    res.status(200).json({ success: true, data: { result: enhancedText } });
  } catch (error) {
    console.error('AI Assist Error:', error);
    res.status(500).json({ success: false, message: 'Error calling AI assistant' });
  }
};
