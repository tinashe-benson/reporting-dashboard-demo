import { Routes, Route, Navigate } from 'react-router'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import { useApp } from '@/context/app'
import Landing from '@/pages/Landing'
import Shell from '@/components/shell/Shell'
import Login from '@/pages/Login'
import Portfolio from '@/pages/Portfolio'
import Accounts from '@/pages/Accounts'
import AccountDetail from '@/pages/AccountDetail'
import RecommendationsPage from '@/pages/RecommendationsPage'
import Alerts from '@/pages/Alerts'
import Reports from '@/pages/Reports'
import Integrations from '@/pages/Integrations'
import Settings from '@/pages/Settings'

export default function App() {
  const { theme, seatId } = useApp()
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/" element={<Landing />} />
        {seatId ? (
          <Route path="/app" element={<Shell />}>
            <Route index element={<Portfolio />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="accounts/:id" element={<AccountDetail />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        ) : (
          <Route path="/app/*" element={<Login />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          style: {
            background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)',
            borderRadius: '10px', boxShadow: 'var(--shadow-pop)',
          },
        }}
      />
    </MotionConfig>
  )
}
