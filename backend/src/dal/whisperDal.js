import { BaseDal } from './baseDal.js';
import { v4 as uuidv4 } from 'uuid';

export class WhisperDal extends BaseDal {
  constructor(db) {
    super('whisper', { defaultTtl: 600, cacheEnabled: true });
    this.db = db;
  }

  async create(whisperData) {
    const whisper = {
      id: uuidv4(),
      content: whisperData.content,
      emotion: whisperData.emotion || null,
      zone: whisperData.zone || 'general',
      is_ai_generated: whisperData.is_ai_generated || false,
      expires_at: whisperData.expires_at || null,
      created_at: new Date().toISOString()
    };

    await this.db('whispers').insert(whisper);
    await this._invalidateCaches(whisper);
    return whisper;
  }

  async getById(id, { forceRefresh = false } = {}) {
    return this.cachedQuery({
      key: `id:${id}`,
      queryFn: () => this.db('whispers').where({ id }).first(),
      forceRefresh
    });
  }

  async getByZone(zone, { limit = 50, offset = 0, emotion = null } = {}) {
    return this.cachedQuery({
      key: `zone:${zone}:${emotion || 'all'}:${limit}:${offset}`,
      queryFn: async () => {
        let query = this.db('whispers')
          .where({ zone })
          .orderBy('created_at', 'desc')
          .limit(limit)
          .offset(offset);

        if (emotion) query = query.where({ emotion });
        return this._filterActive(query);
      }
    });
  }

  async getRecent({ limit = 50, offset = 0, zone = null, emotion = null } = {}) {
    return this.cachedQuery({
      key: `recent:${zone || 'all'}:${emotion || 'all'}:${limit}:${offset}`,
      queryFn: async () => {
        let query = this.db('whispers').orderBy('created_at', 'desc');
        if (zone) query = query.where({ zone });
        if (emotion) query = query.where({ emotion });
        return this._filterActive(query).limit(limit).offset(offset);
      }
    });
  }

  async deleteById(id) {
    const whisper = await this.getById(id);
    if (!whisper) return false;
    
    await this.db('whispers').where({ id }).delete();
    await this._invalidateCaches(whisper);
    return true;
  }

  // Private helper methods
  async _invalidateCaches(whisper) {
    await Promise.all([
      this._invalidateCache(`id:${whisper.id}`),
      this._invalidateCache(`zone:${whisper.zone}:*`),
      this._invalidateCache('recent:*'),
      this._invalidateCache('stats:*')
    ]);
  }

  _filterActive(query) {
    const now = new Date().toISOString();
    return query.where(function() {
      this.where('expires_at', '>', now).orWhereNull('expires_at');
    });
  }
}
