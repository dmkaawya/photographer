import { AdminLoginForm } from '@/components/admin/login-form'

export const metadata = {
  title: 'Admin Login | Sadeepa Photography',
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.5em] text-gold uppercase">Admin</span>
          <h1 className="font-[var(--font-playfair)] text-4xl font-bold text-foreground mt-3">
            Sign In
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-gold" />
        </div>
        <AdminLoginForm />
      </div>
    </main>
  )
}
