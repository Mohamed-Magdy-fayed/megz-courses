import ProductItemsClient from '@/components/admin/systemManagement/products/productItems/ProductItemClient';
import ProductItemForm from '@/components/admin/systemManagement/products/productItems/ProductItemForm';
import AppLayout from '@/components/pages/adminLayout/AppLayout';
import { Button } from '@/components/ui/button';
import GoBackButton from '@/components/ui/go-back';
import Modal from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import { api } from '@/lib/api';
import { PlusIcon } from 'lucide-react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useState } from 'react';

export default function index({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { data } = api.products.getById.useQuery({ id })
    const [isAddProductItemOpen, setIsAddProductItemOpen] = useState(false)

    return (
        <AppLayout>
            <div className='space-y-4'>
                <div className='flex items-center justify-between gap-4'>
                    <div className='space-y-4'>
                        <GoBackButton />
                        {!data?.product?.name ? <Skeleton className='h-16' /> : <ConceptTitle>{data.product.name}</ConceptTitle>}
                        <Typography>Manage what is available in this product</Typography>
                    </div>
                    <Modal
                        title='Add a product item'
                        description='These course and level will be available to any student who purchases this product.'
                        isOpen={isAddProductItemOpen}
                        onClose={() => setIsAddProductItemOpen(false)}
                        children={(
                            <ProductItemForm setIsOpen={setIsAddProductItemOpen} productId={id} />
                        )}
                    />
                    <Button type='button' onClick={() => setIsAddProductItemOpen(true)}>
                        <Typography>Add Product Item</Typography>
                        <PlusIcon size={20} />
                    </Button>
                </div>
                <ProductItemsClient productId={id} />
            </div>
        </AppLayout>
    );
}

export const getServerSideProps: GetServerSideProps<{ id: string }> = async (ctx) => {
    if (typeof ctx.query.productId !== "string") return { notFound: true }

    return {
        props: {
            id: ctx.query.productId
        }
    }
}

