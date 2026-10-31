import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { DocumentAuthenticationError, requireDocumentActor } from '@/lib/document-access';

const ALLOWED_FILE_TYPES = ['text/plain', 'application/pdf', 'text/markdown'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    requireDocumentActor((await auth0.getSession())?.user);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof DocumentAuthenticationError ? 'Authentication required.' : 'Unable to authenticate upload.' },
      { status: error instanceof DocumentAuthenticationError ? 401 : 500 },
    );
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message: `Invalid file type. Allowed types are: ${ALLOWED_FILE_TYPES.join(', ')}. Received: ${file.type}`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ message: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` }, { status: 400 });
    }

    // Read file content
    const [content, buffer] = await extractFileContent(file);

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ message: 'File is empty or has only images.' }, { status: 400 });
    }

    const { createDocument } = await import('@/lib/actions/documents');
    const result = await createDocument(
      {
        content: buffer!,
        fileName: file.name,
        fileType: file.type,
        sharedWith: [],
        workspaceId: null,
      },
      content,
    );

    if (result) {
      return NextResponse.json(
        {
          message: 'Document successfully uploaded and embedded.',
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json({ message: 'Failed to process upload.', error: result }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ message: 'Failed to process upload.' }, { status: 500 });
  }
}

const extractFileContent = async (file: File): Promise<[string | null, Buffer | null]> => {
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);
  if (file.type === 'application/pdf') {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer, isEvalSupported: false, disableAutoFetch: true });
    try {
      const data = await parser.getText();
      return [data.text, buffer];
    } finally {
      await parser.destroy();
    }
  } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
    return [buffer.toString('utf-8'), buffer];
  }
  // For other types or if extraction isn't applicable/fails for some reason
  return [null, null];
};
