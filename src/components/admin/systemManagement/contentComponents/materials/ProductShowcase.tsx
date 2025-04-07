import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Prisma } from "@prisma/client";

type ProductShowcaseProps = {
    product: Prisma.ProductGetPayload<{ include: { productItems: { include: { course: true, level: true } } } }>;
}

const ProductShowcase = ({ product }: ProductShowcaseProps) => {
    return (
        <div className="space-y-8 p-4 w-full">
            <div className="space-y-2">
                <ConceptTitle>Describtion</ConceptTitle>
                <Typography>{product.description}</Typography>
            </div>
            {product.productItems.map(productItem => (
                <div key={productItem.id} >
                    <Card key={productItem.id} className="grid gap-2 rounded-xl mt-2 p-2">
                        <CardHeader>
                            <CardTitle>{productItem.course.name}</CardTitle>
                            <CardDescription>{productItem.course.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="grid">
                            <Typography>{productItem.level?.name ?? "One level"}</Typography>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    )
}

export default ProductShowcase
