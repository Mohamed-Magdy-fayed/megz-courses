import { IFormInput } from "@/components/systemForms/CustomForm";
import { Button } from "@/components/ui/button";
import { FC } from "react";

type OptionsComponentPreviewProps = {
    option: IFormInput["items"][number]["questions"][number]["options"][number]
    index: number
}

export const OptionsComponentPreview: FC<OptionsComponentPreviewProps> = ({ index, option }) => {
    return (
        <div key={`${option.value}${index}`}>
            <Button
                disabled={true}
                variant={"outline"}
                customeColor={"primaryOutlined"}
            >
                {option.value}
            </Button>
        </div >
    )
}