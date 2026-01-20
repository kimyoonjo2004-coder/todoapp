# Vercel 배포 가이드

## ✅ 완료된 작업
- PostgreSQL 지원 코드 추가
- Vercel 서버리스 함수 설정
- GitHub에 푸시 완료

## 🚀 Vercel에서 해야 할 작업

### 1. Vercel Postgres 데이터베이스 생성 (무료)

1. Vercel Dashboard 접속: https://vercel.com/dashboard
2. 프로젝트 선택 → **Storage** 탭 클릭
3. **Create Database** 클릭
4. **Postgres** 선택
5. 데이터베이스 이름 입력 (예: `todoapp-db`)
6. **Create** 클릭

### 2. 환경 변수 자동 연결

Vercel Postgres를 생성하면 자동으로 다음 환경 변수가 설정됩니다:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

우리 앱은 이미 `POSTGRES_URL`을 자동으로 읽도록 설정되어 있습니다!

### 3. 재배포

1. Vercel Dashboard → 프로젝트 → **Deployments** 탭
2. **Redeploy** 버튼 클릭
   - 또는 GitHub에 푸시하면 자동 배포됨

### 4. 확인

배포 완료 후:
- Vercel이 제공하는 URL 접속 (예: `https://todoapp-xxx.vercel.app`)
- Todo 앱이 정상 작동하는지 확인

## 🔧 문제 해결

배포 중 에러가 발생하면:
1. Vercel Dashboard → 프로젝트 → **Deployments** → 해당 배포 클릭
2. **Function Logs** 확인
3. 에러 메시지를 저에게 알려주세요!

## 💡 대안 (무료 PostgreSQL 서비스)

Vercel Postgres 대신 다른 서비스를 사용하려면:

1. **Supabase** (https://supabase.com/)
   - 무료 플랜: 500MB 저장소
   - PostgreSQL URL 복사

2. **Neon** (https://neon.tech/)
   - 무료 플랜: 10GB 저장소
   - PostgreSQL URL 복사

3. 환경 변수 설정:
   - Vercel Dashboard → Settings → Environment Variables
   - `DATABASE_URL` = `postgresql://user:password@host/database`
