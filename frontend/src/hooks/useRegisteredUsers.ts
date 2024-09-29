import axios from 'axios';
import { useEffect, useState } from 'react'

interface Users {
    id: number,
    email: string,
    password: string,
    name: string
}


export default function useRegisteredUsers() {
    const [registeredUsers, setRegisteredUsers] = useState<Users[]>([]);
    const [loading, setLoading] = useState(false);
    const getAllUsers = async () => {
        setLoading(true);
        const response = await axios.get(' https://backend.izharmohammed21.workers.dev/api/v1/user/allUsers');
        setRegisteredUsers(response.data);
        setLoading(false);
    }
    useEffect(() => { getAllUsers() }, []);

    return {
        loading, registeredUsers
    }
}

