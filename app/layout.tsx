import type { Metadata } from "next";
import "./global.css"
import { ReactNode } from "react"

export const metadata: Metadata = {
    title: "Health RAG Chatbot",
    description: "AI-powered health information chatbot using RAG",
    icons: {
        icon: "/favicon.ico"
    }
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