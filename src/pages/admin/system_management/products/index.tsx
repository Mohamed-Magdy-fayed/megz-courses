import ProductForm from '@/components/admin/systemManagement/products/ProductForm';
import ProductsClient from '@/components/admin/systemManagement/products/ProductsClient';
import AppLayout from '@/components/pages/adminLayout/AppLayout';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { ConceptTitle, Typography } from '@/components/ui/Typoghraphy';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

export default function ProductsPage() {
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)

    return (
        <AppLayout>
            <div className='space-y-4'>
                <div className='flex items-center justify-between gap-4'>
                    <div className='space-y-4'>
                        <ConceptTitle>Products</ConceptTitle>
                        <Typography>Manage how you sell your courses to your students</Typography>
                    </div>
                    <Modal
                        title='Create a new product'
                        description='a product can have mutible courses and levels sold together under a new price'
                        isOpen={isCreateProductOpen}
                        onClose={() => setIsCreateProductOpen(false)}
                        children={(
                            <ProductForm setIsOpen={setIsCreateProductOpen} />
                        )}
                    />
                    <Button type='button' onClick={() => setIsCreateProductOpen(true)}>
                        <Typography>Add Product</Typography>
                        <PlusIcon size={20} />
                    </Button>
                </div>
                <ProductsClient />
            </div>
        </AppLayout>
    );
}
