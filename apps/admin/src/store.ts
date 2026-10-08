import { useDispatch, useSelector } from "react-redux"
import { all } from "redux-saga/effects"
import { createAppStore } from "@workspace/store"

function* rootSaga() {
  yield all([])
}

export const store = createAppStore({ rootSaga })

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
