'use client'
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {increment, decrement, incrementByAmount, reset} from "@/redux/features/counterSlice";
import Link from "next/link";

export default function Home() {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();
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
        </>
    );
};
