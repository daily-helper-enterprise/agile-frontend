import { PerformancePageClient } from "@/components/performance-page-client"

export default async function PerformancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PerformancePageClient boardId={id} />
}
