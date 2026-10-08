mod health;

use utoipa_axum::{router::OpenApiRouter, routes};

use crate::db::Pool;

pub fn router() -> OpenApiRouter<Pool> {
    OpenApiRouter::new().routes(routes!(health::health))
}
