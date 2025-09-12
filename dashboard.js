class ConversationDashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.conversations = [];
        this.currentConversation = null;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.loadConversations();
    }
    
    bindEvents() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadConversations();
        });
        
        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterConversations(e.target.value);
        });
        
        // Close details button
        document.getElementById('closeDetails').addEventListener('click', () => {
            this.closeConversationDetails();
        });
        
        // Error modal close
        document.getElementById('closeErrorModal').addEventListener('click', () => {
            this.hideErrorModal();
        });
        
        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.hideErrorModal();
            this.loadConversations();
        });
        
        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.showClearAllConfirmation();
        });
        
        // Analyze lead button
        document.getElementById('analyzeLeadBtn').addEventListener('click', () => {
            this.analyzeLead();
        });
    }
    
    async loadConversations() {
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/sessions`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.conversations = data.sessions || [];
            
            this.renderConversations();
            this.updateStats();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.hideLoading();
            this.showError('Failed to load conversations. Please check your connection and try again.');
        }
    }
    
    renderConversations() {
        const container = document.getElementById('conversationsList');
        
        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <p>No conversations found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.conversations.map(conversation => `
            <div class="conversation-item" data-session-id="${conversation.sessionId}">
                <div class="conversation-info">
                    <h4>
                        <i class="fas fa-comments"></i>
                        Conversation ${conversation.sessionId.substring(0, 8)}...
                        ${conversation.leadAnalyzed ? '<i class="fas fa-chart-line" style="color: #28a745; margin-left: 8px;" title="Lead analyzed"></i>' : ''}
                    </h4>
                    <p>Created: ${this.formatDate(conversation.createdAt)}</p>
                    <p>Last Activity: ${this.formatDate(conversation.lastActivity)}</p>
                    ${conversation.leadQuality ? `<p style="color: #667eea; font-weight: 600;">Lead Quality: ${conversation.leadQuality.toUpperCase()}</p>` : ''}
                </div>
                <div class="conversation-meta">
                    <div class="message-count">${conversation.messageCount} messages</div>
                    <div>Click to view</div>
                </div>
                <div class="conversation-actions">
                    <button class="btn-delete" data-session-id="${conversation.sessionId}" title="Delete conversation">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add click event listeners
        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger conversation view if delete button is clicked
                if (e.target.closest('.btn-delete')) {
                    return;
                }
                const sessionId = item.dataset.sessionId;
                this.loadConversationDetails(sessionId);
            });
        });
        
        // Add delete button event listeners
        container.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering conversation view
                const sessionId = button.dataset.sessionId;
                this.showDeleteConfirmation(sessionId);
            });
        });
    }
    
    async loadConversationDetails(sessionId) {
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/conversation/${sessionId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.currentConversation = data;
            
            this.renderConversationDetails();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading conversation details:', error);
            this.hideLoading();
            this.showError('Failed to load conversation details. Please try again.');
        }
    }
    
    renderConversationDetails() {
        const title = document.getElementById('conversationTitle');
        const messagesContainer = document.getElementById('conversationMessages');
        const analyzeBtn = document.getElementById('analyzeLeadBtn');
        const leadAnalysis = document.getElementById('leadAnalysis');
        
        if (!this.currentConversation) {
            title.textContent = 'Select a conversation';
            analyzeBtn.style.display = 'none';
            leadAnalysis.style.display = 'none';
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-dots"></i>
                    <p>Select a conversation to view its messages</p>
                </div>
            `;
            return;
        }
        
        title.textContent = `Conversation ${this.currentConversation.sessionId.substring(0, 8)}...`;
        analyzeBtn.style.display = 'inline-flex';
        
        if (this.currentConversation.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <p>No messages in this conversation</p>
                </div>
            `;
            leadAnalysis.style.display = 'none';
            return;
        }
        
        messagesContainer.innerHTML = this.currentConversation.messages.map(message => `
            <div class="message-item ${message.role}-message">
                <div class="message-avatar">
                    <i class="fas ${message.role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
                </div>
                <div class="message-content">
                    <p class="message-text">${this.escapeHtml(message.content)}</p>
                    <span class="message-time">${this.formatTime(message.timestamp || this.currentConversation.createdAt)}</span>
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Show lead analysis if available
        if (this.currentConversation.leadAnalysis) {
            this.displayLeadAnalysis(this.currentConversation.leadAnalysis);
        } else {
            leadAnalysis.style.display = 'none';
        }
    }
    
    filterConversations(searchTerm) {
        const items = document.querySelectorAll('.conversation-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const sessionId = item.dataset.sessionId.toLowerCase();
            const messageCount = item.querySelector('.message-count').textContent.toLowerCase();
            const createdAt = item.querySelector('.conversation-info p').textContent.toLowerCase();
            
            const matches = sessionId.includes(term) || 
                          messageCount.includes(term) || 
                          createdAt.includes(term);
            
            item.style.display = matches ? 'flex' : 'none';
        });
    }
    
    closeConversationDetails() {
        this.currentConversation = null;
        this.renderConversationDetails();
    }
    
    updateStats() {
        const totalConversations = this.conversations.length;
        const totalMessages = this.conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
        
        // Count today's conversations
        const today = new Date().toDateString();
        const recentConversations = this.conversations.filter(conv => {
            const convDate = new Date(conv.createdAt).toDateString();
            return convDate === today;
        }).length;
        
        document.getElementById('totalConversations').textContent = totalConversations;
        document.getElementById('totalMessages').textContent = totalMessages;
        document.getElementById('recentConversations').textContent = recentConversations;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
    
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').classList.add('show');
    }
    
    hideErrorModal() {
        document.getElementById('errorModal').classList.remove('show');
    }
    
    showDeleteConfirmation(sessionId) {
        const conversation = this.conversations.find(conv => conv.sessionId === sessionId);
        const messageCount = conversation ? conversation.messageCount : 0;
        
        const confirmed = confirm(
            `Are you sure you want to delete this conversation with ${messageCount} messages? This action cannot be undone.`
        );
        
        if (confirmed) {
            this.deleteConversation(sessionId);
        }
    }
    
    showClearAllConfirmation() {
        if (this.conversations.length === 0) {
            this.showError('No conversations to clear.');
            return;
        }
        
        const confirmed = confirm(
            `Are you sure you want to delete all ${this.conversations.length} conversations? This action cannot be undone.`
        );
        
        if (confirmed) {
            this.clearAllConversations();
        }
    }
    
    async deleteConversation(sessionId) {
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/conversation/${sessionId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Remove from local array
            this.conversations = this.conversations.filter(conv => conv.sessionId !== sessionId);
            
            // If this was the currently viewed conversation, close details
            if (this.currentConversation && this.currentConversation.sessionId === sessionId) {
                this.closeConversationDetails();
            }
            
            // Re-render the conversations list
            this.renderConversations();
            this.updateStats();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error deleting conversation:', error);
            this.hideLoading();
            this.showError('Failed to delete conversation. Please try again.');
        }
    }
    
    async analyzeLead() {
        if (!this.currentConversation) {
            this.showError('No conversation selected for analysis.');
            return;
        }
        
        const analyzeBtn = document.getElementById('analyzeLeadBtn');
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/analyze-lead/${this.currentConversation.sessionId}`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update current conversation with analysis
            this.currentConversation.leadAnalysis = data.leadAnalysis;
            
            // Update the conversation in the list
            const conversationIndex = this.conversations.findIndex(conv => conv.sessionId === this.currentConversation.sessionId);
            if (conversationIndex !== -1) {
                this.conversations[conversationIndex].leadAnalyzed = true;
                this.conversations[conversationIndex].leadQuality = data.leadAnalysis.leadQuality;
            }
            
            // Display the analysis
            this.displayLeadAnalysis(data.leadAnalysis);
            
            // Re-render conversations list to show updated status
            this.renderConversations();
            this.updateStats();
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error analyzing lead:', error);
            this.hideLoading();
            this.showError('Failed to analyze lead. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Lead';
        }
    }
    
    displayLeadAnalysis(analysis) {
        const leadAnalysis = document.getElementById('leadAnalysis');
        const leadQualityBadge = document.getElementById('leadQualityBadge');
        const analysisContent = document.getElementById('analysisContent');
        
        // Set lead quality badge
        leadQualityBadge.textContent = analysis.leadQuality.toUpperCase();
        leadQualityBadge.className = `lead-quality-badge ${analysis.leadQuality}`;
        
        // Create analysis content
        analysisContent.innerHTML = `
            <div class="analysis-field">
                <h5>Customer Name</h5>
                <p>${analysis.customerName || '<span class="empty-value">Not provided</span>'}</p>
            </div>
            <div class="analysis-field">
                <h5>Email Address</h5>
                <p>${analysis.customerEmail || '<span class="empty-value">Not provided</span>'}</p>
            </div>
            <div class="analysis-field">
                <h5>Phone Number</h5>
                <p>${analysis.customerPhone || '<span class="empty-value">Not provided</span>'}</p>
            </div>
            <div class="analysis-field">
                <h5>Industry</h5>
                <p>${analysis.customerIndustry || '<span class="empty-value">Not specified</span>'}</p>
            </div>
            <div class="analysis-field">
                <h5>Problems & Needs</h5>
                <p>${analysis.customerProblem || '<span class="empty-value">Not specified</span>'}</p>
            </div>
            <div class="analysis-field">
                <h5>Availability</h5>
                <p>${analysis.customerAvailability || '<span class="empty-value">Not specified</span>'}</p>
            </div>
            <div class="analysis-field consultation">
                <h5>Consultation Status</h5>
                <div class="consultation-badge ${analysis.customerConsultation ? 'booked' : 'not-booked'}">
                    ${analysis.customerConsultation ? 'Booked' : 'Not Booked'}
                </div>
            </div>
            ${analysis.specialNotes ? `
            <div class="analysis-field" style="grid-column: 1 / -1;">
                <h5>Special Notes</h5>
                <p>${analysis.specialNotes}</p>
            </div>
            ` : ''}
        `;
        
        leadAnalysis.style.display = 'block';
    }
    
    async clearAllConversations() {
        this.showLoading();
        
        try {
            // Delete all conversations one by one
            const deletePromises = this.conversations.map(conversation => 
                fetch(`${this.apiBaseUrl}/conversation/${conversation.sessionId}`, {
                    method: 'DELETE'
                })
            );
            
            await Promise.all(deletePromises);
            
            // Reload the conversations list
            await this.loadConversations();
            
            // Close any open conversation details
            this.closeConversationDetails();
            
        } catch (error) {
            console.error('Error clearing conversations:', error);
            this.hideLoading();
            this.showError('Failed to clear conversations. Please try again.');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ConversationDashboard();
});
