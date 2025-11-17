# Web to Kindle Screenshot Service

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

A modern, lightweight service that converts web pages into Kindle-optimized screenshot images. Perfect for saving web content to read on your Kindle device.

## Features

- **Kindle-Optimized**: Automatically converts screenshots to grayscale and Kindle-friendly dimensions (1200x1600px)
- **Modern Codebase**: Built with ES modules, modern JavaScript, and best practices
- **Easy Deployment**: One-click Heroku deployment with proper buildpacks
- **Configurable**: Environment-based configuration for different use cases
- **Health Monitoring**: Built-in health check endpoint for monitoring
- **Secure**: Implements security best practices with Helmet.js

## How It Works

1. **Capture**: Uses Puppeteer to render and screenshot a web page
2. **Optimize**: Converts the image using ImageMagick to grayscale and Kindle dimensions
3. **Deliver**: Returns the processed PNG image ready for your Kindle

## Quick Start

### Deploy to Heroku

Click the deploy button above or run:

```bash
git clone https://github.com/dareiff/web-to-kindle-heroku.git
cd web-to-kindle-heroku
heroku create
git push heroku main
```

### Local Development

**Prerequisites:**

- Node.js >= 18.0.0
- Chrome or Chromium browser
- ImageMagick (`convert` command)

**Installation:**

```bash
# Clone the repository
git clone https://github.com/dareiff/web-to-kindle-heroku.git
cd web-to-kindle-heroku

# Install dependencies
npm install

# Copy environment template (optional)
cp .env.example .env

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

**Install ImageMagick:**

```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Windows (via Chocolatey)
choco install imagemagick
```

## Configuration

Configure the service using environment variables:

| Variable                    | Default                       | Description                              |
| --------------------------- | ----------------------------- | ---------------------------------------- |
| `PORT`                      | `3003`                        | Server port                              |
| `SCREENSHOT_URL`            | `https://home-ui.vercel.app/` | URL to capture                           |
| `VIEWPORT_WIDTH`            | `600`                         | Browser viewport width                   |
| `VIEWPORT_HEIGHT`           | `800`                         | Browser viewport height                  |
| `KINDLE_WIDTH`              | `1200`                        | Final image width                        |
| `KINDLE_HEIGHT`             | `1600`                        | Final image height                       |
| `PUPPETEER_EXECUTABLE_PATH` | Auto-detected                 | Path to Chrome/Chromium (Heroku sets it) |

## API Endpoints

### `GET /`

Captures and returns a Kindle-optimized screenshot.

**Response:**

- Content-Type: `image/png`
- Body: Processed screenshot image

**Example:**

```bash
curl http://localhost:3003/ > screenshot.png
```

### `GET /health`

Health check endpoint for monitoring.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T12:00:00.000Z",
  "uptime": 123.456
}
```

## Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run lint       # Check code for issues
npm run lint:fix   # Fix linting issues automatically
npm run format     # Format code with Prettier
npm run format:check # Check if code is formatted
```

### Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **ES Modules** for modern JavaScript
- **Helmet** for security headers

### Project Structure

```
web-to-kindle-heroku/
├── index.js              # Main application
├── package.json          # Dependencies and scripts
├── eslint.config.js      # ESLint configuration
├── .prettierrc.json      # Prettier configuration
├── .env.example          # Environment variables template
├── app.json              # Heroku app configuration
├── Procfile              # Heroku process file
└── README.md             # This file
```

## Troubleshooting

### Chrome not found

**Local Development:**
Set the Chrome path in `.env`:

```bash
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
```

**Heroku:**
The buildpack automatically sets this. If issues persist, check buildpack configuration in `app.json`.

### ImageMagick not found

Ensure ImageMagick is installed:

```bash
# Test if convert is available
convert --version
```

For Heroku, ImageMagick is included in the default stack.

### Port already in use

Change the port in `.env` or set it when running:

```bash
PORT=8080 npm start
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint:fix` and `npm run format`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Puppeteer](https://pptr.dev/) for browser automation
- Uses [ImageMagick](https://imagemagick.org/) for image processing
- Inspired by the need to read web content on Kindle devices
