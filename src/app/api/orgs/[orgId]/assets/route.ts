import { NextRequest, NextResponse } from "next/server";
import * as assetsService from "@/lib/services/assets.service";
import { createAssetSchema } from "@/lib/validations/assets";

type RouteParams = { params: Promise<{ orgId: string }> };

// ✅ GET - 자산 목록 가져오기
export async function GET(req: NextRequest, { params }: RouteParams) {
  // 1. URL에서 조직 ID 꺼내기
  const { orgId } = await params;

  // 2. DB에서 자산 목록 조회
  const items = await assetsService.listAssets(orgId);

  // 3. 결과 반환
  return NextResponse.json({ data: items });
}

// ✅ POST - 새 자산 만들기
export async function POST(req: NextRequest, { params }: RouteParams) {
  // 1. URL에서 조직 ID 꺼내기
  const { orgId } = await params;

  // 2. 요청 본문(JSON) 읽기
  const body = await req.json();

  // 3. 입력값 형식 검사
  const parsed = createAssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 잘못됐습니다", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 4. DB에 저장
  const created = await assetsService.createAsset(orgId, parsed.data);

  // 5. 생성된 자산 반환
  return NextResponse.json({ data: created }, { status: 201 });
}