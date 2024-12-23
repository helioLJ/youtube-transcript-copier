# YouTube Transcript Copier

A Chrome extension that enhances YouTube's transcript functionality by adding a convenient "Copy Transcript" button alongside the video's interaction buttons (like, dislike, share).

## Features

### Core Functionality
- 🎯 Adds a "Copy Transcript" button in YouTube's native style
- 📋 One-click transcript copying
- 🔄 Works with dynamically loaded content
- 📊 Shows character count in a readable format (e.g., "15k chars")

### Smart Transcript Handling
- 🔄 Intelligent splitting options:
  - **Auto-split for LLMs**: Automatically splits transcripts based on model limits
    - GPT-4 (400k characters)
    - GPT-3.5 (13k characters)
    - Custom limit (user-defined)
  - **No split**: Copy entire transcript with length warning
- ⚡ Modern notification system for multi-part copying
- ⏰ Optional timestamps inclusion
- 🎨 Smooth animations and visual feedback

### Customization Options
- 🌐 Multi-language Support:
  - English
  - Portuguese
  - Spanish
  - Automatically detects YouTube interface language
  - Configurable prompt language

### AI-Friendly Prompt Types
Choose from different AI-friendly prompt templates:
1. **General Summary**: Request a summary highlighting main points and key takeaways
2. **Detailed Analysis**: Ask for an in-depth analysis of topics and conclusions
3. **Bullet Point Summary**: Get the transcript summarized in concise bullet points
4. **Section-wise Summary**: Request the content divided into main sections with summaries

### User Experience
- 🎨 YouTube-styled UI integration
- ✨ Smooth animations and feedback
- 📱 Responsive design
- 🔔 Modern notification system for:
  - Long transcript warnings
  - Multi-part copy progress
  - Success confirmations
- 📝 Character count display with 'k' formatting (e.g., "15k")

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any YouTube video with available transcripts
2. Click the "Copy Transcript" button next to the share button
3. Configure your preferences:
   - Choose split mode (Auto-split/No split)
   - Select LLM model or set custom character limit
   - Choose prompt type
   - Toggle timestamps
   - Select language

### Configuration
Click the extension icon to access settings:
- **Split Options**:
  - Auto-split for LLMs
    - GPT-4 (400k chars)
    - GPT-3.5 (13k chars)
    - Custom character limit
  - No split (with length warning)
- **Prompt Types**: Choose from various AI-friendly templates
- **Language Settings**: Interface and prompt language options
- **Timestamp Toggle**: Include/exclude timestamps

## Technical Details

### Permissions Required
- `clipboardWrite`: For copying text to clipboard
- `storage`: For saving user preferences
- `host_permissions`: Limited to YouTube.com

### Browser Compatibility
- Chrome/Chromium-based browsers
- Manifest V3 compliant

### Features Implementation
- Smart character-based transcript splitting
- LLM-specific character limits
- Modern notification system replacing traditional alerts
- Intelligent character count formatting (k format)
- Multi-language support with automatic detection
- Customizable AI prompts

## Development

Built using:
- JavaScript
- Chrome Extension APIs
- YouTube's native styling

### File Structure
```bash
.
├── content.js
├── icon128.png
├── icon16.png
├── icon48.png
├── manifest.json
├── popup.html
├── popup.js
├── README.md

2 directories, 12 files
```


## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
