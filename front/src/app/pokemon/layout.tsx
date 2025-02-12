import {Props} from "@/redux/StoreProvider";
import {cookies} from 'next/headers'
import {forbidden} from "next/navigation";


export default async function Layout({children}: Props) {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token');
    if(!authToken){
        forbidden();
    }
    return (
        <>
            <h3>This is Layout of pokemon page</h3>
            {children}
        </>
    )
}