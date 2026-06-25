# Channel Database (Core Boys + Soccer + GTA 6)

This module now stores replay-template runs with channel separation.

## Runtime Store

- Runtime persistence is localStorage (v2 store shape in `types.ts`).
- Channels are seeded:
  - `core-boys`
  - `soccer`
  - `gta6`

## SQLite Contract

Schema file: `schema.sqlite.sql`

Primary channel-aware tables:

- `channels`
- `videos` (`channel_id` foreign key)
- `manual_replay_segments`
- `recommendations`
- `trending_videos` (for monthly trend imports per channel)

## Notes

- v1 data is auto-migrated to v2 on load:
  - existing videos are mapped to `core-boys` by default.
- Channel scoping is enforced in UI via a channel selector.
- Stored video keys are channel-scoped (`{channel}:{videoId}`) to avoid collisions.
