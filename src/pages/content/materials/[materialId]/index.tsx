import Spinner from "@/components/Spinner";
import MaterialsEditForm from "@/components/contentComponents/materials/MaterialsEditForm";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/router";

const EditMaterialPage = () => {
  const router = useRouter();
  const id = router.query.materialId as string;
  const { data } = api.materials.getById.useQuery({ id });

  if (!data?.materialItem) return <Spinner className="mx-auto" />

  return (
    <AppLayout>
      <MaterialsEditForm materialItem={data.materialItem} />
    </AppLayout>
  );
};

export default EditMaterialPage;
