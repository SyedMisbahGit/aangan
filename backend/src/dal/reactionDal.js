import { BaseDal } from './baseDal.js';

export class ReactionDal extends BaseDal {
  constructor(db) {
    super('reaction', { defaultTtl: 300, cacheEnabled: true });
    this.db = db;
  }

  async addReaction(whisperId, guestId, emoji) {
    const reaction = {
      whisper_id: whisperId,
      guest_id: guestId,
      emoji,
      created_at: new Date().toISOString()
    };

    // Remove any existing reaction from this guest
    await this.db('whisper_reactions')
      .where({ whisper_id: whisperId, guest_id: guestId })
      .delete();

    // Add new reaction
    await this.db('whisper_reactions').insert(reaction);
    
    // Invalidate relevant caches
    await this._invalidateCaches(whisperId, guestId);
    return reaction;
  }

  async removeReaction(whisperId, guestId) {
    const result = await this.db('whisper_reactions')
      .where({ whisper_id: whisperId, guest_id: guestId })
      .delete();
      
    if (result > 0) {
      await this._invalidateCaches(whisperId, guestId);
    }
    
    return result > 0;
  }

  async getReactions(whisperId) {
    return this.cachedQuery({
      key: `whisper:${whisperId}:reactions`,
      queryFn: () => 
        this.db('whisper_reactions')
          .where({ whisper_id: whisperId })
          .select('emoji', 'guest_id', 'created_at')
    });
  }

  async getReactionStats(whisperId) {
    return this.cachedQuery({
      key: `whisper:${whisperId}:reaction_stats`,
      queryFn: () =>
        this.db('whisper_reactions')
          .where({ whisper_id: whisperId })
          .groupBy('emoji')
          .select('emoji')
          .count('* as count')
    });
  }

  async hasReacted(whisperId, guestId) {
    return this.cachedQuery({
      key: `whisper:${whisperId}:guest:${guestId}:reacted`,
      queryFn: async () => {
        const reaction = await this.db('whisper_reactions')
          .where({ whisper_id: whisperId, guest_id: guestId })
          .first();
        return !!reaction;
      }
    });
  }

  async getGuestReactions(guestId) {
    return this.cachedQuery({
      key: `guest:${guestId}:reactions`,
      queryFn: () =>
        this.db('whisper_reactions')
          .where({ guest_id: guestId })
          .select('whisper_id', 'emoji', 'created_at')
    });
  }

  // Private methods for cache invalidation
  async _invalidateCaches(whisperId, guestId) {
    await Promise.all([
      this._invalidateCache(`whisper:${whisperId}:reactions`),
      this._invalidateCache(`whisper:${whisperId}:reaction_stats`),
      this._invalidateCache(`whisper:${whisperId}:guest:${guestId}:reacted`),
      this._invalidateCache(`guest:${guestId}:reactions`)
    ]);
  }
}

// Export a singleton instance
let instance = null;

export function initReactionDal(db) {
  if (!instance) {
    instance = new ReactionDal(db);
  }
  return instance;
}

export function getReactionDal() {
  if (!instance) {
    throw new Error('ReactionDal has not been initialized. Call initReactionDal first.');
  }
  return instance;
}
