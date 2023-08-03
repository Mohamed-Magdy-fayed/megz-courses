import AppLayout from "@/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="w-full">
          {contentTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="courses">
          <Courses />
        </TabsContent>
        <TabsContent value="levels">Change your password here.</TabsContent>
        <TabsContent value="lessons">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="materials">Change your password here.</TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default ContentPage;
