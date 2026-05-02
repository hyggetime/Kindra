#!/usr/bin/env python3
"""
심허브(고양시 집 라벨링) JSON을 순회해 연령별 객체(label) 빈도·평균 크기(w,h,면적)를 집계합니다.

스키마(샘플 파일 기준):
  - 연령(age):     루트 `meta.age` (정수, 예: 9)
  - 성별(gender):  루트 `meta.sex` (문자열, 예: "여", "남")  ← 키 이름은 `sex`
  - 객체 이름:     `annotations.bbox[].label` (예: "창문", "문", "지붕")
  - 좌표/크기:     `annotations.bbox[]` 의 `x`, `y`, `w`, `h` (픽셀; bbox는 배열로 나열)

출력: 기본 `seemhub_stats.json` (입력 폴더와 동일 위치 또는 --out 지정)

사용 예:
  python scripts/seemhub_aggregate_house_labels.py ^
    "C:\\Users\\dawn\\Documents\\...\\Training_라벨링데이터_집)_20221231"
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def parse_image_area(meta: dict[str, Any]) -> float | None:
    """meta.img_resolution \"1280x1280\" -> 면적 (상대면적 계산용, 선택)."""
    res = meta.get("img_resolution")
    if not res or not isinstance(res, str) or "x" not in res.lower():
        return None
    try:
        w_s, h_s = res.lower().split("x", 1)
        w0, h0 = int(w_s.strip()), int(h_s.strip())
        return float(w0 * h0)
    except (ValueError, TypeError):
        return None


def process_file(path: Path) -> tuple[dict[str, Any] | None, str | None]:
    """성공 시 (payload, None), 스킵 시 (None, reason)."""
    try:
        text = path.read_text(encoding="utf-8")
        data = json.loads(text)
    except (OSError, UnicodeDecodeError) as e:
        return None, f"read_error:{e}"
    except json.JSONDecodeError as e:
        return None, f"json_error:{e}"

    meta = data.get("meta")
    if not isinstance(meta, dict):
        return None, "no_meta"
    age = meta.get("age")
    if age is None:
        return None, "no_age"
    try:
        age_key = str(int(age))
    except (TypeError, ValueError):
        return None, "bad_age"

    ann = data.get("annotations")
    if not isinstance(ann, dict):
        return None, "no_annotations"
    boxes = ann.get("bbox")
    if not isinstance(boxes, list):
        return None, "no_bbox_list"

    img_area = parse_image_area(meta)
    sex = meta.get("sex")
    if sex is not None and not isinstance(sex, str):
        sex = str(sex)

    rows: list[dict[str, Any]] = []
    for i, b in enumerate(boxes):
        if not isinstance(b, dict):
            continue
        label = b.get("label")
        if not label or not isinstance(label, str):
            continue
        try:
            w = float(b["w"])
            h = float(b["h"])
            x = float(b.get("x", 0))
            y = float(b.get("y", 0))
        except (KeyError, TypeError, ValueError):
            continue
        if w < 0 or h < 0:
            continue
        area = w * h
        rel = (area / img_area) if img_area and img_area > 0 else None
        rows.append(
            {
                "label": label.strip(),
                "x": x,
                "y": y,
                "w": w,
                "h": h,
                "area": area,
                "area_rel": rel,
            }
        )

    return {
        "age_key": age_key,
        "sex": sex,
        "img_id": meta.get("img_id"),
        "img_resolution": meta.get("img_resolution"),
        "img_area": img_area,
        "rows": rows,
    }, None


def main() -> int:
    parser = argparse.ArgumentParser(description="SeemHub 집 라벨 JSON → 연령별 label 통계")
    parser.add_argument(
        "input_dir",
        type=Path,
        help="JSON 파일들이 있는 폴더 (보통 …Training_라벨링데이터_집)_20221231)",
    )
    parser.add_argument(
        "-o",
        "--out",
        type=Path,
        default=None,
        help="출력 JSON 경로 (기본: 입력폴더/seemhub_stats.json)",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="하위 폴더까지 *.json 검색 (기본: 입력 폴더 직계만)",
    )
    args = parser.parse_args()
    input_dir: Path = args.input_dir.expanduser().resolve()
    if not input_dir.is_dir():
        print(f"입력 폴더가 없습니다: {input_dir}", file=sys.stderr)
        return 1

    pattern = "**/*.json" if args.recursive else "*.json"
    files = sorted(input_dir.glob(pattern))
    if not files:
        print(f"JSON 파일이 없습니다: {input_dir} / {pattern}", file=sys.stderr)
        return 1

    out_path = args.out
    if out_path is None:
        out_path = input_dir / "seemhub_stats.json"
    else:
        out_path = out_path.expanduser().resolve()

    # age -> label -> aggregates (bbox instance = one count)
    sum_w: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    sum_h: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    sum_area: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    sum_rel: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    rel_n: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    count: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    images_by_age: dict[str, int] = defaultdict(int)
    # optional: age + sex
    images_by_age_sex: dict[tuple[str, str], int] = defaultdict(int)

    skipped: dict[str, int] = defaultdict(int)
    processed = 0

    for fp in files:
        payload, err = process_file(fp)
        if err:
            skipped[err] += 1
            continue
        assert payload is not None
        processed += 1
        age_key = payload["age_key"]
        sex = payload["sex"] or "unknown"
        images_by_age[age_key] += 1
        images_by_age_sex[(age_key, sex)] += 1

        for row in payload["rows"]:
            lab = row["label"]
            count[age_key][lab] += 1
            sum_w[age_key][lab] += row["w"]
            sum_h[age_key][lab] += row["h"]
            sum_area[age_key][lab] += row["area"]
            if row["area_rel"] is not None:
                sum_rel[age_key][lab] += row["area_rel"]
                rel_n[age_key][lab] += 1

    # 빌드 출력
    by_age: dict[str, Any] = {}
    ages_sorted = sorted(count.keys(), key=lambda a: int(a))
    for age_key in ages_sorted:
        labels_out: dict[str, Any] = {}
        all_labels = sorted(count[age_key].keys(), key=lambda L: (-count[age_key][L], L))
        for lab in all_labels:
            c = count[age_key][lab]
            labels_out[lab] = {
                "bbox_instance_count": c,
                "mean_w_px": round(sum_w[age_key][lab] / c, 4),
                "mean_h_px": round(sum_h[age_key][lab] / c, 4),
                "mean_area_px": round(sum_area[age_key][lab] / c, 4),
            }
            rn = rel_n[age_key][lab]
            if rn > 0:
                labels_out[lab]["mean_area_relative_to_canvas"] = round(sum_rel[age_key][lab] / rn, 8)

        by_age[age_key] = {
            "image_count": images_by_age[age_key],
            "labels": labels_out,
        }

    by_age_sex_out = {
        f"{a}_{s}": images_by_age_sex[(a, s)]
        for (a, s) in sorted(images_by_age_sex.keys(), key=lambda x: (int(x[0]), x[1]))
    }

    result = {
        "schema_notes": {
            "age_field": "meta.age",
            "gender_field": "meta.sex (값 예: 여, 남)",
            "label_field": "annotations.bbox[].label",
            "bbox_fields": "annotations.bbox[].x, y, w, h (픽셀)",
            "mean_area_relative_to_canvas": "bbox 면적 / (meta.img_resolution 가로×세로), 해상도 없으면 생략",
        },
        "source_dir": str(input_dir),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "json_files_seen": len(files),
            "json_files_used": processed,
            "skipped": dict(skipped),
            "age_keys": ages_sorted,
        },
        "images_by_age_and_sex_meta_only": by_age_sex_out,
        "by_age": by_age,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"Used {processed} / {len(files)} JSON files. Skipped: {dict(skipped)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
