# Web Chatbot

A modern, responsive web chatbot built with HTML, CSS, and JavaScript. Features a beautiful UI with smooth animations and a fixed bot response system.

## Features

- 🎨 **Modern Design**: Clean, responsive interface with gradient backgrounds and smooth animations
- 💬 **Real-time Chat**: Instant message display with typing indicators
- 🤖 **Fixed Bot Responses**: Pre-defined responses that rotate randomly
- 📱 **Mobile Responsive**: Works perfectly on desktop and mobile devices
- ⌨️ **Keyboard Support**: Send messages with Enter key
- 🕐 **Timestamps**: Each message shows the current time
- 💡 **Quick Suggestions**: Clickable sample questions for easy interaction

## How to Use

1. **Open the Application**:
   - Simply open `index.html` in any modern web browser
   - No server setup required - it works locally

2. **Start Chatting**:
   - Type your message in the input field
   - Press Enter or click the send button
   - The bot will respond with a random pre-defined message

3. **Quick Start**:
   - Use the suggestion buttons below the input to quickly ask common questions
   - Watch the typing indicator while the bot "thinks"

## File Structure

```
website-chatbot/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Customization

### Adding New Bot Responses

Edit the `botResponses` array in `script.js`:

```javascript
this.botResponses = [
    "Your new response here",
    "Another response",
    // Add more responses...
];
```

### Changing Colors

Modify the CSS variables in `styles.css` to change the color scheme:

```css
/* Main gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Styling Modifications

- **Chat container size**: Modify `.chat-container` max-width and height
- **Message bubbles**: Adjust `.message-content` styling
- **Animations**: Modify the `@keyframes` definitions

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Future Enhancements

- Integration with real AI APIs
- Message history persistence
- File upload support
- Voice input/output
- Custom bot personalities
- Multi-language support

## License

This project is open source and available under the MIT License.
