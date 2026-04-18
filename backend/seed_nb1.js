/**
 * seed_nb1.js
 * Transfermarkt NB1 scraper: jatekosok + edzok betoltese MongoDB-be.
 * Futtatas: npm run seed:nb1
 */

'use strict';
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

const Team   = require('./models/Team');
const Player = require('./models/Player');
const Coach  = require('./models/Coach');
const Season = require('./models/Season');

const MONGO_URI = 'mongodb://127.0.0.1:27017/sportstat';

// DB-beli csapatnevekhez igazitott TM adatok
const NB1_TEAMS = [
  { name: 'Ferencvarosi TC',       slug: 'ferencvarosi-tc',        tmId: 279   },
  { name: 'Gyori ETO FC',          slug: 'eto-fc',                 tmId: 6055  },
  { name: 'Debreceni VSC',         slug: 'debreceni-vsc',          tmId: 84    },
  { name: 'Ujpest FC',             slug: 'ujpest-fc',              tmId: 131   },
  { name: 'Puskas Akademia FC',    slug: 'puskas-akademia-fc',     tmId: 6301  },
  { name: 'Paksi FC',              slug: 'paksi-fc',               tmId: 712   },
  { name: 'Zalaegerszegi TE FC',   slug: 'zalaegerszegi-te-fc',    tmId: 1436  },
  { name: 'MTK Budapest',          slug: 'mtk-budapest',           tmId: 130   },
  { name: 'Kisvarda FC',           slug: 'kisvarda-fc',            tmId: 27741 },
  { name: 'Nyiregyhaza Spartacus FC', slug: 'nyiregyhaza-spartacus', tmId: 2297  },
  { name: 'Diosgyori VTK',         slug: 'diosgyor-vtk',           tmId: 9241  },
  { name: 'Kazincbarcika SC',      slug: 'kazincbarcikai-sc',      tmId: 35488 },
];

// Pontosan illeszkedik a DB neveire (accent-folded keresés)
function accentFold(s) {
  return s
    .replace(/[áàâä]/g, 'a').replace(/[ÁÀÂÄ]/g, 'A')
    .replace(/[éèêë]/g, 'e').replace(/[ÉÈÊË]/g, 'E')
    .replace(/[íìîï]/g, 'i').replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[óòôöő]/g, 'o').replace(/[ÓÒÔÖŐ]/g, 'O')
    .replace(/[úùûüű]/g, 'u').replace(/[ÚÙÛÜŰ]/g, 'U')
    .replace(/[ő]/g, 'o').replace(/[Ő]/g, 'O')
    .replace(/[ű]/g, 'u').replace(/[Ű]/g, 'U')
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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function createBaseStats(playerName, position) {
  const role = normalizePosition(position);
  const h = hashString(`${playerName}:${role}`);
  const gp = clamp(8 + (h % 18), 6, 30);

  let goals = 0;
  let assists = 0;
  let passes = 0;
  let actions = 0;
  let tackles = 0;
  let saves = 0;
  let baseRating = 6.8;

  if (role === 'Goalkeeper') {
    goals = 0;
    assists = h % 2;
    passes = gp * (18 + (h % 4));
    actions = gp * (6 + (h % 3));
    tackles = h % 8;
    saves = gp * (2 + (h % 3));
    baseRating = 6.9;
  } else if (role === 'Defender') {
    goals = clamp(Math.floor(gp * 0.08) + (h % 2), 0, 6);
    assists = clamp(Math.floor(gp * 0.12) + (h % 3), 0, 9);
    passes = gp * (30 + (h % 8));
    actions = gp * (10 + (h % 5));
    tackles = gp * (2 + (h % 2));
    baseRating = 7.0;
  } else if (role === 'Forward') {
    goals = clamp(Math.floor(gp * 0.38) + (h % 4), 1, 18);
    assists = clamp(Math.floor(gp * 0.2) + (h % 3), 0, 12);
    passes = gp * (14 + (h % 5));
    actions = gp * (8 + (h % 4));
    tackles = gp + (h % 5);
    baseRating = 7.2;
  } else {
    goals = clamp(Math.floor(gp * 0.18) + (h % 3), 0, 11);
    assists = clamp(Math.floor(gp * 0.24) + (h % 4), 1, 14);
    passes = gp * (23 + (h % 8));
    actions = gp * (9 + (h % 5));
    tackles = gp * (1 + (h % 2));
    baseRating = 7.1;
  }

  const faults = clamp(gp + 4 + (h % 7), 6, 48);
  const yellowCards = clamp(Math.floor(faults / 8), 0, 10);
  const redCards = clamp(Math.floor(yellowCards / 7), 0, 2);
  const rating = clamp(Number((baseRating + goals / 20 + assists / 30).toFixed(1)), 5.9, 9.4);

  return {
    gamesPlayed: gp,
    goals,
    assists,
    points: goals + assists,
    faults,
    yellowCards,
    redCards,
    passes,
    actions,
    tackles,
    saves,
    minutesPlayed: gp * (56 + (h % 35)),
    rating,
  };
}

const normalizePosition = (pos) => {
  if (!pos) return 'Midfielder';
  const p = pos.toLowerCase();
  if (p.includes('goalkeeper'))                                 return 'Goalkeeper';
  if (p.includes('centre-back') || p.includes('center-back'))  return 'Defender';
  if (p.includes('back') || p.includes('defender'))            return 'Defender';
  if (p.includes('defensive mid'))                             return 'Midfielder';
  if (p.includes('attacking mid'))                             return 'Attacking Midfielder';
  if (p.includes('central mid') || p.includes('midfield'))     return 'Midfielder';
  if (p.includes('winger') || p.includes('left mid') || p.includes('right mid')) return 'Winger';
  if (p.includes('forward') || p.includes('striker'))          return 'Forward';
  return 'Midfielder';
};

const parseAge = (txt) => {
  if (!txt) return null;
  const m = txt.match(/\((\d+)\)/);
  return m ? parseInt(m[1]) : null;
};

const parseJersey = (txt) => {
  const n = parseInt(txt);
  return (!isNaN(n) && n >= 1 && n <= 99) ? n : undefined;
};

const tmAxios = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  timeout: 15000,
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchSquad(slug, tmId) {
  const url = `https://www.transfermarkt.com/${slug}/kader/verein/${tmId}/saison_id/2025`;
  try {
    const { data } = await tmAxios.get(url);
    const $ = cheerio.load(data);
    const players = [];

    $('#yw1 table.items tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 3) return;

      const jerseyTxt = $(cells[0]).text().trim();
      const nameEl = $(row).find('.hauptlink a').first();
      const name = nameEl.text().trim();
      if (!name) return;

      // pozicio - tobb helyen lehet
      let positionTxt = '';
      cells.each((i, c) => {
        const t = $(c).text().trim();
        if (t.match(/(Goalkeeper|Back|Midfield|Winger|Forward|Midfielder|Defender)/i) && t.length < 40) {
          positionTxt = t;
        }
      });

      let ageTxt = '';
      cells.each((i, c) => {
        const t = $(c).text().trim();
        if (t.match(/\d{2}\/\d{2}\/\d{4}/)) ageTxt = t;
      });

      const flags = [];
      $(row).find('img.flaggenrahmen').each((_, img) => {
        const alt = $(img).attr('alt') || $(img).attr('title') || '';
        if (alt) flags.push(alt.trim());
      });

      players.push({
        name,
        jerseyNumber: parseJersey(jerseyTxt),
        position: normalizePosition(positionTxt),
        age: parseAge(ageTxt),
        nationality: flags[0] || undefined,
      });
    });

    return players;
  } catch (err) {
    console.error(`  ERR ${slug}: ${err.message}`);
    return [];
  }
}

async function fetchCoach(slug, tmId) {
  const url = `https://www.transfermarkt.com/${slug}/startseite/verein/${tmId}`;
  try {
    const { data } = await tmAxios.get(url);
    const $ = cheerio.load(data);

    let coachName = null;
    let coachNat = null;

    // Proba 1: data-header__details li ahol "Trainer" span van
    $('div.data-header__details li').each((_, li) => {
      const spans = $(li).find('span');
      let isCoach = false;
      spans.each((_, sp) => {
        if (/trainer|manager|coach/i.test($(sp).text())) isCoach = true;
      });
      if (isCoach) {
        const a = $(li).find('a').first();
        if (a.length && !coachName) {
          coachName = a.text().trim();
          const img = $(li).find('img').first();
          coachNat = img.attr('alt') || img.attr('title') || null;
        }
      }
    });

    // Proba 2: barmely elem ami "Trainer" szoveget tartalmaz (span/td)
    if (!coachName) {
      $('span, td').each((_, el) => {
        if (/^trainer$/i.test($(el).text().trim())) {
          // A kovetkezo link
          const next = $(el).parent().find('a').first();
          if (next.length) coachName = next.text().trim();
        }
      });
    }

    return coachName ? { name: coachName, nationality: coachNat } : null;
  } catch (err) {
    console.error(`  Coach ERR (${slug}): ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('Csatlakozas MongoDB-hez...');
  await mongoose.connect(MONGO_URI);
  console.log('Csatlakozva\n');

  console.log('Regi adatok torlese...');
  await Player.deleteMany({});
  await Coach.deleteMany({});
  console.log('Jatekosok es edzok torolve.\n');

  const allTeams = await Team.find({});
  // Accent-fold-olt terkep a keres megkonnyi
  const teamMap = {};
  for (const t of allTeams) {
    teamMap[accentFold(t.name)] = { id: t._id, realName: t.name };
  }
  console.log(`${allTeams.length} csapat betoltve a DB-bol.\n`);

  // 2025/2026 szezon
  let season = await Season.findOne({ name: '2025/2026' });
  if (!season) {
    season = await Season.create({
      name: '2025/2026', sport: 'football', league: 'NB1',
      startDate: new Date('2025-07-25'), endDate: new Date('2026-05-31'),
      status: 'ongoing', isActive: true, totalMatches: 33,
    });
    console.log('2025/2026 szezon letrehozva.\n');
  }

  let totalPlayers = 0;
  let totalCoaches = 0;

  for (const tmTeam of NB1_TEAMS) {
    const key = accentFold(tmTeam.name);
    const dbEntry = teamMap[key];
    if (!dbEntry) {
      // Partial match keresese
      let found = null;
      for (const [k, v] of Object.entries(teamMap)) {
        if (k.includes(key) || key.includes(k)) { found = v; break; }
      }
      if (!found) {
        console.log(`SKIP (nem talalt): ${tmTeam.name}`);
        continue;
      }
    }
    const teamId = (dbEntry || Object.values(teamMap).find(v => accentFold(v.realName).includes(key) || key.includes(accentFold(v.realName)))).id;

    console.log(`Csapat: ${tmTeam.name} (slug=${tmTeam.slug}, id=${tmTeam.tmId})`);

    const squad = await fetchSquad(tmTeam.slug, tmTeam.tmId);
    if (squad.length > 0) {
      const docs = squad.map(p => ({
        ...p,
        team: teamId,
        stats: createBaseStats(p.name, p.position),
      }));
      await Player.insertMany(docs, { ordered: false });
      totalPlayers += docs.length;
      console.log(`  OK: ${docs.length} jatekos`);
    } else {
      console.log(`  WARN: keret nem sikerult`);
    }

    const coachData = await fetchCoach(tmTeam.slug, tmTeam.tmId);
    if (coachData && coachData.name) {
      await Coach.create({
        name: coachData.name,
        nationality: coachData.nationality || undefined,
        specialization: 'head_coach', currentTeam: teamId, isActive: true,
      });
      totalCoaches++;
      console.log(`  Edzo: ${coachData.name}`);
    }

    await sleep(1500);
  }

  console.log(`\nKesz!`);
  console.log(`  Jatekosok: ${totalPlayers}`);
  console.log(`  Edzok:     ${totalCoaches}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error('Hiba:', err.message); process.exit(1); });
