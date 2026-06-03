import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, {
    status,
  });
}

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { success: false, error: message, code } satisfies ApiResponse<never>,
    { status },
  );
}
