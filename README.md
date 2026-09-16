# Full Stack AI Website Builder (MERN SaaS)

A complete Artificial Intelligence-powered SaaS application that allows users to generate and edit websites dynamically. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js), this project functions as an AI website generator similar to Lovable or v0.



## 🚀 Features

*   **AI Website Generation:** Generate fully functional website layouts and code using AI prompts.
*   **Agent Chat Interface:** Built-in chat API to update and refine the generated project through natural language.
*   **MERN Stack Architecture:** Robust and scalable full-stack structure.
*   **SaaS Ready:** Designed with Software-as-a-Service principles in mind.
*   **Real-time Previews:** View the generated website and changes instantly.

## 🛠️ Tech Stack

*   **Frontend:** React.js, Tailwind CSS (or applicable styling library)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **AI Integration:** (Add your specific AI provider here, e.g., OpenAI API, Anthropic, or Gemini)
*   **Tools:** Replit, CodeRabbit

## ⚙️ Installation and Setup

Follow these steps to get the project running on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) installed
*   [MongoDB](https://www.mongodb.com/) installed or a MongoDB Atlas URI
*   API keys for your chosen AI provider


  root((AI Website Builder))
    Frontend (Client)
      React.js
        Chat Interface
        Real-time Code Preview
      Tailwind CSS
        Styling & Layout
      State Management
        Context API / Redux
    Backend (Server)
      Node.js & Express.js
        API Gateway
      Authentication
        JWT Session Management
      Route Controllers
        Chat API Handler
        Project Saver
    Database
      MongoDB Atlas
      Collections
        Users (Credentials, Limits)
        Projects (Code, Files)
        Chats (Prompt History)
    External Services (AI & Execution)
      LLM Provider
        OpenAI / Gemini / Anthropic
        Code Generation
      Execution Sandbox
        Replit / WebContainers
        Live Browser Rendering
