import { Box } from "@mui/material";
import React, { useEffect } from "react";
import CustomInput from "../students/CustomInput";
import PasswordField from "../students/PasswordField";
import { ValuesTypes } from "@/pages/students";

export const useFormsContainer = (
  inputs: ValuesTypes,
  dispatchReset: boolean
) => {
  const [values, setValues] = React.useState<ValuesTypes>(inputs);

  function FormsContainer({ inputs }: { inputs: ValuesTypes }) {
    const [loading, setLoading] = React.useState(false);
    const [innerValues, setInnerValues] = React.useState<ValuesTypes>(inputs);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prevState) => {
          const newValues = {
            ...prevState,
            [event.target.name]: event.target.value,
          };
          return newValues;
        });
        setInnerValues((prevState) => {
          const newValues = {
            ...prevState,
            [event.target.name]: event.target.value,
          };
          return newValues;
        });
      },
      [values]
    );

    useEffect(() => {
      setInnerValues(inputs);
      setValues(inputs);
    }, [dispatchReset]);

    return (
      <form autoComplete="off">
        <Box component="div" className="grid grid-cols-12 gap-4 p-4">
          {Object.keys(inputs).map((input) => {
            if (input !== "password")
              return (
                <CustomInput
                  key={input}
                  loading={loading}
                  handleChange={handleChange}
                  value={innerValues[input as keyof typeof innerValues]}
                  fullWidth
                  label={input.slice(0, 1).toUpperCase() + input.slice(1)}
                  name={input}
                />
              );
            return (
              <PasswordField
                key={input}
                password={innerValues[input] || ""}
                handleChange={handleChange}
                loading={loading}
              />
            );
          })}
        </Box>
      </form>
    );
  }

  return {
    output: FormsContainer({ inputs }),
    values,
    setValues,
  };
};
