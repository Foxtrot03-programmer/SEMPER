const SUPABASE_URL = 'https://ulxuoczpzsqhjsbegdve.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseHVvY3pwenNxaGpzYmVnZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA4MDIsImV4cCI6MjA4OTY4NjgwMn0.dWg0JKXD-3aP4JWJCYOAp9XpPYnyRK4aj3lgA3hr2c8';

const SUPABASE_TABLE = 'Maombi';

const db = {
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

  async selectAll() {
    try {
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
};
