const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

const deleteAllFiles = async (req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    
    // Get and delete all files
    const allFiles = await bucket.find({}).toArray();
    await Promise.all(allFiles.map(file => bucket.delete(file._id)));
    
    console.log(`Deleted ${allFiles.length} previous files`);
    next(); // Proceed to upload after successful deletion
  } catch (err) {
    console.error('Deletion error:', err);
    return res.status(500).json({ 
      error: 'Failed to clear existing files',
      details: err.message
    });
  }
};
module.exports = { deleteAllFiles };