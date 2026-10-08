mod config;
mod db;
mod error;
mod routes;

use tokio::net::TcpListener;
use tower_http::{
    cors::{AllowOrigin, Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::EnvFilter;
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

use config::Config;

#[derive(OpenApi)]
#[openapi(info(title = "Apply Pilot API"))]
struct ApiDoc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "api=debug,tower_http=info".into()),
        )
        .init();

    let config = Config::from_env();
    let pool = db::connect(&config.database_url).await?;

    let (router, openapi) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .nest("/api/v1", routes::router())
        .with_state(pool)
        .split_for_parts();

    let app = router
        .merge(SwaggerUi::new("/docs").url("/openapi.json", openapi))
        .layer(
            CorsLayer::new()
                .allow_origin(AllowOrigin::list(config.cors_origins))
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .layer(TraceLayer::new_for_http());

    let listener = TcpListener::bind(("0.0.0.0", config.port)).await?;
    tracing::info!("listening on {}, docs at /docs", listener.local_addr()?);
    axum::serve(listener, app).await?;
    Ok(())
}
