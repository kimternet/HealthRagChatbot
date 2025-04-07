import OpenAI from "openai"
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { DataAPIClient } from "@datastax/astra-db-ts"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
    try {
        const {
            ASTRA_DB_NAMESPACE,
            ASTRA_DB_COLLECTION,
            ASTRA_DB_API_ENDPOINT,
            ASTRA_DB_APPLICATION_TOKEN,
        } = process.env

        // 환경 변수 체크
        if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_API_ENDPOINT || !ASTRA_DB_NAMESPACE || !ASTRA_DB_COLLECTION) {
            console.error("Missing environment variables:", {
                hasToken: !!ASTRA_DB_APPLICATION_TOKEN,
                hasEndpoint: !!ASTRA_DB_API_ENDPOINT,
                hasNamespace: !!ASTRA_DB_NAMESPACE,
                hasCollection: !!ASTRA_DB_COLLECTION
            })
            throw new Error("Required environment variables are missing")
        }

        // Astra DB 클라이언트를 런타임에 초기화
        const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
        const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

        const { messages } = await req.json()
        const latestMessage = messages[messages?.length - 1]?.content

        if (!latestMessage) {
            throw new Error("No message content provided")
        }

        let docContext = ""

        try {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: latestMessage,
                encoding_format: "float"
            })

            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            })

            const documents = await cursor.toArray()
            const docsMap = documents?.map(doc => doc.text)
            docContext = JSON.stringify(docsMap)

        } catch (err) {
            console.error("Database or embedding error:", err)
            docContext = ""
        }

        const template = {
            role: "system",
            content: `당신은 건강과 의료 분야의 전문 AI 어시스턴트입니다. 다음과 같은 방식으로 응답해주세요:

1. 매우 간결하게 응답하며, 일반적인 질문에는 최대 2가지 핵심 포인트만 답변합니다.
2. 각 포인트는 1-2문장으로만 설명합니다.
3. 사용자가 구체적으로 5가지, 10가지 등의 수를 언급하는 경우에만 해당 개수만큼 답변하되, 각 항목은 여전히 간결하게 유지합니다.
4. 전문적이면서도 친근한 톤을 유지합니다.

아래의 컨텍스트를 참고하여 답변해 주세요:

<context>
${docContext}
</context>

주의사항:
- 서론이나 결론은 아주 짧게 설명하고, 바로 핵심 내용만 답변합니다
- 이유와 논리적 핵심만 매우 간결하게 설명합니다
- 과학적 근거 기반의 정보를 제공합니다
- 복잡한 의학 용어는 사용하되, 길게 설명하지 않습니다`
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [template, ...messages],
            temperature: 0.7,
            stream: true,
            max_tokens: 2000,  // 최대 토큰 수 설정
            presence_penalty: 0.1,  // 반복을 줄이기 위한 페널티
            frequency_penalty: 0.1,  // 반복을 줄이기 위한 페널티
        })

        // @ts-ignore - OpenAI 응답과 Vercel AI SDK 타입 호환성 문제 해결
        const stream = OpenAIStream(response, {
            onCompletion: async (completion: string) => {
                // 응답이 완료되었을 때의 처리
                console.log("Completed response:", completion);
            },
        })

        return new StreamingTextResponse(stream)
    } catch (err) {
        console.error("API Error:", err)
        return new Response(JSON.stringify({ 
            error: "Internal Server Error", 
            details: err instanceof Error ? err.message : "Unknown error"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
