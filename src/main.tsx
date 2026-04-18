import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { PrivacyPolicyPage } from './pages/PrivacyPolicy.tsx'
import { TermsOfServicePage } from './pages/TermsOfService.tsx'
import { JioReportPage } from './pages/reports/Jio.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/report/jio" element={<JioReportPage />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
