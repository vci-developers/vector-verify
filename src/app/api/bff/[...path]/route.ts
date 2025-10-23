import { NextRequest, NextResponse } from 'next/server';
import {
  upstreamFetch,
  forwardRequestHeaders,
  forwardResponseHeaders,
} from '@/shared/infra/http/server';
import {
  HTTP_STATUS,
  MEDIA_TYPE,
  parseApiErrorResponse,
} from '@/shared/infra/http/core';

async function readRequestBody(
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
    const body = await readRequestBody(request);
    const requestHeaders = forwardRequestHeaders(request);
    const accept = request.headers.get('accept') ?? '';
    const isSSE = accept.toLowerCase().includes(MEDIA_TYPE.EVENT_STREAM);
    const upstreamResponse = await upstreamFetch(path, {
      method: request.method,
      headers: requestHeaders,
      ...(body !== null ? { body } : {}),
      query: request.nextUrl.searchParams,
      timeoutMs: isSSE ? 0 : undefined,
    });

    if (!upstreamResponse.ok) {
      const error = await parseApiErrorResponse(upstreamResponse);
      const headers = forwardResponseHeaders(upstreamResponse);
      headers.set('content-type', MEDIA_TYPE.JSON);
      return NextResponse.json(
        {
          error: error.message,
          status: error.status,
          details: error.body ?? null,
        },
        { status: error.status, headers },
      );
    }

    const responseHeaders = forwardResponseHeaders(upstreamResponse);
    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Upstream request failed.';
    return NextResponse.json(
      {
        error: message,
        status: HTTP_STATUS.BAD_GATEWAY,
        details: null,
      },
      {
        status: HTTP_STATUS.BAD_GATEWAY,
        headers: {
          'content-type': MEDIA_TYPE.JSON,
        },
      },
    );
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
