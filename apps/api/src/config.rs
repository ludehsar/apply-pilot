use std::env;

use axum::http::HeaderValue;

pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub cors_origins: Vec<HeaderValue>,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            port: env::var("API_PORT")
                .ok()
                .and_then(|port| port.parse().ok())
                .unwrap_or(8080),
            cors_origins: env::var("CORS_ORIGINS")
                .unwrap_or_default()
                .split(',')
                .filter_map(|origin| origin.trim().parse().ok())
                .collect(),
        }
    }
}
