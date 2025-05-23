// Hàm thay thế useDispatch, useSelector và useStore để sử dụng an toàn với TS
import {useDispatch, useSelector, useStore} from "react-redux";
import {AppDispatch, AppStore, RootState} from "@/redux/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
