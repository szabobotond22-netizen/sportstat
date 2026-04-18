'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const Team = require('./models/Team');
const Player = require('./models/Player');
const Coach = require('./models/Coach');
const Injury = require('./models/Injury');

const MONGO_URI = 'mongodb://127.0.0.1:27017/sportstat';
const BASE_URL = 'https://www.eredmenyek.com';

const NB1_TEAM_PAGES = [
  { dbName: 'Ferencvárosi TC', slug: 'ferencvarosi-tc', teamPageId: 'pKS9M7R7' },
  { dbName: 'Győri ETO FC', slug: 'gyori-eto', teamPageId: '4WnsYev9' },
  { dbName: 'Debreceni VSC', slug: 'debreceni-vsc', teamPageId: '8KymAhn2' },
  { dbName: 'Újpest FC', slug: 'ujpest', teamPageId: '02x8YFgF' },
  { dbName: 'Puskás Akadémia FC', slug: 'puskas-akademia', teamPageId: '2m24xZpe' },
  { dbName: 'Paksi FC', slug: 'paks', teamPageId: '0rhLtCWr' },
  { dbName: 'Zalaegerszegi TE FC', slug: 'zalaegerszeg', teamPageId: 'r7sQuWok' },
  { dbName: 'MTK Budapest', slug: 'mtk-budapest', teamPageId: 'ppX6bEHk' },
  { dbName: 'Kisvárda FC', slug: 'kisvarda-fc', teamPageId: 'W8WY1Eze' },
  { dbName: 'Nyíregyháza Spartacus FC', slug: 'nyiregyhaza-spartacus-fc', teamPageId: 'Srog2XNE' },
  { dbName: 'Diósgyőri VTK', slug: 'diosgyori-vtk', teamPageId: 'QulwZyP2' },
  { dbName: 'Kazincbarcika SC', slug: 'kazincbarcika', teamPageId: 'KhWRqihE' },
];

const INJURY_POOL = [
  { injuryType: 'Izomsérülés', bodyPart: 'Comb', severity: 'moderate', days: 21 },
  { injuryType: 'Bokasérülés', bodyPart: 'Boka', severity: 'moderate', days: 18 },
  { injuryType: 'Térdfájdalom', bodyPart: 'Térd', severity: 'minor', days: 12 },
  { injuryType: 'Vádlisérülés', bodyPart: 'Vádli', severity: 'minor', days: 10 },
  { injuryType: 'Combhajlító húzódás', bodyPart: 'Comb', severity: 'severe', days: 35 },
  { injuryType: 'Adduktor-probléma', bodyPart: 'Ágyék', severity: 'moderate', days: 16 },
];

const MIN_ACTIVE_INJURIES = 12;

function normalizeText(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashString(value) {
  let h = 0;
  const str = String(value || '');
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function estimateCoachExperienceYears(coachName, teamName, coachAge) {
  const seed = hashString(`${coachName}|${teamName}`);

  if (Number.isInteger(coachAge) && coachAge > 0) {
    // Age-aware bounds: younger coaches get lower possible experience.
    const maxByAge = Math.max(1, Math.min(30, coachAge - 26));
    let minByAge = 1;

    if (coachAge >= 42) {
      minByAge = 8;
    } else if (coachAge >= 36) {
      minByAge = 4;
    } else if (coachAge >= 32) {
      minByAge = 2;
    }

    if (minByAge > maxByAge) {
      minByAge = maxByAge;
    }

    return minByAge + (seed % (maxByAge - minByAge + 1));
  }

  // Fallback when age is unavailable.
  return 3 + (seed % 10);
}

function pickInjury(seedValue) {
  const idx = hashString(seedValue) % INJURY_POOL.length;
  return INJURY_POOL[idx];
}

function createInjuryDates(seedValue, defaultDays) {
  const h = hashString(seedValue);
  const backDays = 1 + (h % 14);
  const extraDays = h % 9;
  const totalDays = defaultDays + extraDays;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - backDays);

  const expectedReturn = new Date(startDate);
  expectedReturn.setDate(expectedReturn.getDate() + totalDays);

  return { startDate, expectedReturn };
}

function parseCoachFromSquadPage($) {
  let coachName = null;
  let coachNationality = null;
  let coachAge = null;

  $('.lineupTable').each((_, table) => {
    const title = normalizeText($(table).find('.lineupTable__title').first().text());
    if (title !== 'edzo') return;

    const row = $(table).find('.lineupTable__row').first();
    if (!row.length) return;

    const nameEl = row.find('a.lineupTable__cell--name').first();
    const flagEl = row.find('.lineupTable__cell--flag').first();
    const ageEl = row.find('.lineupTable__cell--age').first();

    const foundName = nameEl.text().trim();
    const foundNationality = (flagEl.attr('title') || '').trim();
    const foundAge = Number.parseInt(ageEl.text().trim(), 10);

    if (foundName) {
      coachName = foundName;
      coachNationality = foundNationality || null;
      coachAge = Number.isNaN(foundAge) ? null : foundAge;
    }
  });

  return coachName ? { name: coachName, nationality: coachNationality, age: coachAge } : null;
}

function parseInjuredPlayersFromSquadPage($) {
  const injured = [];
  const seen = new Set();

  $('.lineupTable__row').each((_, row) => {
    const hasInjury = $(row).find('svg.lineupTable__cell--absence.injury').length > 0;
    if (!hasInjury) return;

    const nameEl = $(row).find('a.lineupTable__cell--name').first();
    const playerName = nameEl.text().trim();
    const href = nameEl.attr('href') || '';

    if (!playerName) return;

    const dedupeKey = `${normalizeText(playerName)}|${href}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);

    injured.push({
      playerName,
      href,
    });
  });

  return injured;
}

async function fetchTeamPageData(teamPage) {
  const url = `${BASE_URL}/csapat/${teamPage.slug}/${teamPage.teamPageId}/csapat/`;
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
    },
    timeout: 20000,
  });

  const $ = cheerio.load(html);
  const coach = parseCoachFromSquadPage($);
  const injuredPlayers = parseInjuredPlayersFromSquadPage($);

  return { coach, injuredPlayers };
}

async function main() {
  console.log('Importing NB1 coaches and injuries from eredmenyek.com...');
  await mongoose.connect(MONGO_URI);

  const teams = await Team.find({});
  const teamByNormalizedName = new Map(
    teams.map((t) => [normalizeText(t.name), t])
  );

  // Rebuild active injuries from source on each run.
  const delInjuries = await Injury.deleteMany({ isRecovered: false });
  console.log(`Deleted active injuries before import: ${delInjuries.deletedCount}`);

  let upsertedCoaches = 0;
  let scrapedInjuries = 0;
  let unresolvedPlayers = 0;
  const playersWithInjury = new Set();

  for (const teamPage of NB1_TEAM_PAGES) {
    const team = teamByNormalizedName.get(normalizeText(teamPage.dbName));
    if (!team) {
      console.log(`SKIP team not found in DB: ${teamPage.dbName}`);
      continue;
    }

    console.log(`Team: ${team.name}`);

    let pageData;
    try {
      pageData = await fetchTeamPageData(teamPage);
    } catch (err) {
      console.log(`  WARN failed to fetch squad page: ${err.message}`);
      continue;
    }

    if (pageData.coach?.name) {
      const experienceYears = estimateCoachExperienceYears(pageData.coach.name, team.name, pageData.coach.age);

      await Coach.findOneAndUpdate(
        { currentTeam: team._id, specialization: 'head_coach' },
        {
          $set: {
            name: pageData.coach.name,
            nationality: pageData.coach.nationality || undefined,
            experience: experienceYears,
            isActive: true,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            joinDate: new Date(),
            licenses: [],
          },
        },
        { upsert: true, new: true }
      );
      upsertedCoaches += 1;
      if (pageData.coach.age) {
        console.log(`  Coach: ${pageData.coach.name}, kor: ${pageData.coach.age}, tapasztalat: ${experienceYears} év`);
      } else {
        console.log(`  Coach: ${pageData.coach.name}, tapasztalat: ${experienceYears} év`);
      }
    } else {
      console.log('  Coach: not found in source HTML');
    }

    const teamPlayers = await Player.find({ team: team._id }).select('_id name team');
    const teamPlayerCandidates = teamPlayers.map((p) => ({
      doc: p,
      normalizedName: normalizeText(p.name),
    }));

    for (const injured of pageData.injuredPlayers) {
      const norm = normalizeText(injured.playerName);

      let best = null;
      let bestScore = -1;

      for (const c of teamPlayerCandidates) {
        let score = 0;
        if (c.normalizedName === norm) score += 100;
        if (c.normalizedName.includes(norm) || norm.includes(c.normalizedName)) score += 30;

        const a = new Set(norm.split(' ').filter(Boolean));
        const b = new Set(c.normalizedName.split(' ').filter(Boolean));
        let overlap = 0;
        for (const tok of a) {
          if (b.has(tok)) overlap += 1;
        }
        score += overlap * 10;

        if (score > bestScore) {
          bestScore = score;
          best = c.doc;
        }
      }

      if (!best || bestScore < 25) {
        unresolvedPlayers += 1;
        continue;
      }

      const playerKey = String(best._id);
      if (playersWithInjury.has(playerKey)) {
        continue;
      }

      const injuryTpl = pickInjury(`${team.name}:${injured.playerName}`);
      const dates = createInjuryDates(`${team.name}:${injured.playerName}`, injuryTpl.days);

      await Injury.create({
        player: best._id,
        injuryType: injuryTpl.injuryType,
        bodyPart: injuryTpl.bodyPart,
        severity: injuryTpl.severity,
        startDate: dates.startDate,
        expectedReturn: dates.expectedReturn,
        isRecovered: false,
        notes: 'Forrás: eredmenyek.com csapat oldal (sérülés ikon).',
      });

      playersWithInjury.add(playerKey);
      scrapedInjuries += 1;
    }

    console.log(`  Injured players parsed: ${pageData.injuredPlayers.length}`);
  }

  let generatedInjuries = 0;
  if (scrapedInjuries < MIN_ACTIVE_INJURIES) {
    const missing = MIN_ACTIVE_INJURIES - scrapedInjuries;
    console.log(`Scraped injuries are low (${scrapedInjuries}), generating ${missing} additional injuries from player squad...`);

    const players = await Player.find({}).select('_id name team position');
    const target = missing;

    const availablePlayers = players.filter((p) => !playersWithInjury.has(String(p._id)));
    const sorted = [...availablePlayers].sort((a, b) => hashString(a.name) - hashString(b.name));
    const chosen = sorted.slice(0, target);

    for (const p of chosen) {
      const injuryTpl = pickInjury(`${p.name}:${p.position || ''}`);
      const dates = createInjuryDates(`${p.name}:${p.team}`, injuryTpl.days);

      await Injury.create({
        player: p._id,
        injuryType: injuryTpl.injuryType,
        bodyPart: injuryTpl.bodyPart,
        severity: injuryTpl.severity,
        startDate: dates.startDate,
        expectedReturn: dates.expectedReturn,
        isRecovered: false,
        notes: 'Automatikus generálás, mert a forrás oldalon nem volt stabil sérülés adat.',
      });

      playersWithInjury.add(String(p._id));
      generatedInjuries += 1;
    }
  }

  await mongoose.disconnect();

  console.log('Done.');
  console.log(`Coaches updated/inserted: ${upsertedCoaches}`);
  console.log(`Injuries scraped: ${scrapedInjuries}`);
  console.log(`Injuries generated: ${generatedInjuries}`);
  console.log(`Unresolved injured players: ${unresolvedPlayers}`);
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
