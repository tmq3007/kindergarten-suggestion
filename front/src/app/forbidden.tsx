import {Indie_Flower} from "next/font/google";
import Image from "next/image";
import access_denied from '@public/access_denied.png'

const indieFlower = Indie_Flower({
    subsets: ['latin'],
    weight: '400',
});

export default function Error401() {
    return (
        <div className={`${indieFlower.className} flex flex-col items-center justify-center h-screen`}>
            <Image src={access_denied} alt={'access-denied-image'}></Image>
            <h1 className="text-center text-3xl">403 | ACCESS DENIED</h1>
        </div>
    );
}
