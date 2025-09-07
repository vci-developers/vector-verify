import { NextRequest, NextResponse } from 'next/server';
import {
  upstreamFetch,
  forwardRequestHeaders,
  forwardResponseHeaders,
} from '@/lib/http/upstream';

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

  const upstreamResponse = await upstreamFetch(path, {
    method: request.method,
    headers: requestHeaders,
    bodyBuffer,
    query: request.nextUrl.searchParams,
  });

  const responseHeaders = forwardResponseHeaders(upstreamResponse);
  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return handleProxy(request, context.params);
}
export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return handleProxy(request, context.params);
}
export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return handleProxy(request, context.params);
}
export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return handleProxy(request, context.params);
}
export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return handleProxy(request, context.params);
}
