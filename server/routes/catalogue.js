//for client side "blob"
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

//utils
const verify = require('../utils/verify');
const verifyClientToken = require('../utils/verifyClientToken');

//controllers
const { deleteAllFiles } = require('../controllers/catalogueController');


const { MongoClient, GridFSBucket, ObjectId } = require('mongodb'); // Add this at the top

let client;
let gfsBucket;

// Initialize connection
async function initGridFS() {
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  gfsBucket = new GridFSBucket(client.db(), {
    bucketName: 'pdfs',
    chunkSizeBytes: 255 * 1024 // Match MongoDB default
  });
}

// Ensure GridFS is initialized
initGridFS().then(() => {
  console.log('GridFS initialized');
}).catch(err => {
  console.error('GridFS init error:', err);
});


// Upload endpoint
router.post('/upload', verify, async (req, res) => {
  try {
    console.log('req.files:', req.files);
    const uploadedPdf = req.files?.pdf;

    if (!uploadedPdf) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!gfsBucket) {
      return res.status(503).json({ error: 'GridFS is not initialized yet' });
    }

    // Now safely access properties
    const pdfBuffer = Buffer.from(uploadedPdf.data);
    const filename = uploadedPdf.name;

    // Create upload stream with explicit BSON types
    const uploadStream = gfsBucket.openUploadStream(filename, {
      id: new ObjectId(), // Use BSON 5.x ObjectId
      metadata: {
        uploadedAt: new Date(),
        contentType: req.files.pdf.mimetype
      }
    });

    // Pipe the buffer to GridFS
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(pdfBuffer);
    bufferStream.pipe(uploadStream);

    uploadStream.on('finish', () => {
      res.status(201).json({
        id: uploadStream.id.toString(),
        filename: filename,
        size: uploadStream.length
      });
    });

    uploadStream.on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).json({ 
        error: 'Upload failed',
        bsonVersion: process.versions.bson
      });
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Delete all PDFs route
router.delete('/clear', verify, deleteAllFiles);

//view all
// Assuming gfsBucket is already initialized
router.get('/files', verify, async (req, res) => {
  try {
    // Fetch all files from the GridFS bucket
    const files = await gfsBucket.find({}).toArray();

    // Format response to include metadata (like filename, upload date, and isPrimary)
    const filesResponse = files.map(file => ({
      id: file._id.toString(),
      filename: file.filename,
      size: file.length,
      chunkSize: file.chunkSize,
      uploadDate: file.uploadDate,
      isPrimary: file.metadata?.isPrimary || false, // Ensure 'isPrimary' is included in response
    }));

    res.status(200).json({
      message: 'Files fetched successfully',
      files: filesResponse,
    });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({
      error: 'Failed to fetch files',
    });
  }
});



// View Endpoint (for admin)
router.get('/pdf/:id', verify, async (req, res) => {
  try {
    // Validate ID format first
    const idString = req.params.id;
    
    // Check if ID is valid MongoDB ObjectID
    if (!ObjectId.isValid(idString)) {
      return res.status(400).json({
        error: 'Invalid file ID format',
        expected: '24-character hex string',
        received: idString
      });
    }

    // Convert to ObjectID
    const fileId = new ObjectId(idString);
    
    // Configure download stream with error handling
    const downloadStream = gfsBucket.openDownloadStream(fileId, {
      sort: { n: 1 },
      allowDiskUse: true
    });

    // Set headers first
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileId.toString()}.pdf"`
    });

    // Handle stream errors
    downloadStream.on('error', (err) => {
      if (err.message.includes('FileNotFound')) {
        return res.status(404).json({ error: 'File not found' });
      }
      console.error('Stream error:', err);
      res.status(500).json({ error: 'Download failed' });
    });

    // Pipe to response
    downloadStream.pipe(res);

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Set a file as primary (and unset others)
router.post('/setPrimary', verify, async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'No fileId provided' });
    }

    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid fileId format' });
    }

    const parsedFileId = new ObjectId(fileId);

    // Unset isPrimary from all files
    const unsetResult = await client
      .db()
      .collection('pdfs.files')
      .updateMany({}, { $set: { 'metadata.isPrimary': false } });
      
    // Set the selected file as primary
    const setResult = await client
      .db()
      .collection('pdfs.files')
      .updateOne(
        { _id: parsedFileId },
        { $set: { 'metadata.isPrimary': true } }
      );

    if (setResult.modifiedCount > 0) {
      return res.status(200).json({ message: 'Primary file updated successfully' });
    } else {
      return res.status(404).json({ error: 'File not found or already primary' });
    }
    
  } catch (err) {
    console.error('Error in setPrimary route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//get count of pdfs
router.get('/count', verify, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    
    const files = await bucket.find({}).toArray();
    const fileCount = files.length;

    res.status(200).json({
      message: 'Catalogue file count fetched successfully',
      count: fileCount
    });
  } catch (err) {
    console.error('Error fetching catalogue count:', err);
    res.status(500).json({
      message: 'Failed to fetch catalogue file count',
      error: err.message
    });
  }
});


//View for client
router.get('/client/pdf/primary', verifyClientToken, async (req, res) => {
  try {
    const files = await gfsBucket.find({ 'metadata.isPrimary': true }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No primary catalogue found' });
    }

    const primaryFile = files[0];
    console.log("Primary file _id:", primaryFile._id);
    const downloadStream = gfsBucket.openDownloadStream(new ObjectId(primaryFile._id));

    const chunks = [];

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', (err) => {
      console.error('Error during download stream:', err);
      return res.status(500).json({ message: 'Error streaming file' });
    });

    downloadStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length,
        'Content-Disposition': 'inline; filename="catalogue.pdf"',
      });
      res.end(buffer);
    });
  } catch (err) {
    console.error('Server error retrieving primary file:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;
