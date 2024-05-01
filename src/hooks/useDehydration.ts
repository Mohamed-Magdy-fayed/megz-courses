import { useEffect, useState } from "react";

const useDehydration = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted
}

export default useDehydration