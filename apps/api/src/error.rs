use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use diesel_async::pooled_connection::bb8::RunError;
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error(transparent)]
    Database(#[from] diesel::result::Error),
    #[error(transparent)]
    Pool(#[from] RunError),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!(error = %self);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "internal_error" })),
        )
            .into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
