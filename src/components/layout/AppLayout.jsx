import Navbar from './Navbar'

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} EduVault — All resources are for educational use only.</p>
      </footer>
    </div>
  )
}
