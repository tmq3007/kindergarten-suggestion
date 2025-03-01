import Image from "next/image";
import access_denied from '@public/access_denied.png'
import {indie} from "@/lib/fonts";


export default function Error401() {
    return (
        <div className={`${indie.className} flex flex-col items-center justify-center h-screen`}>
            <Image src={access_denied} alt={'access-denied-image'}></Image>
            <h1 className="text-center text-3xl">403 | ACCESS DENIED</h1>
        </div>
    );
}
