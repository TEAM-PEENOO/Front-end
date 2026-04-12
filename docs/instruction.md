# 지침서 (Instruction Guide) — 나의 제자 (My Jeja)

> ⚠️ **이 파일은 백엔드 레포의 복사본입니다.**
> 원본(SSoT)은 `_vibeContest_Back/docs/instruction.md` 입니다.
> **이 파일을 직접 수정하지 마세요.** 백엔드 레포에서 수정 후 아래 명령으로 동기화하세요.
>
> ```sh
> # 백엔드 레포 루트에서 실행
> rsync -av docs/{AI_API_Architecture,API_spec,main_logic,instruction,prompt_history,DB_Schema}.md \
>   ../vibeContest/docs/
> ```

---

## ⚠️ SECTION 0 — AI 협업 절대 규칙 (최고 우선순위)

**아래 규칙들은 모든 작업에서 예외 없이 준수한다.**

---

### 0-1. 문서 업데이트 의무 규칙 (엄격)

```
매 기능 업데이트마다 문서들에 대하여 업데이트를 해야 할 것이 있으면 무조건 진행할 것.

구체적 기준:
- 새 API 엔드포인트 추가 → API_spec.md 즉시 업데이트
- 새 Claude 프롬프트 추가/변경 → AI_API_Architecture.md + instruction.md 즉시 업데이트
- 핵심 로직 변경 (채점 기준, 기억률 계산, 진급 조건 등) → main_logic.md 즉시 업데이트
- DB 스키마 변경 → DB_Schema.md 즉시 업데이트
- 공유 문서 수정 후 → 프론트엔드 레포로 반드시 동기화

문서 업데이트를 기능 구현 이후로 미루는 것은 허용하지 않는다.
기능 구현 커밋과 문서 업데이트 커밋은 같은 세션에 진행한다.
```

---

### 0-2. 중복 문서 관리 규칙 (Single Source of Truth)

```
공유 문서의 원본은 백엔드 레포에만 있다.

수정 순서:
1. 백엔드 레포 docs/ 에서 수정
2. 프론트엔드 레포 docs/ 로 동기화 (rsync 명령 사용)

이 파일(프론트엔드 instruction.md)을 직접 수정하지 않는다.
```

---

### 0-3. 바이브 코딩 토큰 절감 규칙

```
[파일 접근]
- 파일을 수정하기 전 반드시 해당 파일을 Read로 읽는다.
- 전체 파일이 필요하지 않으면 offset+limit으로 필요한 부분만 읽는다.
- 이미 읽은 파일을 같은 세션에서 다시 읽지 않는다.

[병렬 처리]
- 서로 독립적인 툴 호출은 반드시 병렬로 처리한다.
  예: 백엔드 파일 읽기 + 프론트엔드 파일 읽기 → 동시 호출

[편집 전략]
- 기존 파일 수정 → Edit 사용 (Write는 전체 내용을 전송하므로 비효율)
- 신규 파일 생성 또는 전체 재작성만 → Write 사용
- 검색은 Glob/Grep 우선, Bash의 find/grep 사용 금지

[코드 작성 원칙]
- 요청된 범위 밖의 리팩터링, 개선, 주석 추가를 하지 않는다.
- 현재 동작하는 코드를 "개선 목적"으로 건드리지 않는다.
- 에러를 만나면 원인을 파악한 후 최소 범위로 수정한다.
```

---

### 0-4. 커밋 & 푸시 규칙

```
- 기능 구현 완료 후 커밋 시, 관련 문서 업데이트도 같은 커밋 또는 바로 다음 커밋에 포함.
- 백엔드와 프론트엔드 커밋은 같은 세션에서 처리 (문서 불일치 방지).
- 커밋 메시지 형식: "feat/fix/docs/chore: 한국어 설명"
- 공유 문서 동기화 커밋은 별도로: "chore: 백엔드 문서 프론트엔드 동기화"
```

---

## SECTION 1 — 프로젝트 현황 (2026년 4월 기준)

### 1-1. 앱 개요

```
앱 이름: 나의 제자 (My Jeja)
핵심 개념: "AI를 가르치면 내가 더 잘 배운다" (프로테제 효과 + 파인만 기법)
차별점: 사용자가 AI 학생 페르소나를 가르치고, 함께 시험을 치르는 역전 구조
과목: 사용자가 직접 정의 (수학 고정 아님 — 어떤 과목이든 가능)
```

### 1-2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React Native (Expo), TypeScript |
| 백엔드 | FastAPI (Python 3.11), SQLAlchemy async ORM |
| DB | PostgreSQL (Railway 배포) |
| AI | Claude API (claude-sonnet-4-6) |
| 인증 | JWT + Google OAuth |
| 배포 | Railway (백엔드), Expo Go / EAS (프론트엔드) |

### 1-3. 구현 완료 기능

```
[코어 기능 — 완료]
✅ Google 로그인/로그아웃
✅ 과목 생성/수정/삭제
✅ 커리큘럼 항목 관리
✅ 단계(Stage) 관리
✅ AI 페르소나 생성 (이름/개성/성별 설정)
✅ 가르치기 세션 (소크라테스 채팅, SSE 스트리밍, 멀티턴)
✅ 세션 종료 후 품질 평가 + 요약 생성
✅ 단계 시험 (문제 생성, 합산 채점, 진급 판정)
✅ 개념 사물함 (약점 태그 목록)
✅ 약점 복습 (문제 생성 + 퍼지 채점)
✅ 기억률 계산 (에빙하우스 망각 곡선)

[핵심 수치]
- 시험 통과 기준: combined_score ≥ 70 (user×0.6 + persona×0.4)
- 복습 정답 시: WeakPointTag 삭제 + PersonaMemory.stability += 0.2
- 채팅 max_tokens: 500 / 시험 생성 max_tokens: 1,200
```

### 1-4. 알려진 이슈 / 주의 사항

```
[JSONB 뮤테이션 추적]
JSONB 컬럼 수정 후 반드시 flag_modified(obj, "field") 호출 필요.

[스트리밍 + DB 세션]
StreamingResponse 사용 시 event_gen() 내부에서 별도 DB 세션 필요.
async with AsyncSessionLocal() as db: 패턴 사용.

[Claude API 멀티턴 제약]
messages 배열 첫 항목은 role="user", role이 교대로 나타나야 함.
연속된 같은 role은 content를 줄바꿈으로 병합.

[answer_key 처리]
Claude 반환 answer_key("1"~"5")를 저장 시 실제 보기 텍스트로 변환.
```

---

## SECTION 2 — 문서 목록 & 역할

| 파일 | 역할 | SSoT |
|------|------|------|
| `instruction.md` | AI 협업 규칙, 프로젝트 현황, 운영 지침 | 백엔드 |
| `API_spec.md` | 전체 REST API 명세 | 백엔드 |
| `AI_API_Architecture.md` | Claude API 호출 설계, 프롬프트 명세, 비용 추정 | 백엔드 |
| `main_logic.md` | 핵심 구현 로직 (기억률, 시험, 복습 흐름) | 백엔드 |
| `DB_Schema.md` | 데이터베이스 스키마 | 백엔드 |
| `design_UXUI/` | 화면별 상세 UX 설계 | 프론트 전용 |
| `design_initial_idea/` | 초기 아이디어 기록 | 프론트 전용 |

> 상세 내용은 백엔드 레포 `instruction.md`를 참조하세요.

---

*원본: `_vibeContest_Back/docs/instruction.md`*
*최종 동기화: 2026-04-12*
