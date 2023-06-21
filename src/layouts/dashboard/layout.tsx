import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import AppDrawer from "@/components/AppDrawer";

export const Layout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);

  const handlePathnameChange = useCallback(() => {
    if (openNav) {
      setOpenNav(false);
    }
  }, [openNav]);

  useEffect(
    () => {
      handlePathnameChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );

  return (
    <AppDrawer>
      {children}
    </AppDrawer>
  );
};
