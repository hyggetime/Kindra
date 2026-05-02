# Kindra · Supabase (Next.js App Router)

`src/` 는 기존 Vite UI 참고용으로 유지하고, **실제 Supabase 접속·변경은 `app/` + `lib/supabase/`** 에서만 진행하는 것을 권장합니다.

## 레이어링

| 모듈 | 용도 |
|------|------|
| `lib/supabase/client.ts` | 브라우저 전용. `NEXT_PUBLIC_*` + **anon** 키만. RLS 하에서 읽기·로그인 UI 등. |
| `lib/supabase/server.ts` | 서버 전용(`server-only`). 쿠키 기반 세션. **RSC / Server Action / Route Handler**. |
| `lib/supabase/admin.ts` | 서버 전용. **service_role** — RLS 우회. 정말 필요할 때만, 최소 범위로. |
| `lib/supabase/middleware.ts` | Edge 미들웨어에서 세션 쿠키 갱신. |

## 보안 원칙 (요약)

1. **비밀은 서버에만**  
   `SUPABASE_SERVICE_ROLE_KEY` 는 Server Action·Route Handler·서버 전용 모듈에서만 `process.env` 로 읽습니다.  
   `NEXT_PUBLIC_` 접두사를 **절대** 붙이지 마세요.

2. **기본은 세션 + RLS**  
   로그인 사용자라면 `createServerSupabaseClient()` 만으로 `insert`/`update` 가 가능해야 이상적입니다.  
   RLS 정책으로 `auth.uid()` 와 행 소유자를 맞추세요.

3. **service_role 은 예외**  
   비로그인 인테이크·배치 작업 등 RLS 로 표현이 어려울 때만 `createServiceRoleClient()` 를 쓰고,  
   **입력 검증·속도 제한·남용 방지**를 같은 Server Action 안에서 강하게 적용하세요.

4. **클라이언트에서 직접 DB 스키마 전체에 쓰기**  
   anon 키만으로 위험한 쓰기가 열리지 않도록 RLS 를 전제로 설계하세요.

## Server Action 패턴 (권장)

1. **폼 또는 버튼**은 Client Component (`'use client'`)에서 `useActionState` / `form action` 으로 제출합니다.
2. **`'use server'`** 함수(예: `app/actions/intake-submit.ts`)에서만:
   - `createServerSupabaseClient()` 로 세션 사용자 확인
   - 필드 검증 (길이·형식·허용 문자 등)
   - `supabase.from('…').insert(…)` 등
3. **민감한 비즈니스 규칙**은 클라이언트가 아니라 이 Server Action 안에 둡니다.  
   (클라이언트 검증은 UX 용이며, 서버 검증이 최종 방어선입니다.)

### 스토리지(그림 업로드)

- **권장:** Server Action에서 `createSignedUploadUrl` 또는 서버 측 업로드 경로만 허용하고,  
  클라이언트는 받은 URL 로만 PUT 합니다.
- **비권장:** service_role 키를 프론트 번들에 포함하거나, 검증 없이 전체 버킷에 쓰기 허용.

## 예시 코드 위치

- Server Action: `app/actions/intake-submit.ts`
- 폼 UI: `app/apply/ApplyIntegratedForm.tsx`
- 미들웨어: 루트 `middleware.ts` + `lib/supabase/middleware.ts`

## Vite `import.meta.env` → Next

| Vite | Next (서버/클라이언트 구분 유지) |
|------|-----------------------------------|
| `import.meta.env.VITE_SUPABASE_URL` | `process.env.NEXT_PUBLIC_SUPABASE_URL` (공개) |
| `import.meta.env.VITE_SUPABASE_ANON_KEY` | `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` (공개) |
| 서버 전용 시크릿 | `process.env.SUPABASE_SERVICE_ROLE_KEY` (접두사 없음) |

`.env.local` 은 Git 에 올리지 마세요. 팀 공유용 값은 `.env.example` 만 갱신합니다.
