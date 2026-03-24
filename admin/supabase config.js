

/*
  URL ya project yako ya Supabase
  Hii ni "anwani" ya database yako mtandaoni
*/
const SUPABASE_URL = 'https://ulxuoczpzsqhjsbegdve.supabase.co';

/*
  API Key ya umma (anon key)
  Hii ni "funguo" ya kufikia database
  SALAMA kushiriki - inaweza kusomwa na browser
  USITUMIE service_role key hapa kamwe!
*/
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseHVvY3pwenNxaGpzYmVnZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA4MDIsImV4cCI6MjA4OTY4NjgwMn0.dWg0JKXD-3aP4JWJCYOAp9XpPYnyRK4aj3lgA3hr2c8';

/*
  Jina la table yetu kwenye Supabase
  Lazima lifanane KABISA na table uliyounda Supabase
*/
const SUPABASE_TABLE = 'Maombi';

/*
  ================================================================
  SUPABASE CLIENT - Chombo cha kuwasiliana na database
  ================================================================
  Tunatumia fetch() - JavaScript inayowasiliana na internet
  Badala ya library kubwa, tunaandika functions rahisi wenyewe
  Hii inafanya code iwe rahisi kuelewa kwa mwanafunzi
  ================================================================
*/

/*
  db.insert() - Hifadhi rekodi mpya kwenye database
  Parameta: data = object yenye taarifa za ombi
  Inarudisha: { data, error }
*/
const db = {

  /*
    INSERT - Ongeza rekodi mpya
    Inaitwa: await db.insert({ jina: 'Amina', simu: '...' })
  */
  async insert(data) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const err = await response.json();
        return { data: null, error: err };
      }

      const result = await response.json();
      return { data: result, error: null };

    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  /*
    SELECT - Pata rekodi zote kutoka database
    Inaitwa: await db.selectAll()
    Inarudisha: array ya maombi yote
  */
  async selectAll() {
    try {
      // order=created_at.desc = mpya kwanza
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return { data: [], error: err };
      }

      const result = await response.json();
      return { data: result, error: null };

    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  /*
    UPDATE - Badilisha rekodi iliyopo
    Parameta: id = nambari ya rekodi, data = taarifa mpya
    Inaitwa: await db.update(5, { hali: 'Imekamilika' })
  */
  async update(id, data) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return { data: null, error: err };
      }

      const result = await response.json();
      return { data: result, error: null };

    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  /*
    DELETE - Futa rekodi
    Parameta: id = nambari ya rekodi ya kufutwa
    Inaitwa: await db.delete(5)
  */
  async delete(id) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return { error: err };
      }

      return { error: null };

    } catch (error) {
      return { error: error.message };
    }
  }

}; // mwisho wa db object