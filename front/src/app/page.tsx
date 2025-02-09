'use client'
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {increment, decrement, incrementByAmount, reset} from "@/redux/features/counterSlice";
import Link from "next/link";
import {useGetPokemonByNameQuery} from '@/redux/services/pokemon'
import {useGetPostQuery} from "@/redux/services/post";

export default function Home() {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();
    const {data: pokemonData, error: pokemonError, isLoading: isPokemonLoading} = useGetPokemonByNameQuery('bulbasaur');
    const {data: postData, error: postError, isLoading: isPostLoading, isFetching} = useGetPostQuery(1, {
        // pollingInterval: 3000, // Làm mới dữ liệu sau mỗi 3 giây
        refetchOnMountOrArgChange: true,
        skip: false,
    });
    console.log(postData)
    return (
        <>
            <p>Home Count {count}</p>
            <br/>
            <button onClick={() => dispatch(increment())}>increment</button>
            <br/>
            <button onClick={() => dispatch(decrement())}>decrement</button>
            <br/>
            <button onClick={() => dispatch(incrementByAmount(2))}>incrementByAmount</button>
            <br/>
            <button onClick={() => dispatch(reset())}>reset</button>
            <br/>
            <Link href={'/test'}>to test</Link>
            <br/>
            <p>POKEMON API</p>
            {pokemonError ? (
                <>Oh no, there was an error</>
            ) : isPokemonLoading ? (
                <>Loading</>
            ) : pokemonData ? (
                <>
                    <h3>{pokemonData.species.name}</h3>
                    <img src={pokemonData.species.front_shiny} alt={pokemonData.species.name}/>
                </>
            ) : null}
            <br/>
            <p>POST API</p>
            {postError ? (
                <>Oh no, there was an error</>
            ) : isPostLoading ? (
                <>Loading</>
            ) : postData ? (
                <>
                    <h3>{postData.title}</h3>
                    <h3>{postData.content}</h3>
                </>
            ) : null}
        </>
    );
};
