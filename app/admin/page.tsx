import { isAdminEnabled } from '@/lib/admin-auth'
import AdminWindow from '@/components/windows/AdminWindow'
import { notFound } from 'next/navigation'

export default function AdminPage() {
  if (!isAdminEnabled()) {
    notFound()
  }

  return <AdminWindow />
}
