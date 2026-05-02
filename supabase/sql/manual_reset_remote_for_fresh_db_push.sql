-- =============================================================================
-- 기존 Supabase(원격) — Kindra 스키마·데이터·CLI 마이그레이션 기록 초기화
--
-- 목적: 이후 로컬에서 `supabase link` + `supabase db push` 로
--       `supabase/migrations/` 전체를 **처음부터 다시** 적용하고 싶을 때.
--
-- 실행: Supabase Dashboard → SQL Editor → 한 블록씩 또는 전체 실행
-- 권한: 일반적으로 대시보드 SQL은 postgres 역할이라 동작합니다.
--
-- 주의:
--   - 이 프로젝트에 Kindra 외에 **직접 만든 다른 테이블**이 public 에 있다면
--     아래 DROP 이 건드리지 않습니다(Kindra 관련만).
--   - 원격에 `supabase_migrations.schema_migrations` 가 있고, **db push 이력까지
--     비우고** 마이그레이션을 처음부터 다시 돌리려면 Supabase CLI
--     `supabase migration repair` 등을 문서대로 사용하세요. (대시보드 SQL로
--     그 테이블을 지우는 건 프로젝트마다 제한·경로가 달라 이 파일에서는 다루지 않습니다.)
--   - **한 번도 `db push` 안 한 프로젝트**면 이력 테이블이 없을 수 있음 → 아래 DROP 만으로 충분한 경우가 많습니다.
-- =============================================================================

-- ─── 1) 스토리지 (SQL 로 직접 삭제 불가 — Supabase 가 storage 테이블 보호) ─
-- Dashboard → Storage → 버킷 `intake-drawings` 열기 → 파일 전부 선택 후 삭제.
-- (버킷 자체를 지워도 되고, 남겨 두어도 아래 `db push` 가 on conflict 로 버킷 정의를 맞춥니다.)
-- 로컬에 Supabase CLI + 서비스 롤 키가 있으면 예시:
--   supabase storage rm ss://<project-ref>/intake-drawings --recursive
--   (프로젝트·CLI 문서에 맞게 경로 확인)
--
-- 스토리지를 비우지 않아도 DB 리셋·재신청은 가능합니다. 다만 예전 업로드 파일이
-- 버킷 안에 고아로 남을 수 있습니다(디스크·요금 정리용으로만 수동 삭제).

-- ─── 2) public 테이블·의존 객체 (RLS·정책은 CASCADE 로 같이 제거) ───────────
drop table if exists public.kindra_intakes cascade;
drop table if exists public.kindra_reports cascade;
drop table if exists public.feature_flags cascade;

drop function if exists public.kindra_auth_user_email_exists(text);

-- ─── 3) 확인(선택) ─────────────────────────────────────────────────────────
-- select tablename from pg_tables where schemaname = 'public' and tablename like 'kindra%';
