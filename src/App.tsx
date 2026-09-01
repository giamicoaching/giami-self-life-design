import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProgramShell } from './components/layout/ProgramShell.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { Step1AreasPage } from './pages/Step1AreasPage.tsx'
import { Step1ResultPage } from './pages/Step1ResultPage.tsx'
import { Step2PriorityPage } from './pages/Step2PriorityPage.tsx'
import { Step3Page } from './pages/Step3Page.tsx'
import { Step4GoalPage } from './pages/Step4GoalPage.tsx'
import { Step5ActionPage } from './pages/Step5ActionPage.tsx'
import { SummaryPage } from './pages/SummaryPage.tsx'
import { ProgramProvider } from './state/ProgramProvider.tsx'
import { SaveToastProvider } from './state/SaveToast.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <ProgramProvider>
        <SaveToastProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route element={<ProgramShell />}>
              <Route path="/step/1/result" element={<Step1ResultPage />} />
              <Route path="/step/1/:screen" element={<Step1AreasPage />} />
              <Route path="/step/2" element={<Step2PriorityPage />} />
              <Route path="/step/3/:sub" element={<Step3Page />} />
              <Route path="/step/4" element={<Step4GoalPage />} />
              <Route path="/step/5" element={<Step5ActionPage />} />
              <Route path="/summary" element={<SummaryPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SaveToastProvider>
      </ProgramProvider>
    </BrowserRouter>
  )
}
