import Spinner from "@/components/Spinner";
import MaterialsEditForm from "@/components/contentComponents/materials/MaterialsEditForm";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/router";

const EditMaterialPage = () => {
  const router = useRouter();
  const id = router.query.materialId as string;
  const { data, isLoading, isError } = api.materials.getById.useQuery({ id });

  if (isLoading)
    return (
      <AppLayout>
        <Spinner></Spinner>
      </AppLayout>
    );

  if (isError) return <AppLayout>Error!</AppLayout>;

  return (
    <AppLayout>
      <MaterialsEditForm materialId={id} />
    </AppLayout>
  );
};

export default EditMaterialPage;
