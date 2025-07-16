const aiReplyJobQueue = require('./aiReplyJobQueue');

jest.mock('./db');
jest.mock('node-fetch');
const db = require('./db');
const fetch = require('node-fetch');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AI Reply Job Queue', () => {
  it('should enqueue a job', async () => {
    db.schema = { hasTable: jest.fn().mockResolvedValue(true) };
    db.mockImplementation(() => ({ insert: jest.fn().mockResolvedValue() }));
    await aiReplyJobQueue.enqueueJob({ whisperId: 'w1', zone: 'tapri', emotion: 'joy', delayMs: 1000 });
    // No error means pass
  });

  it('should process a successful job', async () => {
    db.schema = { hasTable: jest.fn().mockResolvedValue(true) };
    db.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue(),
      first: jest.fn().mockResolvedValue(),
    }));
    fetch.mockResolvedValue({ ok: true, json: async () => ({ content: 'AI reply' }) });
    await aiReplyJobQueue.processDueJobs();
    // No error means pass
  });

  it('should retry a failed job up to 3 times', async () => {
    db.schema = { hasTable: jest.fn().mockResolvedValue(true) };
    let retryCount = 0;
    db.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { id: 1, whisper_id: 'w1', zone: 'tapri', emotion: 'joy', run_at: Date.now(), status: 'pending', retry_count: retryCount };
        }
      }),
      update: jest.fn().mockImplementation(({ retry_count }) => { retryCount = retry_count; }),
      first: jest.fn().mockResolvedValue(),
    }));
    fetch.mockResolvedValue({ ok: false, text: async () => 'API error' });
    await aiReplyJobQueue.processDueJobs();
    expect(retryCount).toBeGreaterThan(0);
  });
}); 