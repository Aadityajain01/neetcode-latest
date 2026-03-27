import MainLayout from "@/components/layouts/main-layout";
import { ProblemsPageSkeleton } from "@/components/skeletons/site-skeletons";

export default function Loading() {
  return (
    <MainLayout>
      <ProblemsPageSkeleton />
    </MainLayout>
  );
}
