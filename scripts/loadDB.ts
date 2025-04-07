import "dotenv/config";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

// 환경 변수 디버깅
console.log("Environment variables loaded:");
console.log("OPENAI_API_KEY exists:", !!OPENAI_API_KEY);
if (OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY length:", OPENAI_API_KEY.length);
    console.log("OPENAI_API_KEY starts with:", OPENAI_API_KEY.substring(0, 10) + "...");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY});

const healthData = [
    'https://health.chosun.com/',
    'https://www.donga.com/news/Health',
    'http://www.mdtoday.co.kr/',
    'https://www.hira.or.kr/',
    'https://www.reddit.com/r/wearables/',
    'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm',
    'https://pubmed.ncbi.nlm.nih.gov/',
    'https://www.clien.net/service/board/cm_health',
    'https://prod.danawa.com/',
    'https://www.mkhealth.co.kr/',
    'https://www.healthline.com/health/technology',
    'https://www.verywellhealth.com/health-products-4159745',
    'http://www.ehealthnews.net/'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})


const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarityMetric
            }
        })
        console.log("Collection created:", res)
        return true
    } catch (error: any) {
        if (error.message && error.message.includes("already exists")) {
            console.log(`Collection ${ASTRA_DB_COLLECTION} already exists, skipping creation.`)
            return true
        }
        console.error("Failed to create collection:", error)
        return false
    }
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of healthData) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await (const chunk of chunks ){
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            
            const vector = embedding.data[0].embedding

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}

/*
LangChain은 웹 스크래핑에 두 가지 방법을 제공한다.
Cheerio: jQuery와 비슷한 구문으로 HTML을 파싱하지만 JavaScript를 실행하지 않음. 
따라서 가볍고 빠르지만, 정적 콘텐츠만 수집 가능하다.

Puppeteer: 실제 웹 브라우저를 실행하여 JavaScript가 포함된 동적 웹페이지도 스크래핑 가능
예로, 무한 스크롤, SPA(Single Page Application), 사용자 상호작용이 필요한 페이지 등을 처리할 수 있다.

이 프로젝트에서는 PUPPETEER를 사용하는데 이유는 현 웹사이트들은 대부분 JS로 콘텐츠를 동적 로드함.
실제 브라우저를 사용해야 보다 완전한 콘텐츠 수집이 가능하다.

*/

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (pages, browser) => {
            const result = await pages.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }

    })
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

const main = async () => {
    const collectionCreated = await createCollection()
    if (collectionCreated) {
        await loadSampleData()
    }
}

main().catch(console.error)
