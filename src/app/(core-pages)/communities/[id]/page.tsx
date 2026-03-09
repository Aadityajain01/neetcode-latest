import { redirect } from "next/navigation";

export default async function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/communities/${id}/chat`);
}