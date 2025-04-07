import "./global.css"
import { ReactNode } from "react"

export const metadata = {
    title: "Health RAG Chatbot",
    description: "건강을 지킵시다!"
}

const RootLayout = ({ children }: { children: ReactNode }) => {
    return (
        <html lang="ko">
            <body>
                {children}
            </body>
        </html>
    )
}

export default RootLayout