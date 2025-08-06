function process_python()
{
    __dirname = "/home/ec2-user/golf-upload"
    const pythonScriptPath = path.join(__dirname, 'golfid.py');
  
  // Check if python3 is available
  let pythonVersion = '';
  try {
    pythonVersion = execSync('python3 --version').toString().trim();
    console.log(`Python version: ${pythonVersion}`);
  } catch (err) {
    console.error('Python3 not found:', err.message);
    return res.status(500).send(`
      ${htmlHeader}
      <div class="flex-grow flex items-center justify-center">
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h1 class="text-3xl font-bold mb-4 text-red-400">Error Running Script</h1>
          <p class="mb-6">Python3 interpreter not found. Ensure python3 is installed and in PATH.</p>
          <a href="/" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">Back to Main Page</a>
        </div>
      </div>
      </body>
      </html>
    `);
  }

  // Check if script exists
  try {
    await fs.access(pythonScriptPath, fs.constants.F_OK | fs.constants.R_OK);
    console.log(`Script found: ${pythonScriptPath}`);
  } catch (err) {
    console.error('Script access error:', err.message);
    return res.status(500).send(`
      ${htmlHeader}
      <div class="flex-grow flex items-center justify-center">
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h1 class="text-3xl font-bold mb-4 text-red-400">Error Running Script</h1>
          <p class="mb-6">Python script 'golfid.py' not found or not readable.</p>
          <a href="/" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">Back to Main Page</a>
        </div>
      </div>
      </body>
      </html>
    `);
  }