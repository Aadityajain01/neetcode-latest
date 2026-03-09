import { CommunityProvider } from "@/components/communities/CommunityContext";
import { CommunityLayout } from "@/components/communities/CommunityLayout";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CommunityProvider communityId={id}>
      <CommunityLayout>
        {children}
      </CommunityLayout>
    </CommunityProvider>
  );
}

