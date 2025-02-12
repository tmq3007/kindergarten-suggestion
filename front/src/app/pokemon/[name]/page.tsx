import {pokemonApi} from "@/redux/services/pokemonApi";
import {makeStore} from "@/redux/store";
import Link from "next/link";


async function getPokemonData(name: string) {
    const store = makeStore();
    const {data, error} = await store.dispatch(pokemonApi.endpoints.getPokemonByName.initiate(name));
    if (error) {
        throw new Error('Could not get pokemon data from server');
    }
    return data;
}

interface PageProps {
    name: string,
}

export default async function Page({params}: { params: Promise<PageProps> }) {
    const {name} = await params;
    const data = await getPokemonData(name);
    console.log("data from server")
    console.log(data)
    return (
        <>
            name from server {data?.species.name}
            <br/>
            <Link href={'/'}>Back to Home</Link>
        </>
    )
}

