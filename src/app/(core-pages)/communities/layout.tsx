import MainLayout from "@/components/layouts/main-layout";

export default function CommunitiesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex flex-col  h-[calc(100vh-4rem)]">
        {children}
      </div>
    </MainLayout>
  );
}
