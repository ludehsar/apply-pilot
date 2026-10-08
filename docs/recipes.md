# Recipes

## Add a table + CRUD endpoint (example: `users`)

1. Migration:
   ```bash
   cd apps/api
   diesel migration generate create_users
   ```
   Write `up.sql` / `down.sql`, then run `diesel migration run`. That creates or updates `src/schema.rs`; add `mod schema;` to `main.rs` if it isn't there yet.

2. `src/routes/users.rs`, containing the model, queries and handlers for this resource:
   ```rust
   use axum::{Json, extract::State};
   use diesel::prelude::*;
   use diesel_async::RunQueryDsl;
   use serde::{Deserialize, Serialize};
   use utoipa::ToSchema;

   use crate::{db::Pool, error::AppResult, schema::users};

   #[derive(Serialize, ToSchema, Queryable, Selectable)]
   #[diesel(table_name = users)]
   #[serde(rename_all = "camelCase")]
   pub struct User {
       id: i32,
       name: String,
   }

   #[derive(Deserialize, ToSchema, Insertable)]
   #[diesel(table_name = users)]
   pub struct NewUser {
       name: String,
   }

   #[utoipa::path(get, path = "/users", tag = "users", responses((status = 200, body = [User])))]
   pub async fn list_users(State(pool): State<Pool>) -> AppResult<Json<Vec<User>>> {
       let mut conn = pool.get().await?;
       Ok(Json(users::table.select(User::as_select()).load(&mut conn).await?))
   }

   #[utoipa::path(post, path = "/users", tag = "users", request_body = NewUser, responses((status = 200, body = User)))]
   pub async fn create_user(State(pool): State<Pool>, Json(input): Json<NewUser>) -> AppResult<Json<User>> {
       let mut conn = pool.get().await?;
       let user = diesel::insert_into(users::table)
           .values(input)
           .returning(User::as_returning())
           .get_result(&mut conn)
           .await?;
       Ok(Json(user))
   }
   ```

3. Register it in `src/routes/mod.rs`:
   ```rust
   mod users;
   OpenApiRouter::new()
       .routes(routes!(health::health))
       .routes(routes!(users::list_users, users::create_user))
   ```

4. Check that it appears at http://localhost:8080/docs as `/api/v1/users`, and try it there.

5. When a resource outgrows one file, turn it into a folder (`routes/users/{mod,model,handlers}.rs`).

## Add Redux state to a React app

1. Create `src/features/<name>/{slice,saga,selectors}.ts` (see [state-management.md](./state-management.md)).
2. In `src/store.ts`: `reducer: { <name>: <name>Reducer }` and `yield all([fork(<name>Saga)])`.

## Add a shadcn component

```bash
pnpm dlx shadcn@latest add <component> -c apps/web
```
It lands in `packages/ui/src/components/`; import it from `@workspace/ui/components/<component>` in any app.
