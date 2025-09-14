import { NextRequest, NextResponse } from 'next/server';
import {
  upstreamFetch,
  forwardRequestHeaders,
  forwardResponseHeaders,
} from '@/lib/shared/http/server';

async function readBodyBuffer(
  request: NextRequest,
): Promise<ArrayBuffer | null> {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD') return null;
  try {
    return await request.arrayBuffer();
  } catch {
    return null;
  }
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
  try {
    const path = params.path.join('/');
    const bodyBuffer = await readBodyBuffer(request);
    const requestHeaders = forwardRequestHeaders(request);
    const isSSE = (request.headers.get('accept') || '').includes(
      'text/event-stream',
    );
    const upstreamResponse = await upstreamFetch(path, {
      method: request.method,
      headers: requestHeaders,
      bodyBuffer,
      query: request.nextUrl.searchParams,
      timeoutMs: isSSE ? 0 : undefined,
    });

    const responseHeaders = forwardResponseHeaders(upstreamResponse);
    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Upstream request failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
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
