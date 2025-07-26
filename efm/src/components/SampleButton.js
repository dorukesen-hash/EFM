"use client";

import {useAuth} from "@/utils/context/AuthContext";


export default function SampleButton() {
    const { user } = useAuth();

    const handleShowContext = () => {
        console.log('Kullanıcı Bilgisi:', user);
        alert(user ? JSON.stringify(user, null, 2) : 'Kullanıcı yok.');

};
    return (
        <button onClick={handleShowContext}>show context</button>
    )
}
