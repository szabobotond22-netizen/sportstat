teamSchema.pre('save', async function(next) {
  // Név validáció
  if (this.name.length < 3 || this.name.length > 100) {
    throw new Error('Csapat neve 3-100 karakter között kell legyen');
  }

  // Sport enum
  if (!['football', 'basketball', 'tennis', 'other'].includes(this.sport)) {
    throw new Error('Érvénytelen sportág');
  }

  // Alapítási év
  if (this.founded < 1800 || this.founded > new Date().getFullYear()) {
    throw new Error('Alapítási év 1800 és jelenlegi év között kell legyen');
  }

  // Statisztikák
  if (this.stats.wins < 0 || this.stats.draws < 0 || this.stats.losses < 0) {
    throw new Error('Statisztikák nem lehetnek negatívak');
  }

  next();
});

playerSchema.pre('save', async function(next) {
  // Név validáció
  if (this.name.length < 2 || this.name.length > 100) {
    throw new Error('Játékos neve 2-100 karakter között kell legyen');
  }

  // Pozíció validáció
  if (!['goalkeeper', 'defender', 'midfielder', 'forward'].includes(this.position)) {
    throw new Error('Érvénytelen pozíció');
  }

  // Mezszám validáció
  if (this.jerseyNumber < 1 || this.jerseyNumber > 99) {
    throw new Error('Mezszám 1-99 között kell legyen');
  }

  // Mezszám egyediség egy csapatnál
  const duplicate = await Player.findOne({
    team: this.team,
    jerseyNumber: this.jerseyNumber,
    _id: { $ne: this._id }
  });
  if (duplicate) {
    throw new Error('Ez a mezszám már foglalt ebben a csapatnál');
  }

  // Életkor validáció
  if (this.age < 16 || this.age > 50) {
    throw new Error('Játékos életkora 16-50 között kell legyen');
  }

  // Rating validáció
  if (this.stats.rating < 0 || this.stats.rating > 10) {
    throw new Error('Rating 0-10 között kell legyen');
  }

  next();
});

gameSchema.pre('save', async function(next) {
  // Csapat ellenőrzés
  if (this.homeTeam.equals(this.awayTeam)) {
    throw new Error('Hazai és vendég csapat nem lehet ugyanaz');
  }

  // Gólok ellenőrzése
  if (this.homeTeamGoals < 0 || this.awayTeamGoals < 0) {
    throw new Error('Gólok nem lehetnek negatívak');
  }

  // Befejezett mérkőzés csak akkor lehet, ha gólok már rögzítve
  if (this.status === 'finished' && this.homeTeamGoals === undefined) {
    throw new Error('Befejezett mérkőzésnek szükséges a végeredmény');
  }

  // Status validáció
  if (!['scheduled', 'in_progress', 'finished', 'cancelled'].includes(this.status)) {
    throw new Error('Érvénytelen mérkőzés státusz');
  }

  next();
});

contractSchema.pre('save', async function(next) {
  // Dátum ellenőrzés
  if (this.endDate <= this.startDate) {
    throw new Error('Szerződés végdátuma után kell legyen a kezdeti dátumnak');
  }

  // Fizetés ellenőrzés
  if (this.salary < 0) {
    throw new Error('Fizetés nem lehet negatív');
  }

  // Lejárt szerződés automatikus inaktiválása
  if (this.endDate < new Date() && this.isActive) {
    this.isActive = false;
  }

  next();
});

injurySchema.pre('save', async function(next) {
  // Dátum ellenőrzés
  if (this.estimatedReturnDate && this.estimatedReturnDate <= this.injuryDate) {
    throw new Error('Becsült visszatérés után kell legyen a sérülés dátumának');
  }

  if (this.actualReturnDate && this.actualReturnDate < this.injuryDate) {
    throw new Error('Tényleges visszatérés nem lehet sérülés előtti');
  }

  // Status logika
  if (this.actualReturnDate && this.status !== 'recovered') {
    this.status = 'recovered';
  }

  next();
});

seasonSchema.pre('save', async function(next) {
  // Dátum ellenőrzés
  if (this.endDate <= this.startDate) {
    throw new Error('Szezon végdátuma után kell legyen a kezdeti dátumnak');
  }

  // Mérkőzések ellenőrzése
  if (this.matchesPlayed > this.totalMatches) {
    throw new Error('Lejátszott mérkőzések nem lehetnek több, mint az összes');
  }

  next();
});

seasonSchema.pre('save', async function(next) {
  // Dátum ellenőrzés
  if (this.endDate <= this.startDate) {
    throw new Error('Szezon végdátuma után kell legyen a kezdeti dátumnak');
  }

  // Mérkőzések ellenőrzése
  if (this.matchesPlayed > this.totalMatches) {
    throw new Error('Lejátszott mérkőzések nem lehetnek több, mint az összes');
  }

  next();
});

playerGameStatSchema.pre('save', async function(next) {
  // Percek ellenőrzés
  if (this.minutesPlayed < 0 || this.minutesPlayed > 120) {
    throw new Error('Lejátszott percek 0-120 között kell legyen');
  }

  // Statisztikák ellenőrzése
  if (this.goals < 0 || this.assists < 0) {
    throw new Error('Gólok és asszisztok nem lehetnek negatívak');
  }

  // Lapok ellenőrzése
  if (this.yellowCards > 2) {
    throw new Error('Maximum 2 sárga lap lehet egy mérkőzésben');
  }

  if (this.redCards > 1) {
    throw new Error('Maximum 1 piros lap lehet egy mérkőzésben');
  }

  // Ha piros lap, automatikus sárga lap törlése
  if (this.redCards > 0) {
    this.yellowCards = 0;
  }

  // Rating ellenőrzés
  if (this.rating < 0 || this.rating > 10) {
    throw new Error('Rating 0-10 között kell legyen');
  }

  // Passz pontosság ellenőrzés
  if (this.passAccuracy < 0 || this.passAccuracy > 100) {
    throw new Error('Passz pontosság 0-100 között kell legyen');
  }

  next();
});

// Error handling middleware (Express)
app.use((error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validációs hiba',
      details: Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }))
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      error: `${field} már létezik az adatbázisban`
    });
  }

  res.status(500).json({ error: error.message });
});

