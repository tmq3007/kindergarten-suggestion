import {ReactNode} from "react";
import {Props} from "@/redux/StoreProvider";

export default function Layout({children}: Props) {
    return (
        <>
            <h3>This is Layout of pokemon/id  page</h3>
            {children}
        </>
    )
}