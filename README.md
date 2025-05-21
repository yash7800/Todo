# Todo Summary Assistant

A full-stack application that allows users to manage todos, generate AI summaries of pending tasks, and send them to Slack.

## Features

- Add, view, and delete todo items
- Generate meaningful summaries of pending todos using OpenAI's LLM
- Send the generated summary to a Slack channel
- Simple and intuitive UI

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- OpenAI API key
- Slack incoming webhook URL

### Backend Setup

1. Navigate to the `backend` folder
2. Create a `.env` file based on `.env.example` and fill in your credentials
3. Install dependencies:
   ```bash
   npm install
4. Start the server:
   ```bash
   npm start

#### Frontend Setup
 
1. Navigate to the `Frontend` folder
2. Create a `.env` file based on `.env.example` and fill in your credentials
3. Install dependencies:
   ```bash
   npm install
4. Start the server:
   ```bash
   npm start

The application should now be running with:

*Backend on http://localhost:5000

Frontend on http://localhost:3000*

##### Slack Integration Setup

Go to your Slack workspace

Create a new incoming webhook:

Navigate to https://api.slack.com/apps

Create a new app or select an existing one

Go to "Incoming Webhooks" and activate it

Add a new webhook to your desired channel

Copy the webhook URL and add it to your backend .env file

###### OpenAI Integration Setup

Sign up for an OpenAI account at https://openai.com/

Get your API key from https://platform.openai.com/account/api-keys

Add the API key to your backend .env file

###### Running the Application
Start the backend server (runs on port 5000 by default)

Start the frontend development server (runs on port 3000 by default)

Open http://localhost:3000 in your browser

# Architecture Decisions
Backend: Node.js with Express for simplicity and quick setup

Frontend: React for its component-based architecture and state management

LLM Integration: OpenAI's GPT-3.5-turbo for its balance of cost and capability

State Management: Local state in React components (no Redux for simplicity)

Database: In-memory array 