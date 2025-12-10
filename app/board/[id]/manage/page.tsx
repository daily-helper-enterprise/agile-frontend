import { ManagePageClient } from "@/components/manage-page-client"

export default async function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: boardId } = await params

  return <ManagePageClient boardId={boardId} />
}
