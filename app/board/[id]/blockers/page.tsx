import { BlockersPageClient } from "@/components/blockers-page-client"

export default async function BlockersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BlockersPageClient boardId={id} />
}
