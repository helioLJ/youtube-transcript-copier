# YouTube Transcript Copier 🎥

A Chrome extension that enhances YouTube's transcript functionality by adding a convenient "Copy Transcript" button alongside the video's interaction buttons (like, dislike, share). Perfect for content creators, researchers, and anyone working with AI language models.

<p align="center">
  <img src="store_assets/demo.gif" alt="Demo of YouTube Transcript Copier in action">
</p>

## ✨ Features

### 🎯 Core Functionality
- One-click transcript copying with YouTube-native UI integration
- Smart character count display (e.g., "15k chars")
- Seamless integration with YouTube's interface
- Works with dynamically loaded content

### 🤖 AI-Ready Features
- **Smart Splitting for AI Models**:
  - GPT-4 (400k chars)
  - GPT-3.5 (13k chars)
  - Custom character limits
- **AI-Friendly Prompt Templates**:
  - General Summary
  - Detailed Analysis
  - Bullet Points
  - Section-wise Summary

### 🌍 Accessibility & Customization
- **Multi-language Support**:
  - English
  - Portuguese
  - Spanish
  - Auto-detects YouTube interface language
- **Flexible Options**:
  - Optional timestamps inclusion
  - Customizable prompt language
  - Adjustable character limits

## 🚀 Installation

1. Download the latest release or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension directory

## 📖 Usage

1. Navigate to any YouTube video with available transcripts
2. Look for the "Copy Transcript" button next to the share button
3. Click to copy with your configured settings

### ⚙️ Configuration
Access settings via the extension popup:
- Language preferences
- AI prompt templates
- Splitting options
- Character limits
- Timestamp toggles

## 🛠️ Technical Details

### Browser Support
- Chrome/Chromium-based browsers
- Manifest V3 compliant

### Required Permissions
- `clipboardWrite`: For copying text
- `storage`: For user preferences
- `host_permissions`: YouTube.com only

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy

This extension:
- Does not collect any personal data
- Stores preferences locally only
- Does not use analytics or tracking
- Does not share data with third parties

See [PRIVACY.md](PRIVACY.md) for details.

---

<p align="center">
  Made with ❤️ for YouTube users and AI enthusiasts
</p>
