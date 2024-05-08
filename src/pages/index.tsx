import LandingLayout from "@/components/landingPageComponents/LandingLayout";
import HeroSection from "@/components/landingPageComponents/HeroSection";
import ContactSection from "@/components/landingPageComponents/ContactSection";
import CoursesSection from "@/components/landingPageComponents/CoursesSection";
import LandingSectionSeparator from "@/components/landingPageComponents/LandingSectionSeparator";
import OurTeamSection from "@/components/landingPageComponents/OurTeamSection";
import { Star } from "lucide-react";

const Page = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <LandingSectionSeparator
        images={`lg:bg-[url('../../public/courses_horiz.png')] bg-[url('../../public/courses_vert.png')]`}
        title="Latest Courses"
        subTitle="Discover what's new!"
        titleIcons={<Star />}
      />
      <CoursesSection />
      <LandingSectionSeparator
        images={`lg:bg-[url('../../public/team_section_large.png')] bg-[url('../../public/team_section_small.png')]`}
        title="Our Team"
        subTitle="Meet the instructors!"
        titleIcons={<Star />}
      />
      <OurTeamSection />
      <LandingSectionSeparator
        images={`lg:bg-[url('../../public/contact_us_large.png')] bg-[url('../../public/contact_us_small.png')]`}
        title="Contact Us"
        subTitle="Need help?"
        titleIcons={<Star />}
      />
      <ContactSection />
    </LandingLayout>
  );
};

export default Page;
