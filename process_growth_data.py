#!/usr/bin/env python3
"""
국민건강보험공단 영유아 성장도표 CSV → 킨드라용 growth_stats.json

공공데이터포털 배포 파일(20240731 기준):
  - 국민건강보험공단_영유아성장도표백분위수기준_*.csv
      백분위(1~99)별 Z점수 구간(참고용, 선택).
  - 국민건강보험공단_영유아성장도표LMS기준_*.csv  ← 키/몸무게 곡선 생성에 **필수**
      영유아성장종류코드: 01=몸무게, 02=키, 03=머리둘레, 04=BMI
      성별코드: 1=남아, 2=여아
      영유아성장도표시작월/종료월, 영유아성장도표L값·M값·S값

LMS(Cole) 공식으로 표준정규 Z에 해당하는 측정값 X를 계산합니다.
  |L| < 1e-12 이면  L=0 취급: X = M * exp(S * Z)
  그 외: X = M * (1 + L * S * Z) ** (1 / L)

사용 예:
  python process_growth_data.py "C:\\path\\to\\folder_with_csv" -o growth_stats.json

입력이 단일 CSV 파일이면 그 파일이 있는 폴더에서 형제 CSV(LMS)를 함께 읽습니다.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from statistics import NormalDist
from typing import Any, Iterable


PERCENTILES = (5, 25, 50, 75, 95)
TYPE_HEIGHT = "02"
TYPE_WEIGHT = "01"
SEX_MALE = "1"
SEX_FEMALE = "2"


def _strip_bom(s: str) -> str:
    return s.lstrip("\ufeff").strip()


def _to_float(x: str) -> float | None:
    x = _strip_bom(x)
    if x == "" or x.lower() in ("nan", "null", "none", "-"):
        return None
    try:
        return float(x)
    except ValueError:
        return None


def _to_int(x: str) -> int | None:
    f = _to_float(x)
    if f is None:
        return None
    try:
        return int(round(f))
    except (OverflowError, ValueError):
        return None


def _norm_type_code(raw: str) -> str:
    s = _strip_bom(raw)
    if s.isdigit():
        return s.zfill(2)
    return s


def _norm_sex_code(raw: str) -> str:
    s = _strip_bom(raw)
    if s.isdigit():
        return str(int(s))
    return s


def lms_value(l: float, m: float, s: float, z: float) -> float:
    """LMS Box–Cox: Z(표준정규) → 측정값 X."""
    if not (math.isfinite(l) and math.isfinite(m) and math.isfinite(s) and math.isfinite(z)):
        raise ValueError("non-finite LMS or Z")
    if m <= 0 or s <= 0:
        raise ValueError("invalid M/S")

    if abs(l) < 1e-12:
        return m * math.exp(s * z)
    inner = 1.0 + l * s * z
    if inner <= 0:
        raise ValueError(f"1+L*S*Z<=0 (L={l},S={s},Z={z})")
    return m * inner ** (1.0 / l)


def z_for_percentile(p: int) -> float:
    """백분위 p(정수)에 대한 표준정규 Z (하측 확률 p/100)."""
    if p <= 0 or p >= 100:
        raise ValueError("percentile must be 1..99")
    return NormalDist().inv_cdf(p / 100.0)


@dataclass(frozen=True)
class LMSRow:
    type_code: str  # 01 weight, 02 height
    sex_code: str  # 1 male, 2 female
    month_start: int
    month_end: int
    L: float
    M: float
    S: float


def _norm_header(h: str) -> str:
    return _strip_bom(h).replace(" ", "")


def read_csv_text(path: Path) -> str:
    """공공데이터 CSV는 UTF-8 또는 CP949(윈도우 기본)인 경우가 많음."""
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        return raw.decode("utf-8-sig")
    try:
        s = raw.decode("utf-8")
        head = s[:4000]
        if "영유아" in head or "백분위" in head or "성장" in head:
            return s
    except UnicodeDecodeError:
        pass
    return raw.decode("cp949")


def _find_col(headers: list[str], candidates: Iterable[str]) -> int | None:
    norm = [_norm_header(h) for h in headers]
    for cand in candidates:
        c = _norm_header(cand)
        for i, h in enumerate(norm):
            if h == c:
                return i
    return None


def parse_lms_csv(path: Path) -> list[LMSRow]:
    text = read_csv_text(path)
    reader = csv.reader(text.splitlines())
    rows_raw = list(reader)
    if not rows_raw:
        return []
    headers = rows_raw[0]
    idx_type = _find_col(
        headers,
        ("영유아성장종류코드", "성장종류코드", "growth_type_code", "GROWTH_TYPE"),
    )
    idx_sex = _find_col(headers, ("성별코드", "sex_code", "SEX"))
    idx_ms = _find_col(headers, ("영유아성장도표시작월", "시작월", "start_month"))
    idx_me = _find_col(headers, ("영유아성장도표종료월", "종료월", "end_month"))
    idx_l = _find_col(headers, ("영유아성장도표L값", "L값", "L"))
    idx_m = _find_col(headers, ("영유아성장도표M값", "M값", "M"))
    idx_s = _find_col(headers, ("영유아성장도표S값", "S값", "S"))

    if any(x is None for x in (idx_type, idx_sex, idx_ms, idx_me, idx_l, idx_m, idx_s)):
        return []

    out: list[LMSRow] = []
    for parts in rows_raw[1:]:
        if len(parts) <= max(idx_type, idx_sex, idx_ms, idx_me, idx_l, idx_m, idx_s):
            continue
        tc = _norm_type_code(parts[idx_type])
        sc = _norm_sex_code(parts[idx_sex])
        ms = _to_int(parts[idx_ms])
        me = _to_int(parts[idx_me])
        L = _to_float(parts[idx_l])
        M = _to_float(parts[idx_m])
        S = _to_float(parts[idx_s])
        if ms is None or me is None or L is None or M is None or S is None:
            continue
        if tc not in (TYPE_WEIGHT, TYPE_HEIGHT):
            continue
        if sc not in (SEX_MALE, SEX_FEMALE):
            continue
        if me < ms:
            ms, me = me, ms
        out.append(LMSRow(tc, sc, ms, me, L, M, S))
    return out


def lms_rows_to_by_month(rows: list[LMSRow]) -> dict[tuple[str, str], dict[int, LMSRow]]:
    """
    (sex_code, type_code) -> month -> one LMS row.
    구간이 겹치면 나중 행이 덮어씀(원본 CSV가 일반적으로 월 단위 비중첩).
    """
    acc: dict[tuple[str, str], dict[int, LMSRow]] = defaultdict(dict)
    for r in rows:
        key = (r.sex_code, r.type_code)
        for m in range(r.month_start, r.month_end + 1):
            acc[key][m] = r
    return acc


def build_growth_from_lms(
    by_month: dict[tuple[str, str], dict[int, LMSRow]],
) -> tuple[dict[str, Any], dict[str, Any]]:
    male: dict[str, Any] = {}
    female: dict[str, Any] = {}

    z_cache = {p: z_for_percentile(p) for p in PERCENTILES}

    def fill(sex_code: str, bucket: dict[str, Any]) -> None:
        months_h = sorted(by_month.get((sex_code, TYPE_HEIGHT), {}).keys())
        months_w = sorted(by_month.get((sex_code, TYPE_WEIGHT), {}).keys())
        months = sorted(set(months_h) | set(months_w))
        for m in months:
            entry: dict[str, Any] = {}
            if m in by_month[(sex_code, TYPE_HEIGHT)]:
                row = by_month[(sex_code, TYPE_HEIGHT)][m]
                h: dict[str, float] = {}
                for p in PERCENTILES:
                    h[f"p{p}"] = round(lms_value(row.L, row.M, row.S, z_cache[p]), 4)
                entry["height"] = h
            if m in by_month[(sex_code, TYPE_WEIGHT)]:
                row = by_month[(sex_code, TYPE_WEIGHT)][m]
                w: dict[str, float] = {}
                for p in PERCENTILES:
                    w[f"p{p}"] = round(lms_value(row.L, row.M, row.S, z_cache[p]), 4)
                entry["weight"] = w
            if entry:
                bucket[str(m)] = entry

    fill(SEX_MALE, male)
    fill(SEX_FEMALE, female)
    return male, female


def _find_col_substr(headers: list[str], substrs: tuple[str, ...]) -> int | None:
    norm = [_norm_header(h) for h in headers]
    for i, h in enumerate(norm):
        for s in substrs:
            if s in h:
                return i
    return None


def parse_percentile_z_csv(path: Path) -> list[dict[str, float]] | None:
    """백분위수,시작Z,종료Z 표. 컬럼명이 다르면 None."""
    text = read_csv_text(path)
    reader = csv.reader(text.splitlines())
    rows = list(reader)
    if len(rows) < 2:
        return None
    headers = rows[0]
    idx_p = _find_col_substr(headers, ("백분위", "percentile", "PCT"))
    idx_a = _find_col_substr(headers, ("시작Z", "시작", "Z값", "z_start", "lower"))
    idx_b = _find_col_substr(headers, ("종료Z", "종료", "z_end", "upper"))
    # 동일 컬럼에 매칭되는 경우 재탐색
    if idx_p is None or idx_a is None or idx_b is None or len({idx_p, idx_a, idx_b}) < 3:
        norm = [_norm_header(h) for h in headers]
        if len(norm) >= 3 and "백분위" in norm[0]:
            idx_p, idx_a, idx_b = 0, 1, 2
        else:
            return None

    out: list[dict[str, float]] = []
    for parts in rows[1:]:
        if len(parts) <= max(idx_p, idx_a, idx_b):
            continue
        p = _to_int(parts[idx_p])
        a = _to_float(parts[idx_a])
        b = _to_float(parts[idx_b])
        if p is None or a is None or b is None:
            continue
        out.append({"percentile": float(p), "z_start": a, "z_end": b, "z_mid": (a + b) / 2.0})
    return out or None


def discover_csvs(input_path: Path) -> list[Path]:
    if input_path.is_file():
        return sorted({input_path, *input_path.parent.glob("*.csv")}, key=lambda p: p.name)
    if input_path.is_dir():
        return sorted(input_path.glob("*.csv"))
    return []


def main() -> int:
    ap = argparse.ArgumentParser(description="NHIS 영유아 성장 CSV → growth_stats.json")
    ap.add_argument(
        "input_path",
        type=Path,
        help="CSV가 있는 폴더 경로, 또는 CSV 단일 파일 경로",
    )
    ap.add_argument(
        "-o",
        "--out",
        type=Path,
        default=Path("growth_stats.json"),
        help="출력 JSON (기본: ./growth_stats.json)",
    )
    args = ap.parse_args()
    root = args.input_path.expanduser().resolve()
    out_path = args.out.expanduser().resolve()

    files = discover_csvs(root)
    if not files:
        print(f"CSV를 찾을 수 없습니다: {root}", file=sys.stderr)
        return 1

    lms_path = next(
        (p for p in files if re.search(r"LMS", p.name, re.I)),
        None,
    )
    z_path = next(
        (p for p in files if re.search(r"백분위수기준", p.name) or "percentile" in p.name.lower()),
        None,
    )

    all_lms: list[LMSRow] = []
    if lms_path:
        all_lms.extend(parse_lms_csv(lms_path))
    if not all_lms:
        for p in files:
            rows = parse_lms_csv(p)
            if rows:
                all_lms.extend(rows)
                lms_path = lms_path or p

    percentile_z: list[dict[str, float]] | None = None
    if z_path:
        percentile_z = parse_percentile_z_csv(z_path)
    if percentile_z is None:
        for p in files:
            pct = parse_percentile_z_csv(p)
            if pct:
                percentile_z = pct
                z_path = p
                break

    if not all_lms:
        print(
            "LMS 기준 CSV를 찾지 못했습니다.\n"
            "  공공데이터포털에서 같은 날짜의\n"
            "  「국민건강보험공단_영유아성장도표LMS기준_YYYYMMDD.csv」\n"
            "  를 받아 입력 폴더에 넣은 뒤 다시 실행하세요.\n"
            "  (백분위수기준 CSV만으로는 키·몸무게 수치를 복원할 수 없습니다.)",
            file=sys.stderr,
        )
        return 2

    by_month = lms_rows_to_by_month(all_lms)
    male, female = build_growth_from_lms(by_month)

    meta: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_csvs": [str(p) for p in files],
        "lms_file_used": str(lms_path) if lms_path else None,
        "percentile_z_file": str(z_path) if z_path and percentile_z else None,
        "percentile_z_bounds_rows": len(percentile_z) if percentile_z else 0,
        "percentiles": list(PERCENTILES),
        "notes": {
            "height_unit": "cm (LMS M값 단위와 동일 가정)",
            "weight_unit": "kg (LMS M값 단위와 동일 가정)",
            "z_method": "statistics.NormalDist.inv_cdf(p/100)",
        },
    }

    result: dict[str, Any] = {
        "male": male,
        "female": female,
        "_meta": meta,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"  male months: {len(male)}, female months: {len(female)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
