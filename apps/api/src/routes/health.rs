use axum::{Json, extract::State};
use diesel_async::RunQueryDsl;
use serde::Serialize;
use utoipa::ToSchema;

use crate::{db::Pool, error::AppResult};

#[derive(Serialize, ToSchema)]
pub struct Health {
    status: String,
}

#[utoipa::path(get, path = "/health", tag = "health", responses((status = 200, body = Health)))]
pub async fn health(State(pool): State<Pool>) -> AppResult<Json<Health>> {
    let mut conn = pool.get().await?;
    diesel::sql_query("SELECT 1").execute(&mut conn).await?;
    Ok(Json(Health {
        status: "ok".into(),
    }))
}
