# Teach-U (티츄) — Frontend

> **"가르치면서 내가 더 배운다. 내 제자가 성장하면, 나도 성장한다."**
>
> 바이브코딩 AI활용 차세대 교육 솔루션 공모전 출품작

---

## 1. 프로젝트 소개

**Teach-U (티츄)** 는 기존 AI 교육 앱의 방향을 완전히 역전한 모바일 학습 앱입니다.

```
기존 AI 교육앱:   AI  ────▶  사용자   (AI가 가르치고, 사용자는 수동적으로 학습)
Teach-U:       사용자 ────▶  AI 학생  (사용자가 가르치고, AI가 배우는 학생)
```

사용자는 자신이 오늘 배운 내용을 **AI 학생 페르소나**에게 직접 설명합니다. AI는 소크라테스 문답법으로 질문하며, 사용자 스스로 오개념과 논리 빈틈을 발견하게 합니다.

### 주요 화면 플로우

```
로그인 (Google OAuth)
  → 과목 선택/생성
    → 커리큘럼 & 단계 설정
      → 페르소나 설정 (이름, 개성, 성별)
        → 가르치기 채팅 (소크라테스 대화)
          → 단계 시험 (합산 채점)
            → 개념 사물함 (약점 복습)
```

### 핵심 기능

| 화면 | 기능 |
|------|------|
| **SubjectListScreen** | 과목 목록·생성 (어떤 분야든 가능) |
| **ChatScreen** | AI 페르소나와 소크라테스 방식 실시간 채팅 (SSE 스트리밍) |
| **ExamScreen** | 가르친 내용 기반 5문항 시험 + 합산 채점 |
| **WeaknessNoteScreen** | 오답 개념 사물함 (약점 태그 목록) |
| **PracticeScreen** | Claude 맞춤 복습 문제 + 퍼지 채점 |
| **GrowthTimelineScreen** | 페르소나 성장 타임라인 |

---

## 2. 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| **프레임워크** | React Native (Expo) | ~54.0.33 |
| **언어** | TypeScript | ~5.9.2 |
| **내비게이션** | React Navigation (native-stack) | ^7 |
| **HTTP 클라이언트** | Axios | ^1.14.0 |
| **인증** | expo-auth-session (Google OAuth) | ~7.0.10 |
| **로컬 저장** | @react-native-async-storage | 2.2.0 |
| **폰트** | expo-google-fonts (Jua, Gamja Flower) | ^0.4.1 |
| **플랫폼** | iOS / Android / Web | — |

---

## 3. 시작하기

### 사전 요구사항

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator 또는 Android Emulator (또는 실기기 + Expo Go)
- 백엔드 서버 실행 중 (또는 Railway 배포 URL)

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. API Base URL 설정
# src/api/client.ts 에서 백엔드 URL 확인/수정
```

### API 연결 설정

```typescript
// src/api/client.ts
const BASE_URL = 'https://your-backend.up.railway.app/api/v1';
```

### 실행

```bash
# Expo Go (실기기/에뮬레이터)
npx expo start

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android

# 웹 브라우저
npx expo start --web
```

---

## 4. API 레퍼런스

> 전체 명세: [`docs/API_spec.md`](docs/API_spec.md)
>
> Base URL: `https://<railway-domain>/api/v1`
> 인증: `Authorization: Bearer <access_token>`

### 프론트엔드 API 모듈 구조

```
src/api/
├── client.ts          # Axios 인스턴스 (baseURL, 인터셉터)
├── auth.ts            # 로그인/로그아웃/Google OAuth
├── subjects.ts        # 과목 CRUD
├── curriculum.ts      # 커리큘럼 항목 관리
├── stages.ts          # 단계 관리
├── persona.ts         # 페르소나 CRUD + 메모리 조회
├── sessions.ts        # 가르치기 세션 + SSE 채팅
├── exams.ts           # 시험 생성·제출
└── weakPoints.ts      # 약점 태그 + 복습
```

### 주요 API 호출 예시

#### Google 로그인

```typescript
// GET /auth/google/url → 로그인 URL 반환
const { url } = await authApi.getGoogleUrl();
await WebBrowser.openAuthSessionAsync(url, redirectUri);
// POST /auth/google/code → JWT 반환
const { access_token } = await authApi.exchangeGoogleCode(code);
```

#### SSE 스트리밍 채팅

```typescript
// POST /subjects/{id}/persona/sessions/{sid}/chat
// → ReadableStream으로 토큰 단위 수신
const response = await fetch(`${BASE_URL}/subjects/${subjectId}/persona/sessions/${sessionId}/chat`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage }),
});
const reader = response.body?.getReader();
// event: token → 글자 누적
// event: done  → 완료
```

#### 시험 생성 및 제출

```typescript
// POST /exams → 5문항 시험 생성
const exam = await examsApi.create();

// POST /exams/{id}/submit → 채점 + 진급 판정
const result = await examsApi.submit(exam.exam_id, answers);
// result.combined_score ≥ 70 → 진급
```

#### 복습 문제 생성 및 제출

```typescript
// POST /subjects/{id}/persona/weak-points/{tag_id}/practice
const practice = await weakPointsApi.practice(subjectId, tagId);
// → { problem, hints, concept_title, concept_explanation }

// POST .../practice/submit
const { is_correct, feedback } = await weakPointsApi.submitPractice(
  subjectId, tagId, practice.problem, userAnswer
);
// is_correct === true → WeakPointTag 자동 삭제
```

---

## 5. 프로젝트 구조

```
_vibeContest/ (Frontend)
├── App.tsx                    # 루트 컴포넌트 (네비게이션 스택 정의)
├── src/
│   ├── api/                   # API 모듈 (axios 기반)
│   │   ├── client.ts          # Axios 인스턴스
│   │   ├── auth.ts
│   │   ├── subjects.ts
│   │   ├── sessions.ts        # 채팅 세션 + SSE
│   │   ├── exams.ts
│   │   └── weakPoints.ts      # 약점 + 복습
│   ├── screens/
│   │   ├── LoginScreen.tsx        # Google OAuth 로그인
│   │   ├── SubjectListScreen.tsx  # 과목 목록/생성
│   │   ├── HomeScreen.tsx         # 과목 홈 (페르소나 상태, 단계 현황)
│   │   ├── ChatScreen.tsx         # 가르치기 채팅 (SSE 스트리밍)
│   │   ├── ExamScreen.tsx         # 단계 시험 (객관식·단답형 Modal)
│   │   ├── ExamResultScreen.tsx   # 시험 결과 + 진급 여부
│   │   ├── WeaknessNoteScreen.tsx # 개념 사물함 (약점 태그 목록)
│   │   ├── PracticeScreen.tsx     # 복습 문제 + 답변 입력 + 퍼지 채점
│   │   ├── GrowthTimelineScreen.tsx # 성장 타임라인
│   │   ├── OnboardingScreen.tsx   # 페르소나 설정 온보딩
│   │   ├── CurriculumSetupScreen.tsx
│   │   ├── StageSetupScreen.tsx
│   │   └── SyllabusScreen.tsx
│   ├── components/            # 공용 UI 컴포넌트 (Avatar, Button 등)
│   ├── context/               # AuthContext (JWT 상태 관리)
│   ├── navigation/            # 네비게이션 타입 정의
│   ├── types/                 # TypeScript 타입 (PracticeData, WeakPointTag 등)
│   ├── theme/                 # 색상, 폰트 상수
│   └── utils/                 # 공통 유틸리티
└── docs/
    ├── instruction.md         # AI 협업 운영 지침 (백엔드 SSoT 복사본)
    ├── API_spec.md            # 전체 REST API 명세 (백엔드 SSoT 복사본)
    ├── AI_API_Architecture.md # Claude 호출 설계 (백엔드 SSoT 복사본)
    ├── main_logic.md          # 핵심 구현 로직 (백엔드 SSoT 복사본)
    ├── design_UXUI/
    │   └── design_UXUI_plan.md  # UI/UX 화면 설계 (프론트 전용)
    └── design_initial_idea/     # 초기 기획 아이디어 기록 (프론트 전용)
```

---

## 6. 심사기준에 따른 차별성 강조

### 기술적 완성도

| 항목 | 구현 내용 |
|------|---------|
| **SSE 스트리밍** | `fetch` + `ReadableStream`으로 Claude 응답을 토큰 단위 실시간 렌더링 |
| **크로스 플랫폼** | iOS / Android / Web 동시 지원 (Expo) |
| **단답형 Modal** | `Alert.prompt` (iOS 전용) 대신 커스텀 Modal + TextInput으로 플랫폼 중립 구현 |
| **자동 스크롤** | `FlatList` + 60ms 디바운스 `scrollToEnd`로 채팅 자동 스크롤 |
| **성별 기억** | `AsyncStorage`에 과목별 성별 저장 → 페르소나 아바타 일관성 유지 |
| **퍼지 채점 UX** | 정답 시 애니메이션 + "복습 완료 도장" → 자동 goBack |

### AI 활용 능력 및 효율성

- **7종 Claude 프롬프트**를 목적별로 분리 — 단일 챗봇이 아닌 역할별 전문 AI
- **소크라테스 채팅**: 사용자 메시지 전송마다 멀티턴 히스토리 전달 → 맥락 있는 대화
- **복습 퍼지 채점**: 단순 정답 비교가 아닌 Claude가 핵심 이해도를 판별
- **과목 중립 프롬프트**: `subject_name` 동적 주입 → 수학·역사·코딩 등 모든 과목 동일하게 동작

### 기획력 및 실무 접합성

- **50인 가상 페르소나** 인터뷰 기반 교육 현장 페인포인트 도출
- **교육학 3이론** (파인만·프로테제·에빙하우스) 을 UI/UX 흐름에 직접 반영
- **커리큘럼 전권 이양**: 사용자가 과목·단계명·학습 항목을 완전히 자유롭게 설계

### 창의성

- **"AI가 가르친다" → "사용자가 AI를 가르친다"** 전례 없는 역전 구조
- AI 학생이 에빙하우스 곡선으로 실제로 배우고 잊어가는 **망각 시뮬레이션**
- 사용자·AI 학생이 **같은 시험지**를 받아 합산 점수로 진급을 결정하는 독창적 메커니즘

---

## 7. 시스템 아키텍처 구조

```
┌─────────────────────────────────────────────────────────────────────┐
│                     React Native (Expo) App                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   화면 계층 (Screens)                          │   │
│  │  Login → SubjectList → Home → Chat → Exam → WeaknessNote     │   │
│  │                                    ↓                          │   │
│  │                              PracticeScreen                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          │                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API 계층 (src/api/)                         │   │
│  │  auth / subjects / sessions / exams / weakPoints             │   │
│  │                                                                │   │
│  │  [일반 요청] Axios → JSON 응답                                  │   │
│  │  [채팅]      fetch → ReadableStream (SSE) → 토큰 단위 렌더링    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          │                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    상태/컨텍스트                                │   │
│  │  AuthContext (JWT 저장/갱신)                                   │   │
│  │  AsyncStorage (성별, 토큰 등 로컬 영속 데이터)                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  HTTPS + JWT Bearer
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Railway)                          │
│                                                                      │
│  subjects / exam / auth / persona / dashboard 라우터                  │
│  → AI 서비스 (Claude API 7종 프롬프트)                                  │
│  → 망각 곡선 엔진 (retention = e^(-t/S))                               │
│  → PostgreSQL + Redis (Rate Limit)                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 핵심 UX 흐름

```
[가르치기 화면 — ChatScreen]
  사용자 입력 → POST .../chat
    → SSE 스트림 수신 (event: token)
    → FlatList에 토큰 단위 append
    → event: done → 입력창 활성화
    → 60ms 디바운스 scrollToEnd 자동 실행

[시험 화면 — ExamScreen]
  객관식: 보기 버튼 터치 → 선택 상태 저장
  단답형: 버튼 터치 → Modal + TextInput 팝업 (플랫폼 중립)
  제출 → ExamResultScreen (combined_score, 진급 여부, 약점 목록)

[복습 화면 — PracticeScreen]
  진입 → POST .../practice (Claude 문제 생성, 로딩 스피너)
  힌트 단계별 공개 → 답변 입력 Modal
  제출 → POST .../practice/submit
  정답 → 애니메이션 + "복습 완료 도장 찍기" → goBack
  오답 → Claude 피드백 말풍선 표시
```

---

## 8. 마무리

**Teach-U (티츄)** 는 단순한 AI 챗봇 교육 도구가 아닙니다.

"가르치는 것이 최고의 학습법"이라는 수십 년간 검증된 교육학 원리를 AI와 접목하여, 사용자가 자신의 학습을 주도적으로 설계하고 AI 학생을 성장시키면서 자신도 함께 성장하는 **새로운 형태의 교육 경험**을 제안합니다.

> **Frontend Repository**: [TEAM-PEENOO/Front-end](https://github.com/TEAM-PEENOO/Front-end)
> **Backend Repository**: [TEAM-PEENOO/Back-end](https://github.com/TEAM-PEENOO/Back-end)

---

*제작: 태훈 × Claude Sonnet 4.6 (바이브코딩)*
*공모전: 바이브코딩 AI활용 차세대 교육 솔루션*
