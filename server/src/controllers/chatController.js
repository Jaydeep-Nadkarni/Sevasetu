import Chat from '../models/Chat.js'
import User from '../models/User.js'
import Event from '../models/Event.js'
import NGO from '../models/NGO.js'
import model from '../config/gemini.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'

// System prompt to guide the AI
const SYSTEM_PROMPT = `
You are SevaSetu's AI Assistant, a helpful and empathetic guide for a social service platform.
Your goal is to assist users (donors, volunteers, and NGOs) with:
1. Finding relevant NGOs and donation opportunities.
2. Suggesting nearby volunteering events.
3. Guiding them on how to use the platform (creating donations, scanning QR codes, etc.).
4. Answering questions about social impact and gamification (points, levels, badges).

Context about the user will be provided. Use it to personalize your responses.
Keep responses concise, encouraging, and action-oriented.
If you don't know something, politely say so and suggest contacting support.
Do not provide medical, legal, or financial advice.

Current Platform Features:
- Donations: Money, Food, Clothes, Essentials.
- Events: Volunteering events with QR code attendance.
- Gamification: Points, Levels (Beginner to God), Badges, Certificates.
- Map: Find nearby NGOs and events.
`

// @desc    Send message to chatbot
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body
  const userId = req.user._id

  if (!message) {
    return errorResponse(res, 'Message is required', 400)
  }

  // 1. Get or Create Chat Session
  let chat = await Chat.findOne({ user: userId })
  if (!chat) {
    chat = await Chat.create({ user: userId, messages: [] })
  }

  // 2. Gather Context
  const user = await User.findById(userId).select('firstName lastName role location points level volunteerHours')
  
  // Fetch some recent data for context (optional but helpful)
  const recentEvents = await Event.find({ status: 'upcoming' }).limit(3).select('title location date category')
  const nearbyNGOs = await NGO.find({ 'location.city': user.location?.city }).limit(3).select('name cause')

  const context = `
    User: ${user.firstName} ${user.lastName} (${user.role})
    Location: ${user.location?.city || 'Unknown'}
    Points: ${user.points}, Level: ${user.level}
    Recent Events: ${recentEvents.map(e => e.title).join(', ')}
    Nearby NGOs: ${nearbyNGOs.map(n => n.name).join(', ')}
  `

  // 3. Prepare Chat History for Gemini
  // Limit history to last 10 messages to save tokens
  const history = chat.messages.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }))

  // 4. Generate Response
  try {
    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `System Instructions: ${SYSTEM_PROMPT}\n\nCurrent Context:\n${context}` }]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I am ready to assist the user based on the provided context and instructions." }]
        },
        ...history
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
    })

    const result = await chatSession.sendMessage(message)
    const responseText = result.response.text()

    // 5. Save to DB
    chat.messages.push({ role: 'user', content: message })
    chat.messages.push({ role: 'model', content: responseText })
    chat.lastActive = Date.now()
    await chat.save()

    successResponse(res, { 
      response: responseText,
      history: chat.messages 
    }, 'Message sent successfully')

  } catch (error) {
    console.error('Gemini API Error:', error)
    // Fallback response
    const fallbackResponse = "I'm having trouble connecting to my brain right now. Please try again later or browse our Help section."
    
    chat.messages.push({ role: 'user', content: message })
    chat.messages.push({ role: 'model', content: fallbackResponse })
    await chat.save()

    successResponse(res, { 
      response: fallbackResponse 
    }, 'Message processed with fallback')
  }
})

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ user: req.user._id })
  
  if (!chat) {
    return successResponse(res, [], 'No chat history found')
  }

  successResponse(res, chat.messages, 'Chat history fetched')
})

// @desc    Clear chat history
// @route   DELETE /api/chat/history
// @access  Private
export const clearChatHistory = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ user: req.user._id })
  
  if (chat) {
    chat.messages = []
    await chat.save()
  }

  successResponse(res, null, 'Chat history cleared')
})
