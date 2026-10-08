# State Management — Redux Toolkit + Redux Saga

Used by `apps/admin` and `apps/extension`.

## Store

`packages/store` exports `createAppStore({ rootSaga, reducer? })`, which:
- creates an RTK store with thunks **disabled**, so sagas are the only side-effect mechanism;
- attaches the saga middleware and runs `rootSaga`;
- defaults to an empty reducer, so an app with no slices yet doesn't trigger Redux's "no valid reducer" warning.

Each app's `src/store.ts`:

```ts
function* rootSaga() {
  yield all([])
}

export const store = createAppStore({ rootSaga })
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

Adding the first slice:

```ts
function* rootSaga() {
  yield all([fork(usersSaga)])
}

export const store = createAppStore({ rootSaga, reducer: { users: usersReducer } })
```

## Feature shape

```
src/features/<feature>/
  slice.ts       createSlice (+ createEntityAdapter for lists)
  saga.ts        workers + one exported watcher
  selectors.ts   select* functions (createSelector for derived data)
```
Move a feature into `packages/store/src/<feature>/` (and add it to that package's `exports`) only when both apps need it.

## Rules

1. Reducers are pure. Sagas do all I/O.
2. Action names follow request → outcome: `fetchRequested` → `fetchSucceeded` / `fetchFailed`.
3. Use `takeLatest` for reads (cancels stale requests) and `takeEvery` for writes.
4. Every worker catches its own errors and dispatches a failure action. An uncaught error kills the watcher, and the feature silently stops working.
5. Call functions through `yield call(fn, ...args)`, never `fn()` directly, so effects stay testable.
6. Generator yields can't be inferred, so annotate them: `const users: User[] = yield call(api.listUsers)`.
7. Components read through selectors only.

## Worker template

```ts
function* fetchUsers(): SagaIterator {
  try {
    const users: User[] = yield call(listUsers)
    yield put(usersActions.fetchSucceeded(users))
  } catch (error) {
    yield put(usersActions.fetchFailed(error instanceof Error ? error.message : "Unexpected error"))
  }
}

export function* usersSaga(): SagaIterator {
  yield takeLatest(usersActions.fetchRequested.type, fetchUsers)
}
```
