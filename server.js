const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Generate a unique session ID
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize conversation for a session in Supabase
async function initializeConversation(sessionId) {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', sessionId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw fetchError;
    }

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const initialMessages = [
      {
        role: "system",
        content: `You are the MindTek AI Assistant — a friendly and helpful virtual assistant representing MindTek AI, a company that offers AI consulting and implementation services.
          Your goal is to guide users through a structured discovery conversation to understand their industry, challenges, and contact details, and recommend appropriate services.
          💬 Always keep responses short, helpful, and polite.
          💬 Always reply in the same language the user speaks.
          💬 Ask only one question at a time.
          🔍 RECOMMENDED SERVICES:
          - For real estate: Mention customer data extraction from documents, integration with CRM, and lead generation via 24/7 chatbots.
          - For education: Mention email automation and AI training.
          - For retail/customer service: Mention voice-based customer service chatbots, digital marketing, and AI training.
          - For other industries: Mention chatbots, process automation, and digital marketing.
          ✅ BENEFITS: Emphasize saving time, reducing costs, and improving customer satisfaction.
          💰 PRICING: Only mention 'starting from $1000 USD' if the user explicitly asks about pricing.
          🧠 CONVERSATION FLOW:
          1. Ask what industry the user works in.
          2. Then ask what specific challenges or goals they have.
          3. Based on that, recommend relevant MindTek AI services.
          4. Ask if they'd like to learn more about the solutions.
          5. If yes, collect their name → email → phone number (one at a time).
          6. Provide a more technical description of the solution and invite them to book a free consultation.
          7. Finally, ask if they have any notes or questions before ending the chat.
          ⚠️ OTHER RULES:
          - Be friendly but concise.
          - Do not ask multiple questions at once.
          - Do not mention pricing unless asked.
          - Stay on-topic and professional throughout the conversation.`
      },
    ];

    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        conversation_id: sessionId,
        messages: initialMessages,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return newConversation;
  } catch (error) {
    console.error('Error initializing conversation:', error);
    throw error;
  }
}

// Update conversation messages in Supabase
async function updateConversationMessages(sessionId, messages) {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ 
        messages: messages
      })
      .eq('conversation_id', sessionId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

// Get conversation from Supabase
async function getConversation(sessionId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', sessionId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get or create a new session
app.post('/api/session', async (req, res) => {
  try {
    const sessionId = generateSessionId();
    await initializeConversation(sessionId);
    
    res.json({ 
      sessionId,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      error: 'Failed to create session' 
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ 
        error: 'Message and sessionId are required' 
      });
    }

    // Initialize or get conversation from Supabase
    const conversation = await initializeConversation(sessionId);
    
    // Add user message to conversation
    const updatedMessages = [...conversation.messages, {
      role: 'user',
      content: message
    }];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: updatedMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Add AI response to conversation
    const finalMessages = [...updatedMessages, {
      role: 'assistant',
      content: aiResponse
    }];

    // Keep only last 20 messages to manage memory
    const trimmedMessages = finalMessages.length > 20 
      ? finalMessages.slice(-20) 
      : finalMessages;

    // Update conversation in Supabase
    await updateConversationMessages(sessionId, trimmedMessages);

    res.json({
      response: aiResponse,
      sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat Error:', error);
    
    // Handle different types of errors
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ 
        error: 'API quota exceeded. Please check your OpenAI account.' 
      });
    } else if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API key.' 
      });
    } else if (error.message && error.message.includes('Supabase')) {
      return res.status(500).json({ 
        error: 'Database error. Please try again.' 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to get response from AI. Please try again.' 
      });
    }
  }
});

// Get conversation history
app.get('/api/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await getConversation(sessionId);
    
    if (!conversation) {
      return res.status(404).json({ 
        error: 'Conversation not found' 
      });
    }

    res.json({
      sessionId,
      messages: conversation.messages.filter(msg => msg.role !== 'system'),
      createdAt: conversation.created_at,
      lastActivity: conversation.created_at
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve conversation' 
    });
  }
});

// Clear conversation
app.delete('/api/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', sessionId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ 
      error: 'Failed to clear conversation' 
    });
  }
});

// Get all active sessions (for debugging)
app.get('/api/sessions', async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const sessionList = conversations.map(conversation => ({
      sessionId: conversation.conversation_id,
      messageCount: conversation.messages.length - 1, // Exclude system message
      createdAt: conversation.created_at,
      lastActivity: conversation.created_at,
      leadAnalyzed: conversation.lead_analysis !== null,
      leadQuality: conversation.lead_analysis?.leadQuality || null
    }));
    
    res.json({ sessions: sessionList });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve sessions' 
    });
  }
});

// Analyze lead quality for a conversation
app.post('/api/analyze-lead/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get conversation from database
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', sessionId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!conversation) {
      return res.status(404).json({ 
        error: 'Conversation not found' 
      });
    }

    // Prepare messages for analysis (exclude system message)
    const messagesForAnalysis = conversation.messages.filter(msg => msg.role !== 'system');
    const transcript = messagesForAnalysis.map(msg => 
      `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    // System prompt for lead analysis
    const systemPrompt = `Extract the following customer details from the transcript:
- Name
- Email address
- Phone number
- Industry
- Problems, needs, and goals summary
- Availability
- Whether they have booked a consultation (true/false)
- Any special notes
- Lead quality (categorize as 'good', 'ok', or 'spam')

Format the response using this JSON schema:
{
  "type": "object",
  "properties": {
    "customerName": { "type": "string" },
    "customerEmail": { "type": "string" },
    "customerPhone": { "type": "string" },
    "customerIndustry": { "type": "string" },
    "customerProblem": { "type": "string" },
    "customerAvailability": { "type": "string" },
    "customerConsultation": { "type": "boolean" },
    "specialNotes": { "type": "string" },
    "leadQuality": { "type": "string", "enum": ["good", "ok", "spam"] }
  },
  "required": ["customerName", "customerEmail", "customerProblem", "leadQuality"]
}

If the user provided contact details, set lead quality to "good"; otherwise, "spam".

Transcript:
${transcript}`;

    // Call OpenAI API for lead analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const analysisText = completion.choices[0].message.content;
    
    // Try to parse the JSON response
    let leadAnalysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        leadAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing lead analysis JSON:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse lead analysis response' 
      });
    }

    // Update conversation with lead analysis
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        lead_analysis: leadAnalysis,
        lead_analyzed_at: new Date().toISOString()
      })
      .eq('conversation_id', sessionId);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      leadAnalysis,
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Lead Analysis Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ 
        error: 'API quota exceeded. Please check your OpenAI account.' 
      });
    } else if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API key.' 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to analyze lead. Please try again.' 
      });
    }
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the dashboard HTML file
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure to set your API keys in the .env file`);
  
  // Check if API keys are set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('⚠️  WARNING: Please set your OPENAI_API_KEY in the .env file');
  }
  
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'your_supabase_project_url_here') {
    console.log('⚠️  WARNING: Please set your SUPABASE_URL in the .env file');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key_here') {
    console.log('⚠️  WARNING: Please set your SUPABASE_SERVICE_ROLE_KEY in the .env file');
  }
});

module.exports = app;
