require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE']
}));
app.use(express.json());

// Data strg
let todos = [];
let idCounter = 1;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Get all todos
app.get('/todos', (req, res) => {
  try {
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add new todo
app.post('/todos', (req, res) => {
  try {
    if (!req.body.text) {
      return res.status(400).json({ error: 'Todo text is required' });
    }

    const newTodo = {
      id: idCounter++,
      text: req.body.text,
      completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Delete todo
app.delete('/todos/:id', (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== todoId);

    if (todos.length === initialLength) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Summarize and send to Slack
app.post('/summarize', async (req, res) => {
  try {
    console.log('Starting summarize process...'); // Debug log

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY || !process.env.SLACK_WEBHOOK_URL) {
      console.error('Missing required environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const pendingTodos = todos.filter(todo => !todo.completed);
    if (pendingTodos.length === 0) {
      return res.status(400).json({ error: 'No pending todos to summarize' });
    }

    console.log('Creating prompt for OpenAI...'); // Debug log
    const prompt = `Summarize these pending tasks in a concise, motivational way:\n${
      pendingTodos.map(todo => `- ${todo.text}`).join('\n')
    }`;

    console.log('Calling OpenAI API...'); // Debug log
    const llmResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    if (!llmResponse.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const summary = llmResponse.data.choices[0].message.content;
    console.log('Generated summary:', summary); // Debug log

    console.log('Sending to Slack...'); // Debug log
    const slackResponse = await axios.post(
      process.env.SLACK_WEBHOOK_URL,
      {
        text: `*Todo Summary*\n${summary}`
      },
      {
        timeout: 5000 // 5 seconds timeout
      }
    );

    console.log('Slack response status:', slackResponse.status); // Debug log
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    let errorMessage = 'Failed to generate and send summary';
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Invalid API key - check your OpenAI credentials';
      } else if (error.response.status === 429) {
        errorMessage = 'API rate limit exceeded';
      } else {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'API request timed out';
    }

    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables:', {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '*** set ***' : 'MISSING',
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL ? '*** set ***' : 'MISSING'
  });
});