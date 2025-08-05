const express = require('express');
const { spawn } = require('child_process');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process'); // For checking python3
const app = express();
const port = 8080;

// Create uploads directory and subdirectories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const subDirs = [   'bridgestone'   , 
                    'callaway'      , 
                    'mizuno'        , 
                    'nitro'         , 
                    'pinnacle'      ,
                    'srixon'        ,
                    'taylormade'    , 
                    'titleist'      , 
                    'top-flite'      ,
                    'wilson'        , 
                    'vice'          , 
                    'volvik'
                ];

async function setupDirectories() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    for (const subDir of subDirs) {
      const dirPath = path.join(uploadsDir, subDir);
      await fs.mkdir(dirPath, { recursive: true });
      app.use(`/uploads/${subDir}`, express.static(dirPath));
    }
  } catch (err) {
    console.error('Error setting up directories:', err);
  }
}

// Call setupDirectories and handle errors
setupDirectories().catch(err => console.error('Failed to initialize directories:', err));

// Serve static files from 'public' and 'uploads'
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Set up storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, gif) are allowed'));
  }
});

// Common HTML header with Tailwind CSS CDN
const htmlHeader = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Golfball Golf Ai Image Upload</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-900 text-white min-h-screen flex flex-col">
    <nav class="bg-gray-800 p-4 shadow-lg">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold">Ai Golfball Photo Classification</h1>
        <div class="space-x-4">
          <a href="/" class="text-blue-400 hover:text-blue-300">Home</a>
          <a href="/images" class="text-blue-400 hover:text-blue-300">Gallery</a>
        </div>
      </div>
    </nav>
`;

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send(`
      ${htmlHeader}
      <div class="flex-grow flex items-center justify-center">
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h1 class="text-3xl font-bold mb-4 text-red-400">Upload Failed</h1>
          <p class="mb-6">No image was uploaded. Please try again.</p>
          <a href="/" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">Back to Main Page</a>
        </div>
      </div>
      </body>
      </html>
    `);
  }

  res.send(`
    ${htmlHeader}
    <div class="flex-grow flex items-center justify-center">
      <div class="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 class="text-3xl font-bold mb-4 text-green-400">Image Uploaded Successfully!</h1>
        <p class="mb-4">File: ${req.file.filename}</p>
        <img src="/uploads/${req.file.filename}" alt="Uploaded image" class="w-full max-w-xs mx-auto mb-6 rounded-lg">
        <div class="flex justify-center space-x-4">
          <a href="/" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">Back to Main Page</a>
          <a href="/images" class="inline-block bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">View Gallery</a>
        </div>
      </div>
    </div>
    </body>
    </html>
  `);
});

// Route to view uploaded images
app.get('/images', async (req, res) => {
  try {
    let html = `
      ${htmlHeader}
      <div class="flex-grow p-6">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-3xl font-bold text-center mb-6">Uploaded Golfball Photos</h1>
    `;

    const isImageFile = (filename) => /\.(jpg|jpeg|png|gif)$/i.test(filename);
    const mainFiles = await fs.readdir(uploadsDir, { withFileTypes: true });
    const rootImages = mainFiles.filter(dirent => dirent.isFile() && isImageFile(dirent.name));
    
    html += `
      <h2 class="text-2xl font-semibold mb-4">Ai image uploads</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
    `;
    if (rootImages.length === 0) {
      html += `<p class="col-span-3 text-center">No images in general uploads</p>`;
    } else {
      for (const file of rootImages) {
        html += `
          <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <img src="/uploads/${file.name}" alt="Golfball photo" class="w-full h-48 object-cover">
          </div>
        `;
      }
    }
    html += `</div>`;

    for (const subDir of subDirs) {
      const subDirPath = path.join(uploadsDir, subDir);
      const files = await fs.readdir(subDirPath, { withFileTypes: true });
      const images = files.filter(dirent => dirent.isFile() && isImageFile(dirent.name));
      
      html += `
        <h2 class="text-2xl font-semibold mb-4">${subDir.charAt(0).toUpperCase() + subDir.slice(1)}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      `;
      if (images.length === 0) {
        html += `<p class="col-span-3 text-center">No images in ${subDir}</p>`;
      } else {
        for (const file of images) {
          html += `
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <img src="/uploads/${subDir}/${file.name}" alt="${subDir} photo" class="w-full h-48 object-cover">
            </div>
          `;
        }
      }
      html += `</div>`;
    }

    html += `
          <div class="text-center mt-6">
            <a href="/" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">Back to Main Page</a>
          </div>
        </div>
      </div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.send(`
      ${htmlHeader}
      <div class="flex-grow flex items-center justify-center">
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h1 class="text-3xl font-bold mb-4 text-red-400">Error Reading Images</h1>
          <p class="mb-6">${err.message}</p>
          <a href="/" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">Back to Main Page</a>
        </div>
      </div>
      </body>
      </html>
    `);
  }
});

// Route to trigger Python script
app.get('/run-python', async (req, res) => {
    const pythonScriptPath = path.join(__dirname, 'golfid.py');

    // Check if python3 is available
    let pythonVersion = '';
    try {
        pythonVersion = execSync('python3 --version').toString().trim();
        console.log(`Python version: ${pythonVersion}`);
    } catch (err) {
        console.error('Python3 not found:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Python3 interpreter not found. Ensure python3 is installed and in PATH.'
        });
    }

    // Check if script exists
    try {
        await fs.access(pythonScriptPath, fs.constants.F_OK | fs.constants.R_OK);
        console.log(`Script found: ${pythonScriptPath}`);
    } catch (err) {
        console.error('Script access error:', err.message);
        return res.status(500).json({
            success: false,
            error: "Python script 'golfid.py' not found or not readable."
        });
    }

    // Run the script with explicit working directory
    const pythonProcess = spawn('python3', [pythonScriptPath], {
        cwd: __dirname,
        env: { ...process.env },
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        console.log(`Python stdout: ${dataStr}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        const dataStr = data.toString();
        errorOutput += dataStr;
        console.error(`Python stderr: ${dataStr}`);
    });

    pythonProcess.on('error', (err) => {
        errorOutput += `Failed to start Python process: ${err.message}\n`;
        console.error(`Python process error: ${err.message}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code: ${code}`);
        if (code === 0 && !errorOutput) {
            try {
                // Try parsing output as JSON
                const parsedOutput = JSON.parse(output);
                return res.json(parsedOutput);
            } catch (parseError) {
                // If not JSON, return raw output
                return res.json({
                    success: true,
                    output: output.trim()
                });
            }
        } else {
            return res.status(500).json({
                success: false,
                error: errorOutput || output || 'Unknown error occurred'
            });
        }
    });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
