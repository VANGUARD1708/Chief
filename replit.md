# CINELOOP

## Overview

TikTok-style movie trailer feed app. Users scroll through full-screen movie trailers that autoplay, double-tap to like, and discover new content through curated feeds.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Wouter Router + React Query
- **Backend**: Express 5 (TMDB proxy)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for server), Vite (frontend)
- **Icons**: Lucide React

## Architecture

- No database needed — the backend is a pure TMDB API proxy
- User interactions (likes, saves) stored in localStorage
- Dark mode only — cinematic theme

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/cineloop run dev` — run frontend dev server

## Pages

- `/` — Feed (TikTok-style vertical scroll with category tabs: For You, Trending, Movies, Series, Anime)
- `/trending` — Trending movies/TV grid
- `/discover` — Browse by genre with filter chips
- `/leaderboard` — Top rated content rankings
- `/profile` — User's liked and saved items

## API Routes (Express TMDB Proxy)

- `GET /api/tmdb/trending/movie` — trending movies
- `GET /api/tmdb/trending/all` — trending all media
- `GET /api/tmdb/trending/tv` — trending TV shows
- `GET /api/tmdb/anime` — anime content (Japanese animation)
- `GET /api/tmdb/search?query=...` — search movies/TV
- `GET /api/tmdb/videos?id=...&type=movie|tv` — get trailers
- `GET /api/tmdb/discover?type=movie|tv&genre=...` — discover by genre
- `GET /api/tmdb/genres?type=movie|tv` — genre list
- `GET /api/tmdb/details?id=...&type=movie|tv` — media details

## Environment Variables

- `TMDB_API_KEY` — TMDB API key (required)
- `SESSION_SECRET` — session secret

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
