import { IFormInput } from "@/components/admin/systemManagement/systemForms/CustomForm"
import { FormItemComponentPreview } from "@/components/admin/systemManagement/systemForms/PreviewComponents/FormItemComponentPreview"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { FC } from "react"

type SystemFormCardPreviewProps = {
    formData: IFormInput;
}

const SystemFormCardPreview: FC<SystemFormCardPreviewProps> = ({ formData }) => {

    return (
        <Card className="h-fit w-full bg-muted/5">
            <CardHeader>
                <CardTitle>{formData.title}</CardTitle>
                <CardDescription>{formData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {formData.items.map((item, i) => (
                    <FormItemComponentPreview
                        key={`${item.title}${i}`}
                        item={item}
                    />
                ))}
            </CardContent>
        </Card >
    )
}

export default SystemFormCardPreview