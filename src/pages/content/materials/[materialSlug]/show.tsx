import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import MaterialShowcase from "@/components/contentComponents/materials/MaterialShowcase";

const MaterialShowcasePage = () => {
  const router = useRouter();
  const id = router.query.materialId as string;
  const { data, isLoading, isError } = api.materials.getById.useQuery({ id });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <AppLayout>
        <Spinner />
      </AppLayout>
    );

  if (isLoading || !data?.materialItem)
    return (
      <AppLayout>
        <Spinner></Spinner>
      </AppLayout>
    );

  if (isError) return <AppLayout>Error!</AppLayout>;

  return (
    <AppLayout>
      {/* <MaterialShowcase materialItem={data.materialItem} /> */}
      Comming Soon
    </AppLayout>
  );
};

export default MaterialShowcasePage;
