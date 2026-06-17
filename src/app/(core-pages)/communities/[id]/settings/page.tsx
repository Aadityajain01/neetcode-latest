import { redirect } from "next/navigation";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/communities?id=${id}&tab=settings`);
}
