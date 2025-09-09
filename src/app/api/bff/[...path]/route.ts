import { NextRequest, NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/http/server/upstream';
import { forwardRequestHeaders, forwardResponseHeaders } from '@/lib/http/server/headers';

async function readBodyBuffer(
  request: NextRequest,
): Promise<ArrayBuffer | null> {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD') return null;
  return await request.arrayBuffer();
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
  const path = params.path.join('/');
  const bodyBuffer = await readBodyBuffer(request);
  const requestHeaders = forwardRequestHeaders(request);
  const isSSE = (request.headers.get('accept') || '').includes('text/event-stream');
  const upstreamResponse = await upstreamFetch(path, {
    method: request.method,
    headers: requestHeaders,
    bodyBuffer,
    query: request.nextUrl.searchParams,
    // Disable timeout for server-sent events or long-lived streams
    timeoutMs: isSSE ? 0 : undefined,
  });

  const responseHeaders = forwardResponseHeaders(upstreamResponse);
  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, { path });
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, { path });
}
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, { path });
}
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, { path });
}
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, { path });
}
