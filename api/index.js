const { Pool } = require('pg');

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.POSTGRES_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: 1
    })
  : null;

function jsonResponse(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data, null, 2));
}

function getAction(req) {
  if (req.query && req.query.action) return req.query.action;
  const url = new URL(req.url || '/', 'http://localhost');
  return url.searchParams.get('action') || '';
}

function getQueryParam(req, key) {
  if (req.query && req.query[key] !== undefined) return req.query[key];
  const url = new URL(req.url || '/', 'http://localhost');
  return url.searchParams.get(key);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  const raw =
    typeof req.body === 'string'
      ? req.body
      : await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', chunk => {
            data += chunk;
          });
          req.on('end', () => resolve(data));
          req.on('error', reject);
        });

  if (!raw) return {};

  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/json')) return JSON.parse(raw);
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw));
  }

  return {};
}

function cleanText(value) {
  return String(value ?? '').trim();
}

function nullableInteger(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function money(value) {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function requirePool(res) {
  if (pool) return true;

  jsonResponse(
    res,
    {
      success: false,
      message: 'DATABASE_URL ou POSTGRES_URL manquant. Ajoute la variable dans Vercel.'
    },
    500
  );
  return false;
}

module.exports = async function handler(req, res) {
  if (!requirePool(res)) return;

  const action = getAction(req);

  try {
    if (req.method === 'GET' && action === 'generations') {
      const { rows } = await pool.query(
        'SELECT id_generation, nom_generation, description FROM generation ORDER BY id_generation ASC'
      );
      return jsonResponse(res, { success: true, data: rows });
    }

    if (req.method === 'GET' && action === 'series') {
      const { rows } = await pool.query(
        'SELECT id_serie, nom_serie, date_sortie, nb_cartes, id_generation FROM serie ORDER BY date_sortie ASC, nom_serie ASC'
      );
      return jsonResponse(res, { success: true, data: rows });
    }

    if (req.method === 'GET' && action === 'boosters') {
      const { rows } = await pool.query(
        'SELECT id_booster, nom_booster, image_booster, id_generation FROM booster ORDER BY nom_booster ASC'
      );
      return jsonResponse(res, { success: true, data: rows });
    }

    if (req.method === 'GET' && action === 'raretes') {
      const { rows } = await pool.query(
        'SELECT id_rarete, nom_rarete FROM rarete ORDER BY id_rarete ASC'
      );
      return jsonResponse(res, { success: true, data: rows });
    }

    if (req.method === 'GET' && action === 'cartes') {
      const idGeneration = Number.parseInt(getQueryParam(req, 'generation') || '0', 10);
      const params = [];
      const where = idGeneration > 0 ? 'WHERE s.id_generation = $1' : '';
      if (idGeneration > 0) params.push(idGeneration);

      const { rows } = await pool.query(
        `
          SELECT
            c.id_carte,
            c.id_pokemon,
            c.numero_carte,
            c.nom_carte,
            c.valeur_carte,
            c.pv,
            c.generation,
            c.type,
            c.talent,
            c.illustration,
            c.id_serie,
            c.id_booster,
            c.id_rarete,
            s.nom_serie,
            g.id_generation,
            g.nom_generation,
            b.nom_booster,
            r.nom_rarete
          FROM tbl_carte c
          LEFT JOIN serie s ON c.id_serie = s.id_serie
          LEFT JOIN generation g ON s.id_generation = g.id_generation
          LEFT JOIN booster b ON c.id_booster = b.id_booster
          LEFT JOIN rarete r ON c.id_rarete = r.id_rarete
          ${where}
          ORDER BY g.id_generation ASC, s.nom_serie ASC, c.nom_carte ASC
        `,
        params
      );
      return jsonResponse(res, { success: true, data: rows });
    }

    if (req.method === 'GET' && action === 'carte') {
      const idCarte = Number.parseInt(getQueryParam(req, 'id') || '0', 10);
      if (idCarte <= 0) {
        return jsonResponse(res, { success: false, message: 'Carte introuvable.' }, 400);
      }

      const { rows } = await pool.query(
        `
          SELECT
            c.*,
            s.nom_serie,
            g.id_generation,
            g.nom_generation,
            b.nom_booster,
            r.nom_rarete
          FROM tbl_carte c
          LEFT JOIN serie s ON c.id_serie = s.id_serie
          LEFT JOIN generation g ON s.id_generation = g.id_generation
          LEFT JOIN booster b ON c.id_booster = b.id_booster
          LEFT JOIN rarete r ON c.id_rarete = r.id_rarete
          WHERE c.id_carte = $1
        `,
        [idCarte]
      );

      if (!rows[0]) {
        return jsonResponse(res, { success: false, message: 'Carte introuvable.' }, 404);
      }

      return jsonResponse(res, { success: true, data: rows[0] });
    }

    if (req.method === 'POST' && action === 'ajouter_carte') {
      const body = await readBody(req);
      const values = normalizeCardPayload(body);
      const validationError = validateCard(values);
      if (validationError) {
        return jsonResponse(res, { success: false, message: validationError }, 400);
      }

      const { rows } = await pool.query(
        `
          INSERT INTO tbl_carte
            (id_pokemon, numero_carte, valeur_carte, pv, nom_carte, generation, type, talent, illustration, id_serie, id_booster, id_rarete)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id_carte
        `,
        [
          values.id_pokemon,
          values.numero_carte,
          values.valeur_carte,
          values.pv,
          values.nom_carte,
          values.generation,
          values.type,
          values.talent,
          values.illustration,
          values.id_serie,
          values.id_booster,
          values.id_rarete
        ]
      );

      return jsonResponse(res, {
        success: true,
        message: 'Carte ajoutee avec succes!',
        id_carte: rows[0].id_carte
      });
    }

    if (req.method === 'POST' && action === 'modifier_carte') {
      const body = await readBody(req);
      const idCarte = Number.parseInt(body.id_carte || '0', 10);
      const values = normalizeCardPayload(body);
      const validationError = validateCard(values);

      if (idCarte <= 0) {
        return jsonResponse(res, { success: false, message: 'Carte introuvable.' }, 400);
      }
      if (validationError) {
        return jsonResponse(res, { success: false, message: validationError }, 400);
      }

      const { rowCount } = await pool.query(
        `
          UPDATE tbl_carte
          SET
            id_pokemon = $1,
            numero_carte = $2,
            valeur_carte = $3,
            pv = $4,
            nom_carte = $5,
            generation = $6,
            type = $7,
            talent = $8,
            illustration = $9,
            id_serie = $10,
            id_booster = $11,
            id_rarete = $12
          WHERE id_carte = $13
        `,
        [
          values.id_pokemon,
          values.numero_carte,
          values.valeur_carte,
          values.pv,
          values.nom_carte,
          values.generation,
          values.type,
          values.talent,
          values.illustration,
          values.id_serie,
          values.id_booster,
          values.id_rarete,
          idCarte
        ]
      );

      if (rowCount === 0) {
        return jsonResponse(res, { success: false, message: 'Carte introuvable.' }, 404);
      }

      return jsonResponse(res, { success: true, message: 'Carte modifiee avec succes!' });
    }

    if (req.method === 'POST' && action === 'supprimer_carte') {
      const body = await readBody(req);
      const idCarte = Number.parseInt(body.id_carte || '0', 10);
      if (idCarte <= 0) {
        return jsonResponse(res, { success: false, message: 'Carte introuvable.' }, 400);
      }

      const { rowCount } = await pool.query('DELETE FROM tbl_carte WHERE id_carte = $1', [idCarte]);
      if (rowCount === 0) {
        return jsonResponse(res, { success: false, message: 'Carte introuvable.' }, 404);
      }

      return jsonResponse(res, { success: true, message: 'Carte supprimee avec succes!' });
    }

    return jsonResponse(res, { success: false, message: 'Action API inconnue.' }, 400);
  } catch (error) {
    return jsonResponse(
      res,
      { success: false, message: 'Erreur serveur.', details: error.message },
      500
    );
  }
};

function normalizeCardPayload(body) {
  const nomCarte = cleanText(body.nom_carte);
  const illustration = cleanText(body.illustration);

  return {
    nom_carte: nomCarte,
    id_pokemon: cleanText(body.id_pokemon),
    numero_carte: cleanText(body.numero_carte),
    valeur_carte: money(body.valeur_carte),
    pv: nullableInteger(body.pv),
    generation: cleanText(body.generation),
    type: cleanText(body.type),
    talent: cleanText(body.talent),
    illustration:
      illustration ||
      `https://img.pokemondb.net/artwork/large/${nomCarte.toLowerCase().replaceAll(' ', '-')}.jpg`,
    id_serie: nullableInteger(body.id_serie),
    id_booster: nullableInteger(body.id_booster),
    id_rarete: nullableInteger(body.id_rarete)
  };
}

function validateCard(values) {
  if (
    !values.nom_carte ||
    !values.id_pokemon ||
    !values.numero_carte ||
    !values.id_serie ||
    !values.id_booster ||
    !values.id_rarete
  ) {
    return 'Remplis les champs obligatoires.';
  }

  return '';
}
