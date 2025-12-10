"use client"
import TeamPageClient from "@/components/team-page-client"

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <TeamPageClient boardId={id} />
}
