# AI Website Chatbot

A modern AI chatbot with OpenAI integration, built with Node.js backend and vanilla JavaScript frontend.

## Features

- 🤖 **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses
- 💬 **Real-time Chat**: Smooth conversation flow with typing indicators
- 🎨 **Modern UI**: Beautiful, responsive design with gradient backgrounds
- 📝 **Session Management**: Persistent conversations with unique session IDs
- 🗄️ **Supabase Database**: Conversations stored in PostgreSQL database
- 📊 **Conversation Dashboard**: View and manage all chat conversations
- 🎯 **Lead Analysis**: AI-powered customer information extraction and lead quality assessment
- 🔄 **Memory Management**: Automatic conversation history management
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- OpenAI API key
- Supabase account and project

### Installation

1. **Clone or download the project files**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your API keys:**
   - Open the `.env` file
   - Replace the placeholder values with your actual keys:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
   ```

4. **Set up your Supabase database:**
   - Create a table named `conversations` with the following columns:
     - `id` (bigint, primary key, auto-increment)
     - `created_at` (timestamp with time zone, default: now())
     - `conversation_id` (text, unique)
     - `messages` (jsonb)
     - `lead_analysis` (jsonb, nullable)
     - `lead_analyzed_at` (timestamp with time zone, nullable)

5. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Navigate to `http://localhost:3000` for the main chat
   - Navigate to `http://localhost:3000/dashboard` for the conversation dashboard
   - Start chatting with the AI!

## API Endpoints

- `POST /api/session` - Create a new chat session
- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:sessionId` - Get conversation history
- `DELETE /api/conversation/:sessionId` - Clear conversation
- `POST /api/analyze-lead/:sessionId` - Analyze lead quality for a conversation
- `GET /api/sessions` - List all active sessions
- `GET /api/health` - Health check

## Project Structure

```
website-chatbot/
├── server.js          # Node.js backend server
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (API keys)
├── index.html        # Main chat HTML
├── script.js         # Main chat JavaScript
├── styles.css        # Main chat CSS
├── dashboard.html    # Conversation dashboard HTML
├── dashboard.js      # Dashboard JavaScript
├── dashboard.css     # Dashboard CSS
├── supabase_setup.sql # Database setup script
└── README.md         # This file
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `SUPABASE_URL`: Your Supabase project URL (required)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (required)
- `PORT`: Server port (default: 3000)

### OpenAI Model Settings

The chatbot uses GPT-3.5-turbo with the following settings:
- Max tokens: 500
- Temperature: 0.7
- Conversation memory: Last 20 messages

### Database Schema

The conversations are stored in a Supabase PostgreSQL table with the following structure:
- `id`: Auto-incrementing primary key
- `created_at`: Timestamp when conversation was created
- `conversation_id`: Unique identifier for each chat session
- `messages`: JSONB array containing the conversation history
- `lead_analysis`: JSONB object containing extracted customer information and lead quality
- `lead_analyzed_at`: Timestamp when lead analysis was performed

## Dashboard Features

The conversation dashboard (`/dashboard`) provides:

- **📊 Statistics**: View total conversations, messages, and today's activity
- **🔍 Search**: Search through conversations by session ID, date, or message count
- **💬 Message Viewing**: Click any conversation to view all messages with timestamps
- **🎯 Lead Analysis**: AI-powered extraction of customer information and lead quality assessment
- **🗑️ Management**: Clear individual conversations or all conversations at once
- **🔄 Real-time Updates**: Refresh to see the latest conversations
- **📱 Responsive Design**: Works on desktop and mobile devices

## Lead Analysis Features

The lead analysis system uses OpenAI to extract customer information from conversations:

- **📋 Customer Details**: Name, email, phone number, industry
- **🎯 Problem Assessment**: Customer needs, goals, and pain points
- **📅 Availability**: Customer availability and scheduling preferences
- **✅ Consultation Status**: Whether a consultation has been booked
- **⭐ Lead Quality**: Categorizes leads as 'good', 'ok', or 'spam'
- **📝 Special Notes**: Additional insights and observations
- **💾 Persistent Storage**: Analysis results stored in database
- **🔄 Re-analysis**: Can re-analyze conversations with updated data

## Troubleshooting

### Common Issues

1. **"Invalid API key" error:**
   - Make sure your OpenAI API key is correctly set in the `.env` file
   - Ensure you have sufficient credits in your OpenAI account

2. **"Database error" or Supabase connection issues:**
   - Verify your Supabase URL and service role key are correct
   - Check that the `conversations` table exists in your Supabase database
   - Ensure your Supabase project is active and accessible

3. **"Failed to get response" error:**
   - Check your internet connection
   - Verify the server is running on port 3000
   - Check the browser console for detailed error messages

4. **CORS errors:**
   - Make sure you're accessing the app through `http://localhost:3000`
   - Don't open the HTML file directly in the browser

### Getting Help

- Check the browser console for error messages
- Verify the server logs in the terminal
- Ensure all dependencies are installed correctly

## License

MIT License - feel free to use this project for your own purposes!