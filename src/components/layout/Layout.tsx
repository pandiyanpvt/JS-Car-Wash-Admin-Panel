import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar - Fixed on all screens */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
        {/* Topbar */}
        <Topbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

