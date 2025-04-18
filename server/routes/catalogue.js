const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

//utils
const verify = require('../utils/verify');

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



// View Endpoint
router.get('/pdf/:id', async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    
    // Add sorting options
    const downloadStream = gfsBucket.openDownloadStream(fileId, {
      sort: { n: 1 }, // Ensure proper chunk order
      allowDiskUse: true // Bypass memory limit
    });

    res.set('Content-Type', 'application/pdf');
    
    downloadStream.on('error', (err) => {
      if (err.message.includes('FileNotFound')) {
        return res.status(404).send('File not found');
      }
      console.error('Stream error:', err);
      res.status(500).send('Download error');
    });

    downloadStream.pipe(res);

  } catch (err) {
    console.error('ID conversion error:', err);
    res.status(400).send('Invalid file ID format');
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



module.exports = router;
