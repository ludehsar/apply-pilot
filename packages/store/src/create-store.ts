import {
  configureStore,
  type Reducer,
  type ReducersMapObject,
} from "@reduxjs/toolkit"
import createSagaMiddleware, { type Saga } from "redux-saga"

interface CreateAppStoreOptions<S> {
  rootSaga: Saga
  reducer?: Reducer<S> | ReducersMapObject<S>
}

export function createAppStore<S = Record<string, never>>({
  rootSaga,
  reducer = (state: S = {} as S) => state,
}: CreateAppStoreOptions<S>) {
  const sagaMiddleware = createSagaMiddleware()
  const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  })
  sagaMiddleware.run(rootSaga)
  return store
}
