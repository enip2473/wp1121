const express = require('express');
const multer = require('multer');
const router = express.Router();

// Specify the storage and upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    // Define the filename for the uploaded file (you can adjust as needed)
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Define the route for file uploads
router.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  console.log(req.file)
  const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;
  console.log(fileUrl)
  res.json({ photo: fileUrl });
});

module.exports = router;
