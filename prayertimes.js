/* ============================================================
   Prayer times — the mosque's published calendar for Cluj, or
   standard solar calculations when a published row is unavailable.
   ============================================================ */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const sin = (d) => Math.sin(d * D2R);
const cos = (d) => Math.cos(d * D2R);
const tan = (d) => Math.tan(d * D2R);
const asin = (x) => Math.asin(x) * R2D;
const acos = (x) => Math.acos(x) * R2D;
const atan = (x) => Math.atan(x) * R2D;

import { CLUJ_YEAR, CLUJ_2026 } from './cluj-times.js';

export const CLUJ_TIME_ZONE = 'Europe/Bucharest';
const clujClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: CLUJ_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// Turn a mosque wall-clock time into an instant, regardless of the phone's zone.
function clujAt(date, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const wall = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
  let instant = wall;
  for (let i = 0; i < 2; i++) {
    const p = Object.fromEntries(clujClock.formatToParts(instant).map(({ type, value }) => [type, +value]));
    instant += wall - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  }
  return new Date(instant);
}

/** Times exactly as Masjid Cluj-Napoca publishes them on Mawaqit. */
function mosqueTimes(date, preset) {
  if (preset !== 'cluj' || date.getFullYear() !== CLUJ_YEAR) return null;
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const row = CLUJ_2026[key];
  if (!row) return null;

  const [fajr, shuruq, dhuhr, asr, maghrib, isha] = row.split(' ');
  const m = clujAt(date, maghrib);
  return {
    fajr: clujAt(date, fajr),
    sunrise: clujAt(date, shuruq),
    dhuhr: clujAt(date, dhuhr),
    asr: clujAt(date, asr),
    maghrib: m,
    isha: clujAt(date, isha),
    sunset: m,
  };
}

export const METHODS = {
  MWL: { label: 'Muslim World League', fajr: 18, isha: 17 },
  ISNA: { label: 'North America (ISNA)', fajr: 15, isha: 15 },
  EGYPT: { label: 'Egyptian Authority', fajr: 19.5, isha: 17.5 },
  KARACHI: { label: 'University of Karachi', fajr: 18, isha: 18 },
  MAKKAH: { label: 'Umm al-Qura, Makkah', fajr: 18.5, isha: 90 },
};

export const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function toDate(input) {
  if (input instanceof Date) return new Date(input.getTime());
  const [y, m, d] = String(input).split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function solar(date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * sin(g) + 0.02 * sin(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * d;

  let ra = Math.atan2(cos(e) * sin(L), cos(L)) * R2D / 15;
  ra = ((ra % 24) + 24) % 24;

  let eqTime = q / 15 - ra;
  if (eqTime > 12) eqTime -= 24;
  if (eqTime < -12) eqTime += 24;

  return { decl: asin(sin(e) * sin(L)), eqTime };
}

function hourAngle(altitude, lat, decl) {
  // cos(H) = (sin(alt) − sin(lat)·sin(dec)) / (cos(lat)·cos(dec))
  const a = sin(altitude) - sin(lat) * sin(decl);
  const b = cos(lat) * cos(decl);
  const c = a / b;
  if (!Number.isFinite(c) || c > 1 || c < -1) return null;
  return acos(c) / 15;
}

function offsetHours(base, hours) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
  d.setTime(d.getTime() + hours * 3600000);
  return d;
}

function roundMinute(date) {
  return new Date(Math.round(date.getTime() / 60000) * 60000);
}

function compute(date, { lat, lng, method = 'MWL', cluj = false }) {
  const m = METHODS[method] || METHODS.MWL;
  const wallNoon = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const localNoon = cluj ? clujAt(date, '12:00') : date;
  const { decl, eqTime } = solar(localNoon);
  const tz = cluj ? (wallNoon - localNoon.getTime()) / 3600000 : -date.getTimezoneOffset() / 60;
  const atHour = (hour) => cluj
    ? new Date(wallNoon + (hour - 12 - tz) * 3600000)
    : offsetHours(date, hour);

  // solar noon, in local clock hours
  const noon = 12 + tz - lng / 15 - eqTime;

  const tSun = hourAngle(-0.833, lat, decl);
  const tFajr = hourAngle(-m.fajr, lat, decl);
  const ishaAngle = typeof m.isha === 'number' && m.isha < 60 ? m.isha : null;
  const tIsha = ishaAngle != null ? hourAngle(-ishaAngle, lat, decl) : null;

  // Asr: shadow length = factor × object (Shafi'i: 1, Hanafi: 2)
  const asrAlt = atan(1 / (1 + tan(Math.abs(lat - decl))));
  const tAsr = hourAngle(asrAlt, lat, decl);

  const halfDay = tSun != null ? tSun : 6;
  const sunrise = roundMinute(atHour(noon - halfDay));
  const sunset = roundMinute(atHour(noon + halfDay));

  let fajr;
  if (tFajr != null) fajr = roundMinute(atHour(noon - tFajr));
  else fajr = new Date(sunrise.getTime() - 80 * 60000); // high-latitude fallback

  let isha;
  if (typeof m.isha === 'number' && m.isha >= 60) {
    isha = new Date(sunset.getTime() + m.isha * 60000); // Umm al-Qura interval
  } else if (tIsha != null) {
    isha = roundMinute(atHour(noon + tIsha));
  } else {
    isha = new Date(sunset.getTime() + 80 * 60000);
  }

  return {
    fajr,
    sunrise,
    dhuhr: roundMinute(atHour(noon + 1 / 60)),
    asr: tAsr != null ? roundMinute(atHour(noon + tAsr)) : roundMinute(atHour(noon + 3.5)),
    maghrib: roundMinute(new Date(sunset.getTime() + 60000)),
    isha,
    sunset,
  };
}

/**
 * Full timing picture for one local calendar day, including the
 * boundaries that decide "on time" vs "late" vs "missed".
 */
export function dayTimes(input, settings) {
  const date = toDate(input);
  const preset = settings.preset;
  const cluj = preset === 'cluj';
  const opts = { lat: settings.lat, lng: settings.lng, method: settings.method, cluj };
  const published = mosqueTimes(date, preset);
  const t = published || compute(date, opts);

  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12, 0, 0);
  const nextPublished = mosqueTimes(next, preset);
  const tNext = nextPublished || compute(next, opts);

  const midnight = cluj ? clujAt(next, '00:00') : new Date(next.getFullYear(), next.getMonth(), next.getDate());

  return {
    ...t,
    source: published ? 'mawaqit' : 'calculated',
    nextFajr: tNext.fajr,
    nextFajrSource: nextPublished ? 'mawaqit' : 'calculated',
    onTimeEnd: {
      fajr: t.sunrise,
      dhuhr: t.asr,
      asr: t.maghrib,
      maghrib: t.isha,
      isha: midnight,
    },
    lateEnd: {
      fajr: t.dhuhr,
      dhuhr: t.maghrib,
      asr: t.isha,
      maghrib: tNext.fajr,
      isha: tNext.fajr,
    },
  };
}

/** What the app should pre-select when you open a prayer. */
export function suggest(info, key, now = new Date()) {
  if (now < info.onTimeEnd[key]) return 'ontime';
  if (now < info.lateEnd[key]) return 'late';
  return 'missed';
}

/** Next prayer still ahead today (or tomorrow's Fajr). */
export function nextPrayer(info, now = new Date()) {
  for (const key of PRAYER_ORDER) {
    if (info[key] > now) return { key, at: info[key], tomorrow: false };
  }
  return { key: 'fajr', at: info.nextFajr, tomorrow: true };
}

export function fmtTime(date, timeZone) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', ...(timeZone ? { timeZone, hourCycle: 'h23' } : {}) });
}

export function fmtCountdown(ms) {
  if (ms <= 0) return 'now';
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 1) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m`;
}
