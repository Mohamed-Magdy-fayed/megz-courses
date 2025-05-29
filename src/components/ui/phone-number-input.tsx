import * as React from "react";
import PhoneInput, { parsePhoneNumber, type Country } from "react-phone-number-input";
import 'react-phone-number-input/style.css'
import { cn } from "@/lib/utils";
import { InputProps } from "@/components/ui/input";

const countryOptions = [
  { code: "EG", label: "Egypt", flagUrl: "/flags/eg.png" },
  { code: "MA", label: "Morocco", flagUrl: "/flags/ma.png" },
  { code: "TN", label: "Tunisia", flagUrl: "/flags/tn.png" },
  { code: "DZ", label: "Algeria", flagUrl: "/flags/dz.png" },
  { code: "LY", label: "Libya", flagUrl: "/flags/ly.png" },
  { code: "JO", label: "Jordan", flagUrl: "/flags/jo.png" },
  { code: "LB", label: "Lebanon", flagUrl: "/flags/lb.png" },
  { code: "SY", label: "Syria", flagUrl: "/flags/sy.png" },
  { code: "IQ", label: "Iraq", flagUrl: "/flags/iq.png" },
  { code: "SA", label: "Saudi Arabia", flagUrl: "/flags/sa.png" },
  { code: "AE", label: "United Arab Emirates", flagUrl: "/flags/ae.png" },
  { code: "KW", label: "Kuwait", flagUrl: "/flags/kw.png" },
  { code: "OM", label: "Oman", flagUrl: "/flags/om.png" },
  { code: "QA", label: "Qatar", flagUrl: "/flags/qa.png" },
  { code: "BH", label: "Bahrain", flagUrl: "/flags/bh.png" },
  { code: "YE", label: "Yemen", flagUrl: "/flags/ye.png" },
];

export interface MobileNumberInputProps {
  value: string;
  placeholder: string;
  inputProps?: InputProps;
  setValue: (val: string) => void;
  onError?: (isError: boolean) => void;
}

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
  value,
  placeholder,
  inputProps,
  setValue,
  onError,
}) => {
  const countryCodes = React.useMemo(() => countryOptions.map(op => op.code as Country), [])
  return (
    <PhoneInput
      addInternationalOption={false}
      focusInputOnCountrySelection={true}
      limitMaxLength={true}
      containerComponentProps={{
        className: cn("flex h-10 w-full placeholder:!text-muted/60 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", inputProps?.className)
      }}
      countryOptionsOrder={countryCodes}
      placeholder={placeholder}
      autoComplete="off"
      value={!!value ? `+${value}` : value}
      numberInputProps={{
        ...inputProps,
        value: value,
        className: cn(
          "w-full placeholder:!text-muted/60 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        )
      }}
      onChange={(val) => {
        setValue(!val ? "" : val.toString().startsWith("+") ? val.slice(1) : val);

        if (val && onError) {
          const isInvalid = !parsePhoneNumber(val)?.isValid();
          onError(isInvalid);
        }
      }} />
  );
};

export default MobileNumberInput;
