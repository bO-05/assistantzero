import { beforeEach, expect, it, vi } from 'vitest';
const h = vi.hoisted(() => ({ write: vi.fn() }));
vi.mock('@auth0/ai', () => ({ buildOpenFgaClient: () => ({ write: h.write }) }));
import { addRelation, deleteRelation } from '@/lib/fga/fga';
beforeEach(() => h.write.mockReset().mockResolvedValue({}));
it('requests idempotent grants without swallowing transport errors', async () => {
  await addRelation('reader@example.invalid', 'fixture-doc', 'viewer');
  expect(h.write).toHaveBeenCalledWith({
    writes: [{ user: 'user:reader@example.invalid', object: 'doc:fixture-doc', relation: 'viewer' }],
  }, { conflict: { onDuplicateWrites: 'ignore' } });
  h.write.mockRejectedValueOnce(new Error('offline transport failure'));
  await expect(addRelation('reader@example.invalid', 'fixture-doc')).rejects.toThrow('offline transport failure');
});
it('requests idempotent cleanup for missing legacy tuples', async () => {
  await deleteRelation('owner@example.invalid', 'fixture-doc');
  expect(h.write).toHaveBeenCalledWith({
    deletes: [{ user: 'user:owner@example.invalid', object: 'doc:fixture-doc', relation: 'owner' }],
  }, { conflict: { onMissingDeletes: 'ignore' } });
});
