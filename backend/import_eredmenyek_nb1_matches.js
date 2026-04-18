'use strict';

const axios = require('axios');
const mongoose = require('mongoose');

const Team = require('./models/Team');
const Game = require('./models/Game');

const SOURCE_URL = 'https://www.eredmenyek.com/foci/magyarorszag/nb-i/eredmenyek/';
const MONGO_URI = 'mongodb://127.0.0.1:27017/sportstat';

function accentFold(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const TEAM_ALIASES = {
  'ferencvarosi tc': 'Ferencvárosi TC',
  'gyori eto': 'Győri ETO FC',
  'debreceni vsc': 'Debreceni VSC',
  'ujpest': 'Újpest FC',
  'puskas akademia': 'Puskás Akadémia FC',
  'paks': 'Paksi FC',
  'zalaegerszeg': 'Zalaegerszegi TE FC',
  'mtk budapest': 'MTK Budapest',
  'kisvarda': 'Kisvárda FC',
  'nyiregyhaza': 'Nyíregyháza Spartacus FC',
  'diosgyori vtk': 'Diósgyőri VTK',
  'kazincbarcika': 'Kazincbarcika SC',
};

function extractResultsFeed(html) {
  const marker = "cjs.initialFeeds['results']";
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) {
    throw new Error('Embedded results feed marker not found');
  }

  const sub = html.slice(markerIdx, markerIdx + 1200000);
  const start = sub.indexOf('data: `');
  if (start === -1) {
    throw new Error('Results feed data start not found');
  }

  const startData = start + 'data: `'.length;
  const endData = sub.indexOf('`', startData);
  if (endData === -1) {
    throw new Error('Results feed data end not found');
  }

  return sub.slice(startData, endData);
}

function parseEvents(feed) {
  const rows = feed.split('¬');
  const events = [];
  let current = null;

  for (const row of rows) {
    if (row.startsWith('~AA÷')) {
      if (current) events.push(current);
      current = { AA: row.split('÷')[1] };
      continue;
    }

    if (!current) continue;
    const idx = row.indexOf('÷');
    if (idx <= 0) continue;

    const key = row.slice(0, idx);
    const value = row.slice(idx + 1);
    current[key] = value;
  }

  if (current) events.push(current);
  return events;
}

function toFinishedMatch(event) {
  const homeGoals = Number.parseInt(event.AG || '', 10);
  const awayGoals = Number.parseInt(event.AH || '', 10);
  const unixTs = Number.parseInt(event.AD || '', 10);

  if (Number.isNaN(homeGoals) || Number.isNaN(awayGoals) || Number.isNaN(unixTs)) {
    return null;
  }

  const homeNameRaw = (event.AE || event.CX || '').trim();
  const awayNameRaw = (event.AF || '').trim();

  if (!homeNameRaw || !awayNameRaw) {
    return null;
  }

  return {
    eventId: event.AA,
    homeNameRaw,
    awayNameRaw,
    homeGoals,
    awayGoals,
    date: new Date(unixTs * 1000),
  };
}

async function main() {
  const shouldReplace = !process.argv.includes('--keep-existing');

  console.log('Downloading NB1 results page from eredmenyek.com...');
  const { data: html } = await axios.get(SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
    },
    timeout: 20000,
  });

  const feed = extractResultsFeed(html);
  const events = parseEvents(feed);
  const parsedMatches = events.map(toFinishedMatch).filter(Boolean);

  console.log(`Parsed finished matches: ${parsedMatches.length}`);

  await mongoose.connect(MONGO_URI);

  const teams = await Team.find({});
  const teamMap = new Map();
  for (const team of teams) {
    teamMap.set(accentFold(team.name), team);
  }

  const resolveTeam = (sourceName) => {
    const folded = accentFold(sourceName);
    const aliased = TEAM_ALIASES[folded] || sourceName;
    const foldedAlias = accentFold(aliased);

    if (teamMap.has(foldedAlias)) {
      return teamMap.get(foldedAlias);
    }

    for (const [k, t] of teamMap.entries()) {
      if (k.includes(foldedAlias) || foldedAlias.includes(k)) {
        return t;
      }
    }

    return null;
  };

  const matchDocs = [];
  const unresolvedTeams = new Set();

  for (const m of parsedMatches) {
    const homeTeam = resolveTeam(m.homeNameRaw);
    const awayTeam = resolveTeam(m.awayNameRaw);

    if (!homeTeam || !awayTeam) {
      if (!homeTeam) unresolvedTeams.add(m.homeNameRaw);
      if (!awayTeam) unresolvedTeams.add(m.awayNameRaw);
      continue;
    }

    matchDocs.push({
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      homeTeamGoals: m.homeGoals,
      awayTeamGoals: m.awayGoals,
      date: m.date,
      status: 'finished',
      sport: 'football',
      stadium: '',
      referee: '',
    });
  }

  if (shouldReplace) {
    const del = await Game.deleteMany({ sport: 'football', status: 'finished' });
    console.log(`Deleted previous finished football matches: ${del.deletedCount}`);
  }

  let inserted = 0;
  if (matchDocs.length > 0) {
    const insertedDocs = await Game.insertMany(matchDocs, { ordered: false });
    inserted = insertedDocs.length;
  }

  console.log(`Imported matches: ${inserted}`);
  console.log(`Skipped unresolved-team matches: ${parsedMatches.length - matchDocs.length}`);

  if (unresolvedTeams.size > 0) {
    console.log('Unresolved team names:');
    for (const name of unresolvedTeams) {
      console.log(` - ${name}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(async (err) => {
  console.error('Import failed:', err.message);
  try {
    await mongoose.disconnect();
  } catch (_e) {
    // noop
  }
  process.exit(1);
});
