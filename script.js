class Chatbot {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.botResponses = [
            "That's an interesting question! Let me think about that for a moment.",
            "I understand what you're asking. Here's what I can tell you about that.",
            "Great question! Based on my knowledge, I can help you with that.",
            "I'm here to help! Let me provide you with some information on that topic.",
            "Thanks for asking! Here's what I know about that subject.",
            "I appreciate your question. Let me share some insights with you.",
            "That's a good point! Let me explain what I understand about this.",
            "I'm glad you asked that! Here's what I can tell you.",
            "Interesting perspective! Let me provide some information on that.",
            "I'd be happy to help with that! Here's what I know."
        ];
        
        this.init();
    }
    
    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-focus on input
        this.messageInput.focus();
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate bot thinking time
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateBotResponse();
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = text;
        content.appendChild(messageText);
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    generateBotResponse() {
        const randomIndex = Math.floor(Math.random() * this.botResponses.length);
        const response = this.botResponses[randomIndex];
        this.addMessage(response, 'bot');
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Enable/disable send button based on input
    messageInput.addEventListener('input', () => {
        sendButton.disabled = !messageInput.value.trim();
    });
    
    // Add some sample questions for demonstration
    const sampleQuestions = [
        "What can you help me with?",
        "Tell me about yourself",
        "How does this work?",
        "What are your capabilities?"
    ];
    
    // Add sample questions as clickable suggestions (optional enhancement)
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions';
    suggestionsContainer.style.cssText = `
        padding: 10px 20px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    `;
    
    sampleQuestions.forEach(question => {
        const suggestion = document.createElement('button');
        suggestion.textContent = question;
        suggestion.style.cssText = `
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 15px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        suggestion.addEventListener('mouseenter', () => {
            suggestion.style.background = '#e9ecef';
        });
        
        suggestion.addEventListener('mouseleave', () => {
            suggestion.style.background = 'white';
        });
        
        suggestion.addEventListener('click', () => {
            messageInput.value = question;
            messageInput.focus();
        });
        
        suggestionsContainer.appendChild(suggestion);
    });
    
    // Insert suggestions after the input container
    const inputContainer = document.querySelector('.chat-input-container');
    inputContainer.parentNode.insertBefore(suggestionsContainer, inputContainer.nextSibling);
});
