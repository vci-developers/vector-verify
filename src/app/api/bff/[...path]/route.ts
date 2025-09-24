import { NextRequest, NextResponse } from 'next/server';
import {
  upstreamFetch,
  forwardRequestHeaders,
  forwardResponseHeaders,
} from '@/lib/shared/http/server';
import {
  HTTP_STATUS,
  MEDIA_TYPE,
  parseApiErrorResponse,
} from '@/lib/shared/http/core';
import type { AnnotationTasksListResponseDto } from '@/lib/entities/annotation';

async function handleGetTaskYears(): Promise<NextResponse> {
  // Aggregate distinct years from all tasks' createdAt/updatedAt fields
  const years = new Set<number>();

  let page = 1;
  const limit = 50; // use conservative batch size to satisfy upstream limits
  // Loop pages until hasMore is false
  // If upstream doesn't support pagination this still works for the first page
  // and will exit when hasMore is falsy/undefined
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await upstreamFetch('annotations/task', {
      method: 'GET',
      query: { page, limit },
    });

    if (!res.ok) {
      const error = await parseApiErrorResponse(res);
      const headers = forwardResponseHeaders(res);
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

    const data = (await res.json()) as AnnotationTasksListResponseDto;
    for (const task of data.tasks ?? []) {
      if (typeof task.createdAt === 'number') {
        years.add(new Date(task.createdAt).getFullYear());
      }
      if (typeof task.updatedAt === 'number') {
        years.add(new Date(task.updatedAt).getFullYear());
      }
    }

    const hasMore = Boolean((data as any).hasMore);
    if (!hasMore) break;
    page += 1;
  }

  const list = Array.from(years).sort((a, b) => b - a);
  return NextResponse.json(list, { status: HTTP_STATUS.OK });
}

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
    // Custom BFF endpoint: aggregate years for tasks
    if (
      request.method.toUpperCase() === 'GET' &&
      path === 'annotations/task/years'
    ) {
      return handleGetTaskYears();
    }
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
