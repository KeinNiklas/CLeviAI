
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

// Mock the LanguageContext
jest.mock('../lib/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            hero: {
                badge: "Test Badge",
                title_start: "Test Title",
                title_gradient: "Gradient",
                subtitle: "Test Subtitle",
                cta_start: "Start",
            },
            navbar: {
                profile_dashboard: "Dashboard",
            },
            features: {
                upload_title: "Upload",
                upload_desc: "Desc",
                ai_title: "AI",
                ai_desc: "Desc",
                course_title: "Course",
                course_desc: "Desc",
            }
        }
    }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('Page', () => {
    it('renders a main heading', () => {
        render(<Page />)

        // Just checking if *some* heading exists as a basic smoke test
        const heading = screen.getByRole('heading', { level: 1 })

        expect(heading).toBeInTheDocument()
    })
})
