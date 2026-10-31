import { buildOpenFgaClient } from '@auth0/ai';
import { ClientWriteRequestOnDuplicateWrites, ClientWriteRequestOnMissingDeletes } from '@openfga/sdk';

export const fgaClient = buildOpenFgaClient();

export const addRelation = async (userEmail: string, documentId: string, relation = 'owner') =>
  fgaClient.write({
    writes: [{ user: `user:${userEmail}`, relation, object: `doc:${documentId}` }],
  }, { conflict: { onDuplicateWrites: ClientWriteRequestOnDuplicateWrites.Ignore } });

export const deleteRelation = async (userEmail: string, documentId: string, relation = 'owner') =>
  fgaClient.write({
    deletes: [{ user: `user:${userEmail}`, relation, object: `doc:${documentId}` }],
  }, { conflict: { onMissingDeletes: ClientWriteRequestOnMissingDeletes.Ignore } });
