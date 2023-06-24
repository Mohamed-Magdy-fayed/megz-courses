import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface TabsProps {
  tabs: string[];
  indicatorColor?: "primary" | "secondary";
  textColor?: "primary" | "secondary";
  setValue: (value: number) => void;
}

export const BasicTabs = ({
  tabs,
  indicatorColor,
  textColor,
  setValue,
}: TabsProps) => {
  const [innerValue, setInnerValue] = React.useState(0);

  const handleInnerChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setInnerValue(newValue);
      setValue(newValue);
    },
    []
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box>
        <Tabs
          value={innerValue}
          onChange={handleInnerChange}
          aria-label="basic tabs"
          indicatorColor={indicatorColor}
          textColor={textColor}
          className="pl-4"
        >
          {tabs.map((tab, i) => (
            <Tab
              key={tab}
              className="min-w-fit p-2 text-sm normal-case"
              label={tab}
              {...a11yProps(i)}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export function useBasicTabs() {
  const [value, setValue] = React.useState(0);

  return {
    value,
    setValue,
    BasicTabs,
  };
}
