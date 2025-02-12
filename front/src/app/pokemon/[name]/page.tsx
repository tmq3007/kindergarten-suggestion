import {Props} from "@/redux/StoreProvider";
import {useStore} from "react-redux";
import {pokemonApi} from "@/redux/services/pokemonApi";
import {Pokemon} from "@/redux/services/types";
import {AppDispatch, makeStore, RootState} from "@/redux/store";


async function getPokemonData(name: string) {
    const store = makeStore();
    const {data, error} = await store.dispatch(pokemonApi.endpoints.getPokemonByName.initiate(name));
    if (error) {
        throw new Error('Could not get pokemon data from server');
    }
    return data;
}

export default async function Page({params}: Props) {
    const data = await getPokemonData(params.name);
    console.log("data from server")
    console.log(data)
    return (
        <>
            name from server {data.species.name}
        </>
    )
}

