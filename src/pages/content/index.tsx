import AppLayout from "@/layouts/AppLayout";
import Courses from "./components/Courses";

const ContentPage = () => {
  const contentTabs = [
    {
      label: "Courses",
      value: "courses",
    },
    {
      label: "Levels",
      value: "levels",
    },
    {
      label: "Lessons",
      value: "lessons",
    },
    {
      label: "Materials",
      value: "materials",
    },
  ];

  return (
    <AppLayout>
      <Courses />
    </AppLayout>
  );
};

export default ContentPage;
