# Database migrations

The national-team database changes are split into three migrations:

1. `010_add_national_team.sql` creates the roster, year, and display-settings tables.
2. `011_seed_national_team_2026.sql` imports the initial 2026 roster once.
3. `012_national_team_photos_and_u15.sql` adds database photo storage and enforces the U15 Europe-only rule.

For a new database, apply all migrations in numeric order:

```powershell
npm run migrate -- 001 002 003 004 005 006 007 008 009 010 011 012
```

For an existing database, apply only migrations that have not already been applied. The national-team migrations can be run together with:

```powershell
npm run migrate -- 010 011 012
```

After applying them, move the legacy team photos into the database:

```powershell
npm run migrate:national-team-photos -- --dry-run
npm run migrate:national-team-photos
```

The dry run verifies every referenced local photo without changing the database or files. The actual command stores the images in `national_team_photos`, updates roster references, and removes successfully migrated source files from `Frontend/assets`. Keep the source assets in the repository until this migration has run in each target environment.

The migration runner executes the requested files in one transaction. It does not keep a migration-version table, so keep track of which migrations have been applied to each database.
