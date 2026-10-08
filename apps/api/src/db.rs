use std::error::Error;

use diesel_async::{
    AsyncMigrationHarness, AsyncPgConnection,
    pooled_connection::{AsyncDieselConnectionManager, bb8},
};
use diesel_migrations::{EmbeddedMigrations, MigrationHarness, embed_migrations};

pub type Pool = bb8::Pool<AsyncPgConnection>;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub async fn connect(database_url: &str) -> Result<Pool, Box<dyn Error + Send + Sync>> {
    let manager = AsyncDieselConnectionManager::<AsyncPgConnection>::new(database_url);
    let pool = bb8::Pool::builder().build(manager).await?;
    let conn = pool.get_owned().await.map_err(|err| {
        format!("cannot connect to Postgres ({err}); is it running? try `pnpm infra:up`")
    })?;
    AsyncMigrationHarness::new(conn).run_pending_migrations(MIGRATIONS)?;
    Ok(pool)
}
