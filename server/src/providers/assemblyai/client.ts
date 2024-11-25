import { AssemblyAI } from 'assemblyai'

export const AssemblyAIClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || ''
})