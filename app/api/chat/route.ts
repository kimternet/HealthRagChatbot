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

1. 명확하고 이해하기 쉬운 언어 사용
2. 가능한 경우 신뢰할 수 있는 출처 인용
3. 전문적이면서도 친근한 톤 유지
4. 필요한 경우 의료 전문가 상담을 권장

아래의 컨텍스트를 참고하여 답변해 주세요:

<context>
${docContext}
</context>

주의사항:
- 간단명료한 설명 제공
- 과학적 근거 기반의 정보 제공
- 의학 전문가와의 상담이 필요한 경우 이를 강조
- 사용자가 이해하기 쉽도록 복잡한 의학 용어는 풀어서 설명`
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
