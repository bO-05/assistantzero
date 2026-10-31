import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/actions/documents', () => ({
  deleteDocument: vi.fn(), getDocumentContent: vi.fn(), shareDocument: vi.fn(),
}));
import DocumentItemActions from '@/components/document-item-actions';

const doc = {
  id: 'fixture-document', fileName: 'fictional.txt', fileType: 'text/plain',
  createdAt: new Date('2025-01-01T00:00:00Z'), updatedAt: new Date('2025-01-01T00:00:00Z'),
  userId: 'auth0|fixture-owner', userEmail: 'owner@example.invalid',
  sharedWith: ['viewer@example.invalid'], workspaceId: null,
};
describe('document action affordances', () => {
  it('shows only download to a read-only viewer', () => {
    const html = renderToStaticMarkup(createElement(DocumentItemActions, {
      doc, canManage: false, onActionComplete: () => {},
    }));
    expect(html).toContain('Download');
    expect(html).not.toContain('>Share<');
    expect(html).not.toContain('>Delete<');
  });
  it('retains owner share and delete controls', () => {
    const html = renderToStaticMarkup(createElement(DocumentItemActions, {
      doc, canManage: true, onActionComplete: () => {},
    }));
    expect(html).toContain('>Share<');
    expect(html).toContain('>Delete<');
  });
});
