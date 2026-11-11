// Podcast episode pieces for the post template (used when a post's contentType is "podcast").
// Everything from the CMS is escaped, and URLs are checked: https only, embeds only from known podcast/video players.
import { icon } from './icons.js';
import { esc, toHtml } from './portable.js';

const EMBED_HOSTS = new Set([
  'open.spotify.com', 'embed.podcasts.apple.com', 'www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com',
  'player.simplecast.com', 'www.buzzsprout.com', 'player.transistor.fm', 'w.soundcloud.com', 'player.captivate.fm', 'playlist.megaphone.fm',
]);
const VIDEO_HOSTS = new Set(['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com']);

const httpsUrl = (u) => { try { const x = new URL(String(u || '')); return x.protocol === 'https:' ? x.href : ''; } catch { return ''; } };
const embedUrl = (u) => { const h = httpsUrl(u); return h && EMBED_HOSTS.has(new URL(h).hostname) ? h : ''; };
const imgUrl = (u) => { const h = httpsUrl(u); return h && new URL(h).hostname === 'cdn.sanity.io' ? h : (typeof u === 'string' && /^\/[^/]/.test(u) ? u : ''); };

// "42:10" or "1:02:10" -> seconds, or null when it isn't a time.
export const toSeconds = (t) => {
  const p = String(t ?? '').trim().split(':');
  if (p.length < 1 || p.length > 3 || p.some((n) => !/^\d{1,2}$/.test(n.trim()))) return null;
  return p.reduce((a, n) => a * 60 + Number(n), 0);
};
const isoDuration = (s) => (s == null ? '' : `PT${Math.floor(s / 3600)}H${Math.floor((s % 3600) / 60)}M${s % 60}S`);

export function podcastView(post, base) {
  const p = post.podcast || {};
  const audio = httpsUrl(p.audioUrl) || (/^\/[^/]/.test(p.audioUrl || '') ? p.audioUrl : '');
  const embed = embedUrl(p.embedUrl);
  const seconds = toSeconds(p.duration);
  const ep = Number.isFinite(Number(p.episodeNumber)) && p.episodeNumber !== null && p.episodeNumber !== '' ? Number(p.episodeNumber) : null;
  const season = Number.isFinite(Number(p.season)) && p.season !== null && p.season !== '' ? Number(p.season) : null;
  const guests = (p.guests || []).filter((g) => g && typeof g.name === 'string' && g.name.trim());
  const chapters = (p.chapters || []).filter((c) => c && typeof c.title === 'string' && c.title.trim() && toSeconds(c.time) !== null);
  const platforms = (p.platforms || []).map((x) => ({ name: String((x && x.name) || '').trim(), url: httpsUrl(x && x.url) })).filter((x) => x.name && x.url);
  const transcript = Array.isArray(p.transcript) && p.transcript.length ? toHtml(p.transcript).html : '';
  const show = toHtml(post.body);
  const img = post.image && post.image.url ? post.image : null;

  // meta line in the hero
  const epLabel = [ep != null ? `Episode ${ep}` : '', season != null ? `Season ${season}` : ''].filter(Boolean).join(' · ');
  const mins = seconds != null ? Math.max(1, Math.round(seconds / 60)) : null;
  const metaItems = [epLabel, mins ? `${mins} min listen` : ''].filter(Boolean).map((t) => `<span class="post-meta__item">${esc(t)}</span>`).join('');

  // player card: cover art + audio (or embed) + "listen on" links
  let player = '';
  if (audio || embed || platforms.length) {
    const art = img ? `<img src="${esc(img.url)}${/sanity/.test(img.url) ? '?w=480&h=480&fit=crop&auto=format' : ''}" alt="${esc(img.alt || '')}" width="240" height="240" fetchpriority="high">` : `<span class="pod-art__ph" aria-hidden="true">${icon('microphone', 56)}</span>`;
    const video = embed && VIDEO_HOSTS.has(new URL(embed).hostname);
    const control = audio
      ? `<audio controls preload="none" src="${esc(audio)}">Your browser does not support audio playback. <a href="${esc(audio)}">Download the episode</a>.</audio>`
      : embed ? `<iframe class="pod-embed${video ? ' pod-embed--video' : ''}" src="${esc(embed)}" title="${esc(post.title)}" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" referrerpolicy="strict-origin-when-cross-origin"></iframe>` : '';
    const links = platforms.length ? `<div class="pod-platforms"><span id="pod-listen">Listen on</span><ul aria-labelledby="pod-listen">${platforms.map((x) => `<li><a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.name)}<span class="sr-only"> (opens in a new tab)</span></a></li>`).join('')}</ul></div>` : '';
    player = `<section class="post-feature pod-feature" aria-label="Listen to this episode"><div class="pod-player"><div class="pod-art">${art}</div><div class="pod-player__main">${epLabel ? `<p class="pod-player__label">${esc(epLabel)}</p>` : ''}${control}${links}</div></div></section>`;
  }

  // sections inside the article, each with an id for the contents list
  const toc = [];
  let articleHtml = '';
  if (guests.length) {
    toc.push({ id: 'guests', text: guests.length > 1 ? 'Guests' : 'Guest', level: 2 });
    articleHtml += `<section class="pod-section" aria-labelledby="guests"><h2 id="guests">${guests.length > 1 ? 'Guests' : 'Guest'}</h2><ul class="pod-guests">${guests.map((g) => {
      const gi = imgUrl(g.image); const li = httpsUrl(g.linkedin);
      const sub = [g.role, g.company].map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean).join(', ');
      return `<li class="pod-guest">${gi ? `<img src="${esc(gi)}${/sanity/.test(gi) ? '?w=128&h=128&fit=crop&auto=format' : ''}" alt="" width="64" height="64">` : `<span class="pod-guest__avatar" aria-hidden="true">${esc(g.name.trim()[0])}</span>`}<div><strong>${esc(g.name)}</strong>${sub ? `<span>${esc(sub)}</span>` : ''}${li ? `<a href="${esc(li)}" rel="noopener" target="_blank">LinkedIn<span class="sr-only"> (opens in a new tab)</span></a>` : ''}</div></li>`;
    }).join('')}</ul></section>`;
  }
  if (chapters.length) {
    toc.push({ id: 'chapters', text: 'Chapters', level: 2 });
    articleHtml += `<section class="pod-section" aria-labelledby="chapters"><h2 id="chapters">Chapters</h2><ol class="pod-chapters">${chapters.map((c) => {
      const s = toSeconds(c.time);
      const t = esc(String(c.time).trim());
      return `<li>${audio ? `<button type="button" class="pod-time" data-t="${s}" aria-label="Play from ${t}">${t}</button>` : `<span class="pod-time">${t}</span>`}<span>${esc(c.title)}</span></li>`;
    }).join('')}</ol></section>`;
  }
  if (show.html) {
    toc.push({ id: 'show-notes', text: 'Show notes', level: 2 });
    articleHtml += `<h2 id="show-notes">Show notes</h2>${show.html}`;
  }
  if (transcript) {
    toc.push({ id: 'transcript', text: 'Transcript', level: 2 });
    articleHtml += `<section class="pod-section" aria-labelledby="transcript"><h2 id="transcript">Transcript</h2><details class="pod-transcript"><summary>Read the full transcript</summary><div>${transcript}</div></details></section>`;
  }
  // show-note headings sit under "Show notes" in the contents list
  const headings = [...toc.filter((t) => t.id !== 'transcript'), ...show.headings.map((h) => ({ ...h, level: 3 })), ...toc.filter((t) => t.id === 'transcript')];

  const script = audio && chapters.length
    ? `<script>(function(){var a=document.querySelector('.pod-player audio');if(!a)return;[].slice.call(document.querySelectorAll('.pod-time[data-t]')).forEach(function(b){b.addEventListener('click',function(){a.currentTime=+b.dataset.t;var p=a.play();if(p&&p.catch)p.catch(function(){});a.scrollIntoView({block:'nearest',behavior:'smooth'})})})})();</script>`
    : '';

  const jsonLd = {
    '@type': 'PodcastEpisode', name: post.title,
    ...(ep != null ? { episodeNumber: ep } : {}),
    partOfSeries: { '@type': 'PodcastSeries', name: 'DOXA Podcast', url: `${base}/blog?type=podcast` },
    ...(audio ? { associatedMedia: { '@type': 'AudioObject', contentUrl: audio.startsWith('/') ? base + audio : audio, ...(seconds != null ? { duration: isoDuration(seconds) } : {}) } } : {}),
    ...(guests.length ? { actor: guests.map((g) => ({ '@type': 'Person', name: g.name.trim() })) } : {}),
    ...(transcript ? { hasPart: { '@type': 'WebPageElement', name: 'Transcript', cssSelector: '#transcript' } } : {}),
  };
  return { top: player, metaItems, articleHtml, headings, script, jsonLd, css: '<link rel="stylesheet" href="/blog-assets/podcast.css">' };
}
