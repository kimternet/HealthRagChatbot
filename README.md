# HealthRagChatbot

건강 관련 정보를 제공하는 RAG(Retrieval-Augmented Generation) 기반 AI 챗봇입니다. 신뢰할 수 있는 건강 정보 웹사이트들의 데이터를 기반으로 사용자의 질문에 답변합니다.

### [Web]

![Image](https://github.com/user-attachments/assets/54f46246-d2dc-4ac1-ba5d-1d4693fc19d8)

### [mobile]

![Image](https://github.com/user-attachments/assets/db20e292-cfdd-441b-bea8-b3a5059f4c73)

### [DataStax Astra Vector Database]
![Image](https://github.com/user-attachments/assets/209b8ae8-1ca1-4cb2-abcf-faf9afb09cad)

## 🛠 사용된 기술

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Vercel AI SDK

- **Backend**
  - OpenAI GPT-4 API
  - DataStax Astra DB (Vector Database)
  - LangChain

- **Data Collection**
  - Puppeteer
  - LangChain Document Loaders

## 🔍 주요 기능

1. **RAG 기반 응답 생성**
   - Vector Database를 활용한 관련 문서 검색
   - GPT-4와 검색된 문서를 결합한 정확한 응답 생성

2. **실시간 스트리밍 응답**
   - Vercel AI SDK를 활용한 실시간 응답 스트리밍
   - 자연스러운 대화 경험 제공

3. **건강 정보 데이터베이스**
   - 신뢰할 수 있는 건강 관련 웹사이트 크롤링
   - Vector Embedding을 통한 효율적인 검색

## ⚠️ 문제점과 해결방법

1. **타입 호환성 문제**
   ```typescript
   // 문제: Vercel AI SDK와 OpenAI 응답 타입 불일치
        // vercel AI 와 OpenAI의 응답 타임이 SDK가 다르기 때문에 이렇게 처리해야함
        // 하지만 실제 런타임에서는 두 타입 모두 같은 구조의 스트림 데이터를 다루기 때문에 정상 작동한다.
        // "타입 시스템의 제한"으로 인한 것이며, 실제 기능상의 문제는 아니다.
        // 즉, TS가 타입을 엄격하게 체크하는 과정에서 발생하는 것이며, 실제 데이터의 구조와 흐름은 정상
        // @ts-ignore - OpenAI 응답과 Vercel AI SDK 타입 호환성 문제 해결
   const stream = OpenAIStream(response)
   ```

2. **웹 스크래핑 안정성**
   - 문제: 동적 로딩 콘텐츠 수집 어려움
   - 해결: Puppeteer를 사용하여 JavaScript 렌더링 후 콘텐츠 수집 


## 🚀 실행 방법

1. **환경 설정**
   ```bash
   # 저장소 클론
   git clone https://github.com/kimternet/HealthRagChatbot.git
   cd HealthRagChatbot

   # 의존성 설치 (package.json에 명시된 버전으로 설치)
   npm install
   # 또는
   npm i

   # .env 파일 설정
   cp .env.example .env
   # .env 파일에 필요한 API 키 입력
   ```

2. **데이터베이스 초기화**
   ```bash
   # 건강 정보 수집 및 Vector DB 초기화
   npm run seed
   ```


3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **배포**
   ```bash
   npm run build
   npm start
   ```

## 🔑 필요한 환경 변수

```env
OPENAI_API_KEY=your_openai_api_key
ASTRA_DB_APPLICATION_TOKEN=your_astra_token
ASTRA_DB_API_ENDPOINT=your_astra_endpoint
ASTRA_DB_NAMESPACE=your_namespace
ASTRA_DB_COLLECTION=your_collection
```
## 🛜
https://platform.openai.com/
https://astra.datastax.com/
https://sdk.vercel.ai/docs
