import { Router, type IRouter } from "express";
import {
  GetTrendingMoviesQueryParams,
  GetTrendingAllQueryParams,
  GetTrendingTvQueryParams,
  GetAnimeQueryParams,
  SearchTmdbQueryParams,
  GetTmdbVideosQueryParams,
  DiscoverTmdbQueryParams,
  GetTmdbGenresQueryParams,
  GetTmdbDetailsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not configured");
  }
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

router.get("/tmdb/trending/movie", async (req, res): Promise<void> => {
  const parsed = GetTrendingMoviesQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const data = await tmdbFetch("/trending/movie/week", { page: String(page) });
  res.json(data);
});

router.get("/tmdb/trending/all", async (req, res): Promise<void> => {
  const parsed = GetTrendingAllQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const data = await tmdbFetch("/trending/all/week", { page: String(page) });
  res.json(data);
});

router.get("/tmdb/trending/tv", async (req, res): Promise<void> => {
  const parsed = GetTrendingTvQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const data = await tmdbFetch("/trending/tv/week", { page: String(page) });
  res.json(data);
});

router.get("/tmdb/anime", async (req, res): Promise<void> => {
  const parsed = GetAnimeQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const data = await tmdbFetch("/discover/tv", {
    page: String(page),
    with_genres: "16",
    with_original_language: "ja",
    sort_by: "popularity.desc",
  });
  res.json(data);
});

router.get("/tmdb/search", async (req, res): Promise<void> => {
  const parsed = SearchTmdbQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "query parameter is required" });
    return;
  }
  const { query, page } = parsed.data;
  const data = await tmdbFetch("/search/multi", {
    query,
    page: String(page ?? 1),
  });
  res.json(data);
});

router.get("/tmdb/videos", async (req, res): Promise<void> => {
  const parsed = GetTmdbVideosQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "id and type parameters are required" });
    return;
  }
  const { id, type } = parsed.data;
  const data = await tmdbFetch(`/${type}/${id}/videos`);
  res.json(data);
});

router.get("/tmdb/discover", async (req, res): Promise<void> => {
  const parsed = DiscoverTmdbQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "type parameter is required" });
    return;
  }
  const { type, genre, page } = parsed.data;
  const params: Record<string, string> = {
    page: String(page ?? 1),
    sort_by: "popularity.desc",
  };
  if (genre) {
    params.with_genres = String(genre);
  }
  const data = await tmdbFetch(`/discover/${type}`, params);
  res.json(data);
});

router.get("/tmdb/genres", async (req, res): Promise<void> => {
  const parsed = GetTmdbGenresQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "type parameter is required" });
    return;
  }
  const { type } = parsed.data;
  const data = await tmdbFetch(`/genre/${type}/list`);
  res.json(data);
});

router.get("/tmdb/details", async (req, res): Promise<void> => {
  const parsed = GetTmdbDetailsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "id and type parameters are required" });
    return;
  }
  const { id, type } = parsed.data;
  const data = await tmdbFetch(`/${type}/${id}`);
  res.json(data);
});

export default router;
