import { Routes, Route, Navigate } from 'react-router'
import { Toaster } from 'sonner'
import { useApp } from '@/context/app'
import Shell from '@/components/shell/Shell'
import Portfolio from '@/pages/Portfolio'
import Accounts from '@/pages/Accounts'
import AccountDetail from '@/pages/AccountDetail'
import Alerts from '@/pages/Alerts'
import Reports from '@/pages/Reports'
import Integrations from '@/pages/Integrations'
import Settings from '@/pages/Settings'

export default function App() {
  const { theme } = useApp()
  return (
    <>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Portfolio />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-pop)',
          },
        }}
      />
    </>
  )
}
