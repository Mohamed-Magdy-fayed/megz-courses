import MaterialsEditForm from "@/components/contentComponents/materials/MaterialsEditForm";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/router";

const EditMaterialPage = () => {
  const router = useRouter();
  const id = router.query.materialId as string;

  return (
    <AppLayout>
      <MaterialsEditForm materialId={id} />
    </AppLayout>
  );
};

export default EditMaterialPage;
