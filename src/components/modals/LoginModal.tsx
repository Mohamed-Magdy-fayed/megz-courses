import React, { Dispatch, FC, SetStateAction, useState } from 'react'
import Modal from '../ui/modal'
import { Button } from '../ui/button'
import AuthForm from '../authComponents/AuthForm'

interface LoginModalProps {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

const LoginModal: FC<LoginModalProps> = ({
    open,
    setOpen,
}) => {
    const [variant, setVariant] = useState<"login" | "register">("register");

    return (
        <Modal
            title="Login"
            description="Please login or create an account to continue"
            isOpen={open}
            onClose={() => setOpen(false)}
        >
            <AuthForm authType={variant} setOpen={setOpen} />
            {variant === "login"
                ? <Button
                    type='button'
                    variant={"link"}
                    onClick={() => setVariant("register")}
                >
                    Create a new account
                </Button>
                : <Button
                    type='button'
                    variant={"link"}
                    onClick={() => setVariant("login")}
                >
                    I have an account
                </Button>
            }
        </Modal>
    )
}

export default LoginModal