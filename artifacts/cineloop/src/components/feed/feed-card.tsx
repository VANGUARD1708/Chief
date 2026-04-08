import { useRef, useState, useEffect, useCallback } from "react";
import {
  TmdbMediaItem,
  useGetTmdbVideos,
  GetTmdbVideosType,
  getGetTmdbVideosQueryKey,
} from "@workspace/api-client-react";
import { Heart, Share2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/use-user-data";

interface FeedCardProps {
  item: TmdbMediaItem;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
}

// Send YouTube IFrame API commands via postMessage (no URL reload needed)
function sendYtCommand(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  try {
    iframe?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    );
  } catch {}
}

// Animated speaker icon bars
function SpeakerBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full origin-bottom bg-current transition-all duration-300",
            active ? "vol-bar opacity-100" : "opacity-40"
          )}
          style={{
            height: active ? `${[8, 14, 10, 6][i - 1]}px` : "4px",
            animationDelay: `${(i - 1) * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Speaker button with ripple rings
function SpeakerButton({
  isMuted,
  onToggle,
  rippleKey,
}: {
  isMuted: boolean;
  onToggle: () => void;
  rippleKey: number;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{ top: "80px", right: "16px" }}
      className={cn(
        "absolute z-30 flex items-center gap-2.5 px-3.5 py-2 rounded-full border backdrop-blur-md",
        "font-semibold text-xs tracking-wider select-none transition-all duration-300",
        isMuted
          ? "bg-black/65 border-white/20 text-white/80 hover:border-white/40"
          : "bg-primary/15 border-primary/80 text-primary shadow-[0_0_16px_rgba(244,62,92,0.45)]"
      )}
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {/* Ripple rings (only when unmuting) */}
      {!isMuted && rippleKey > 0 && (
        <>
          <span
            key={`r1-${rippleKey}`}
            className="speaker-ring absolute inset-0 rounded-full border border-primary/60 pointer-events-none"
          />
          <span
            key={`r2-${rippleKey}`}
            className="speaker-ring-delay absolute inset-0 rounded-full border border-primary/40 pointer-events-none"
          />
        </>
      )}

      {/* Icon */}
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isMuted ? (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.2}>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.2}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </div>

      {/* Speaker bars / label */}
      {isMuted ? (
        <span className="text-[11px]">MUTED</span>
      ) : (
        <SpeakerBars active={!isMuted} />
      )}
    </button>
  );
}

export function FeedCard({ item, isActive, isMuted, onMuteToggle }: FeedCardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  const lastTapRef = useRef(0);
  const { isLiked, isSaved, toggleLike, toggleSave } = useUserData();

  const isMovie = item.media_type !== "tv";
  const mediaType = isMovie ? GetTmdbVideosType.movie : GetTmdbVideosType.tv;

  const { data: videos } = useGetTmdbVideos(
    { id: item.id, type: mediaType },
    { query: { enabled: isActive, queryKey: getGetTmdbVideosQueryKey({ id: item.id, type: mediaType }) } }
  );

  const trailer =
    videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    videos?.results?.[0];

  const title = item.title || item.name || item.original_title || item.original_name;
  const year = (item.release_date || item.first_air_date)?.substring(0, 4);
  const rating = item.vote_average?.toFixed(1);
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/original${item.poster_path}`
    : null;
  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : posterUrl;

  // --- YouTube audio control via postMessage (zero reload) ---
  const fadeVolumeIn = useCallback(() => {
    const STEPS = 10;
    const DURATION_MS = 500;
    for (let i = 1; i <= STEPS; i++) {
      setTimeout(() => {
        sendYtCommand(iframeRef.current, "setVolume", [Math.round((i / STEPS) * 85)]);
      }, (i / STEPS) * DURATION_MS);
    }
  }, []);

  const applyMuteState = useCallback(
    (muted: boolean) => {
      if (muted) {
        sendYtCommand(iframeRef.current, "mute");
        sendYtCommand(iframeRef.current, "setVolume", [0]);
      } else {
        sendYtCommand(iframeRef.current, "unMute");
        fadeVolumeIn();
      }
    },
    [fadeVolumeIn]
  );

  // Apply mute state whenever it changes (or when video becomes ready)
  useEffect(() => {
    if (!videoLoaded) return;
    applyMuteState(isMuted);
  }, [isMuted, videoLoaded, applyMuteState]);

  // Reset video loaded when card goes inactive
  useEffect(() => {
    if (!isActive) setVideoLoaded(false);
  }, [isActive]);

  const handleIframeLoad = () => {
    // Small delay so YT IFrame API has time to initialize
    setTimeout(() => {
      setVideoLoaded(true);
      if (!isMuted) applyMuteState(false);
    }, 800);
  };

  // --- Tap handling ---
  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_MS = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      // Double tap → like + heart burst
      if (!isLiked(item.id)) toggleLike(item);
      setShowHeartBurst(true);
      navigator.vibrate?.(30);
      setTimeout(() => setShowHeartBurst(false), 900);
    } else {
      // Single tap → toggle mute after delay (to distinguish from double)
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_MS) {
          onMuteToggle();
          navigator.vibrate?.(10);
          if (isMuted) setRippleKey((k) => k + 1); // ripple on unmute
        }
      }, DOUBLE_TAP_MS);
    }
    lastTapRef.current = now;
  };

  const handleMuteButtonClick = () => {
    onMuteToggle();
    navigator.vibrate?.(10);
    if (isMuted) setRippleKey((k) => k + 1);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(item);
    navigator.vibrate?.(15);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(item);
    navigator.vibrate?.(15);
  };

  const iframeSrc = trailer
    ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playsinline=1&playlist=${trailer.key}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : null;

  return (
    <div className="relative w-full h-[100dvh] snap-center-item bg-black overflow-hidden">

      {/* ── Poster / Backdrop (always shown, blurred under video) ── */}
      {backdropUrl && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            videoLoaded ? "opacity-0" : "opacity-100"
          )}
        >
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover opacity-60 blur-[2px] scale-105"
          />
          <div className="absolute inset-0 bg-black/30" />
          {/* Shimmer skeleton overlay */}
          {isActive && (
            <div className="skeleton-shimmer absolute inset-0" />
          )}
          {/* Loading indicator */}
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-3 text-white/50">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-primary animate-spin" />
          </div>
        </div>
      )}

      {/* ── YouTube iframe (tap area + video) ── */}
      <div className="absolute inset-0 w-full h-full" onClick={handleTap}>
        {isActive && iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            allow="autoplay; encrypted-media"
            onLoad={handleIframeLoad}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none",
              "w-[300vw] h-[300vh] md:w-[130vw] md:h-[130vh]",
              "transition-opacity duration-700",
              videoLoaded ? "opacity-85" : "opacity-0"
            )}
          />
        )}
      </div>

      {/* ── Heart burst on double tap ── */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart className="heart-burst w-36 h-36 text-primary fill-primary drop-shadow-[0_0_24px_rgba(244,62,92,0.95)]" />
        </div>
      )}

      {/* ── Gradient overlays ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[65vh] bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-0 right-0 h-[22vh] bg-gradient-to-b from-black/75 to-transparent pointer-events-none z-10" />

      {/* ── Mute / Unmute button (top right, animated) ── */}
      <SpeakerButton
        isMuted={isMuted}
        onToggle={handleMuteButtonClick}
        rippleKey={rippleKey}
      />

      {/* ── Bottom content + action bar ── */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-24 md:pb-8 z-20 flex items-end justify-between pointer-events-none">

        {/* Movie info */}
        <div className="flex-1 pr-16 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest border border-white/20 px-2 py-0.5 rounded text-white/70 uppercase">
              {isMovie ? "Movie" : "Series"}
            </span>
            {rating && <span className="text-primary font-bold text-sm">★ {rating}</span>}
            {year && <span className="text-white/55 text-sm">{year}</span>}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
            {title}
          </h2>
          <p className="text-white/65 text-sm md:text-base line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md">
            {item.overview}
          </p>
        </div>

        {/* Action bar */}
        <div className="absolute right-4 bottom-24 md:bottom-8 flex flex-col items-center gap-5 pointer-events-auto">
          {/* Like */}
          <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
            <div
              className={cn(
                "p-3 rounded-full border backdrop-blur-md transition-all duration-200 group-active:scale-90",
                isLiked(item.id)
                  ? "bg-primary/30 border-primary shadow-[0_0_16px_rgba(244,62,92,0.55)]"
                  : "bg-black/40 border-white/15 hover:border-white/30"
              )}
            >
              <Heart
                className={cn(
                  "w-7 h-7 transition-all duration-200",
                  isLiked(item.id) ? "text-primary fill-primary scale-110" : "text-white"
                )}
              />
            </div>
            <span className="text-xs text-white/80 font-medium">
              {item.vote_count ? (item.vote_count / 1000).toFixed(1) + "K" : "Like"}
            </span>
          </button>

          {/* Save */}
          <button onClick={handleSave} className="flex flex-col items-center gap-1 group">
            <div
              className={cn(
                "p-3 rounded-full border backdrop-blur-md transition-all duration-200 group-active:scale-90",
                isSaved(item.id)
                  ? "bg-white/20 border-white/60 shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                  : "bg-black/40 border-white/15 hover:border-white/30"
              )}
            >
              <Bookmark
                className={cn(
                  "w-7 h-7 transition-all duration-200",
                  isSaved(item.id) ? "text-white fill-white scale-110" : "text-white"
                )}
              />
            </div>
            <span className="text-xs text-white/80 font-medium">Save</span>
          </button>

          {/* Share */}
          <button
            onClick={(e) => { e.stopPropagation(); navigator.share?.({ title: title ?? "", url: window.location.href }).catch(() => {}); }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/40 border border-white/15 backdrop-blur-md transition-all duration-200 group-active:scale-90 hover:border-white/30">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-white/80 font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
