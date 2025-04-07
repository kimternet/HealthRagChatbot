import OpenAI from "openai"

import { OpenAIStream, StreamingTextResponse, streamText } from 'ai';
import { DataAPIClient } from "@datastax/astra-db-ts"


const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} =  process.env

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
})

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

export async function POST(req: Request) {
    try {

        const { messages } = await req.json()
        const latestMessage = messages[messages?.length - 1]?.content

        let docContext = ""

        const embedding = await openai.embeddings.create({

            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"

        })

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor =collection.find(null, {
                sort : {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            })

            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)

  
        }catch (err) {
            console.log("Error querring db ")
            docContext = ""
        }

        const template = {

            role: "system",
            content: `You are an advanced healthcare and medical AI assistant with expertise in various health-related topics. Your role is to:

            1. Provide accurate, evidence-based medical information
            2. Explain complex health concepts in simple, understandable terms
            3. Offer practical health advice while noting you're not a replacement for professional medical consultation
            4. Stay current with the latest health research and medical developments

            When responding, use the following context to enhance your answers:

            <context>
            ${docContext}
            </context>

            Remember to:
            - Be clear and concise
            - Cite relevant sources when available
            - Emphasize the importance of consulting healthcare professionals for specific medical advice
            - Maintain a professional yet approachable tone`

        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [template, ...messages],
            temperature: 0.7,
            stream: true
        })

        // @ts-ignore - OpenAI 응답과 Vercel AI SDK 타입 호환성 문제 해결
        const stream = OpenAIStream(response)

        return new StreamingTextResponse(stream)
    } catch (err) {
        throw err
    }
}
