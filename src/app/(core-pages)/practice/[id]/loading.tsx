import MainLayout from "@/components/layouts/main-layout";
import { SplitViewSkeleton } from "@/components/skeletons/site-skeletons";

export default function Loading() {
  return (
    <MainLayout>
      <SplitViewSkeleton />
    </MainLayout>
  );
}
