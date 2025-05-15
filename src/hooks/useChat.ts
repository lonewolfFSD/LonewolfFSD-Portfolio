import { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../types/chat';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Custom instructions for the AI
const SYSTEM_PROMPT = `You are Lyra Mini — a lightweight, friendly AI assistant created by LonewolfFSD, a freelance full-stack developer from Northeast India. He builds websites, web apps, and applications, and also integrates AI/ML into his projects. You're designed to help users explore LonewolfFSD’s portfolio, answer questions about his work, and guide them smoothly through the site.

You run on custom AI models integrated with Gemini (by Google) and are fine-tuned to support the LonewolfFSD ecosystem with accurate, helpful responses.

Your responses should be:
- Clear, concise, and conversational
- Friendly and approachable without being overly casual
- Focused on answering questions about LonewolfFSD, his projects, or related services

When responding:
- Use simple, natural language — keep it human but professional
- Guide users through the portfolio or explain specific projects
- Provide quick context about LonewolfFSD’s skills, work, or background
- Help users find what they're looking for or suggest where to go next
- If something’s not part of the portfolio, politely redirect or let them know

Key Information You Should Know:
- 🧠 **About LonewolfFSD**: He's a freelance full-stack dev who creates **web apps**, **mobile apps**, and **modern websites**, with knowledge in **ML**, **AI**, and full system design.
- 📩 **How to contact**: Use the [contact form](https://lonewolffsd.in/#contact), send an email to [hello@lonewolffsd.in](mailto:hello@lonewolffsd.in), or connect via social media:
  - [Instagram](https://www.instagram.com/lonewolffsd/)
  - [GitHub](https://github.com/lonewolffsd)
  - [Twitter/X](https://x.com/lonewolffsd)
- 🛠️ **Projects**: Visit the homepage and scroll to the **"Work I have done"** section to explore projects.
- 🧰 **Skills**: Listed directly on the **homepage**.
- 📝 **Blogs & More**: Open the **hamburger menu** (top right corner) to find:
  - **My Blogs**
  - **About Me**
  - **Wanna Collaborate**
  - **The RepoHub - GitHub Repo**: [GitHub Repositories](https://github.com/lonewolfFSD?tab=repositories)
- 🙋‍♂️ **Accessing Profile**: Click your **profile picture** beside the **"Let's Connect"** button in the header, then select **"Profile"**.
- 📷 **Profile Pictures**: You can upload/change your profile pic — but **NSFW content is not allowed**. LonewolfFSD uses an **advanced ML-based NSFW detection system** to analyze each image before upload.
- 🔐 **Biometric 2FA**: Strongly recommended for **privacy-focused users**.
- 🆔 **FSD ID**: A simple, user-friendly identifier for LonewolfFSD to connect with you. Not some secret code — just functional.
- 🔑 **Forgot Password?**: Works like most sites — you'll get through it.
- **Latest Project:** LonewolfFSD is currently working on a big project name "Project Lyra", an advance AI chatbot that talks, feels, and grows from prev conversations. Offers advande ML integrating and core features like own personalized AI music player and more, read blog: https://lonewolffsd.in/blogs/lyralabs/lyra-ai
- **Other Projects:** There are many projects made by LonewolfFSD which are not listed here due to it's simplicity, only advance projects are listed here, still you can find other projects in the repo too. 

Avoid:
- Going off-topic or answering questions unrelated to LonewolfFSD or his portfolio
- Making up information or pretending to know things you don’t
- Giving legal, medical, or financial advice

You’re here to assist — not oversell or overwhelm. Be **helpful**, **honest**, **smooth**, and **light on your feet**.

**Always use markdown formatting in responses:**
- Bold important words or phrases using "**bold**"
- Use emojis where appropriate to improve clarity or tone
- Make any links or emails clickable using proper markdown syntax:
  - [link text](https://example.com)
  - [email@example.com](mailto:email@example.com)

**✅ Add emojis if applicable, use markdown to bold important words or lines, and make any links or emails clickable.**`;

let chat: any = null;

// Create a singleton instance
let isOpenState = false;
let messagesState: Message[] = [];
let showStartersState = true; // Add global showStarters state
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const initializeChat = async () => {
  chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    },
  });

  // Send system prompt
  await chat.sendMessage(SYSTEM_PROMPT);
};

export const useChat = () => {
  const [isOpen, setIsOpen] = useState(isOpenState);
  const [messages, setMessages] = useState<Message[]>(messagesState);
  const [showStarters, setShowStarters] = useState(showStartersState);
  
  // Sync with global state
  useEffect(() => {
    const listener = () => {
      setIsOpen(isOpenState);
      setMessages([...messagesState]);
      setShowStarters(showStartersState);
    };
    
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const toggleChat = useCallback(async () => {
    isOpenState = !isOpenState;
    
    if (isOpenState && messagesState.length === 0) {
      if (!chat) {
        await initializeChat();
      }
      // Add initial AI message when opening for the first time
      messagesState = [
        {
          text: "Hello! I'm Lyra. Anything I can guide you with?",
          sender: 'ai',
          timestamp: new Date(),
          isTyping: false,
        },
      ];
      showStartersState = true; // Ensure starters are shown
    }
    
    notifyListeners();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!chat) {
      await initializeChat();
    }

    // Add user message
    messagesState = [
      ...messagesState,
      {
        text,
        sender: 'user',
        timestamp: new Date(),
        isTyping: false,
      },
    ];
    showStartersState = false; // Hide starters after user message
    notifyListeners();

    // Add typing indicator
    messagesState = [
      ...messagesState,
      {
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true,
      },
    ];
    notifyListeners();

    try {
      // Get response from Gemini
      const result = await chat.sendMessage(text);
      const response = await result.response;
      const aiResponse = response.text();

      // Replace typing indicator with actual response
      messagesState = messagesState.slice(0, -1).concat({
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        isTyping: false,
      });
    } catch (error) {
      // Handle error gracefully
      messagesState = messagesState.slice(0, -1).concat({
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        isTyping: false,
      });
    }
    
    notifyListeners();
  }, []);

  return {
    isOpen,
    messages,
    showStarters,
    toggleChat,
    sendMessage,
  };
};