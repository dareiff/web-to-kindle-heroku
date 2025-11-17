import express from 'express';
import puppeteer from 'puppeteer-core';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import helmet from 'helmet';

// Promisify execFile for modern async/await usage
const execFileAsync = promisify(execFile);

// Configuration with validation
const config = {
  port: process.env.PORT || 3003,
  screenshotUrl: process.env.SCREENSHOT_URL || 'https://home-ui.vercel.app/',
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH || '600', 10),
    height: parseInt(process.env.VIEWPORT_HEIGHT || '800', 10),
  },
  kindleResolution: {
    width: parseInt(process.env.KINDLE_WIDTH || '1200', 10),
    height: parseInt(process.env.KINDLE_HEIGHT || '1600', 10),
  },
  // Detect Chrome path dynamically for different environments
  chromePath:
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined),
};

const app = express();

// Security middleware
app.use(helmet());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Main screenshot endpoint
 * Captures a screenshot of the configured URL and converts it to Kindle-ready format
 */
app.get('/', async (req, res) => {
  const tempFile = `/tmp/screenshot-${Date.now()}.png`;
  let browser = null;

  try {
    console.log(`[${new Date().toISOString()}] Starting screenshot capture...`);

    // Launch browser with appropriate configuration
    const launchOptions = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    // Only set executablePath if we have one (Heroku buildpack provides it via env)
    if (config.chromePath) {
      launchOptions.executablePath = config.chromePath;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Set viewport to match Kindle aspect ratio
    await page.setViewport(config.viewport);

    // Navigate to target URL
    console.log(`[${new Date().toISOString()}] Navigating to: ${config.screenshotUrl}`);
    await page.goto(config.screenshotUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Capture screenshot
    await page.screenshot({ path: tempFile });
    console.log(`[${new Date().toISOString()}] Screenshot captured`);

    // Close browser before processing image
    await browser.close();
    browser = null;

    // Convert image to Kindle-ready format
    console.log(`[${new Date().toISOString()}] Converting to Kindle format...`);
    await convertToKindleFormat(tempFile);

    // Read the processed image
    const screenshot = await readFile(tempFile);

    // Clean up temp file
    await unlink(tempFile).catch((err) =>
      console.error('Failed to delete temp file:', err)
    );

    // Send response
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
    });
    res.end(screenshot);

    console.log(`[${new Date().toISOString()}] Screenshot delivered successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);

    // Ensure browser is closed on error
    if (browser) {
      await browser.close().catch(console.error);
    }

    // Clean up temp file on error
    await unlink(tempFile).catch(() => {});

    // Send error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate screenshot',
        message: error.message,
      });
    }
  }
});

/**
 * Converts an image to Kindle-ready format using ImageMagick
 * @param {string} filename - Path to the image file to convert
 * @returns {Promise<void>}
 */
async function convertToKindleFormat(filename) {
  const args = [
    filename,
    '-gravity',
    'center',
    '-resize',
    `${config.kindleResolution.width}x${config.kindleResolution.height}`,
    '-colorspace',
    'gray',
    '-depth',
    '8',
    filename,
  ];

  try {
    const { stdout, stderr } = await execFileAsync('convert', args);
    if (stderr) {
      console.warn('ImageMagick stderr:', stderr);
    }
    return stdout;
  } catch (error) {
    console.error('ImageMagick conversion failed:', {
      error: error.message,
      stderr: error.stderr,
    });
    throw new Error('Image conversion failed');
  }
}

// Start server
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Web to Kindle Screenshot Service    ║
╚════════════════════════════════════════╝

🚀 Server running on port ${config.port}
📸 Screenshot URL: ${config.screenshotUrl}
📱 Viewport: ${config.viewport.width}x${config.viewport.height}
📖 Kindle Resolution: ${config.kindleResolution.width}x${config.kindleResolution.height}
🔗 Health check: http://localhost:${config.port}/health

Ready to serve Kindle-optimized screenshots!
  `);
});
