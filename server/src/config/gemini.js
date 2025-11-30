import { GoogleGenerativeAI } from '@google/generative-ai'
import config from './config.js'

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

// Use a model that supports chat, like gemini-1.5-flash for speed and cost
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export default model
