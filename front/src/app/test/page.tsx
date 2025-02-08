'use client'

import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {decrement, increment, incrementByAmount, reset} from "@/redux/features/counterSlice";
import {useRouter} from "next/navigation";

export default function Page() {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();
    const router = useRouter();
    return (
        <>
            <p>Test Count {count}</p>
            <br/>
            <button onClick={() => dispatch(increment())}>increment</button>
            <br/>
            <button onClick={() => dispatch(decrement())}>decrement</button>
            <br/>
            <button onClick={() => dispatch(incrementByAmount(2))}>incrementByAmount</button>
            <br/>
            <button onClick={() => dispatch(reset())}>reset</button>
            <br/>
            <button onClick={() => router.back()}>back</button>
            <p>test</p>
        </>
    );
};