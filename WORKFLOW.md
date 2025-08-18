# Git Workflow 가이드

## 브랜치 구조

```
main (production)
├── staging (test server)
└── dev (development)
    ├── feat/feature-name
    ├── fix/bug-name
    └── hotfix/urgent-fix
```

### 브랜치 설명

- **main**: 프로덕션 배포 브랜치
- **staging**: 테스트 서버 배포 브랜치 (QA/UAT 환경)
- **dev**: 개발 통합 브랜치
- **feat/**: 새 기능 개발 브랜치
- **fix/**: 버그 수정 브랜치
- **hotfix/**: 긴급 수정 브랜치 (main에서 직접 분기)

## 워크플로우

### 1. 새 기능 개발

```bash
# dev 브랜치에서 시작
git checkout dev
git pull origin dev

# 기능 브랜치 생성
git checkout -b feat/new-feature

# 작업 진행
# ... 코드 작성 ...

# 커밋
git add .
git commit -m "feat: 새 기능 설명"

# dev로 머지
git checkout dev
git merge feat/new-feature

# 원격 저장소로 푸시
git push origin dev
```

### 2. 버그 수정

```bash
# dev 브랜치에서 시작
git checkout dev
git pull origin dev

# 버그 수정 브랜치 생성
git checkout -b fix/bug-description

# 수정 작업
# ... 코드 수정 ...

# 커밋
git add .
git commit -m "fix: 버그 설명"

# dev로 머지
git checkout dev
git merge fix/bug-description

# 푸시
git push origin dev
```

### 3. 테스트 서버 배포 (Staging)

```bash
# dev 브랜치의 변경사항을 staging으로 머지
git checkout staging
git pull origin staging
git merge dev

# 태그 생성 (선택사항)
git tag -a v1.0.0-rc.1 -m "Release candidate 1"

# 원격 저장소로 푸시
git push origin staging
git push origin --tags

# 테스트 서버 자동 배포 실행
```

### 4. 프로덕션 배포

```bash
# staging이 테스트 완료된 후
git checkout main
git pull origin main

# staging을 main으로 머지
git merge staging

# 프로덕션 태그 생성
git tag -a v1.0.0 -m "Production release v1.0.0"

# 원격 저장소로 푸시
git push origin main
git push origin --tags

# 프로덕션 자동 배포 실행
```

### 5. 긴급 수정 (Hotfix)

```bash
# main에서 직접 분기
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 긴급 수정 작업
# ... 코드 수정 ...

# 커밋
git add .
git commit -m "hotfix: 긴급 버그 설명"

# main으로 머지
git checkout main
git merge hotfix/critical-bug
git push origin main

# staging과 dev에도 반영
git checkout staging
git merge main
git push origin staging

git checkout dev
git merge main
git push origin dev
```

## 배포 파이프라인

```
개발 → dev → staging (테스트) → main (프로덕션)
```

### 자동 배포 설정 예시

- **dev 브랜치**: 개발 서버 자동 배포
- **staging 브랜치**: 테스트 서버 자동 배포
- **main 브랜치**: 프로덕션 수동 승인 후 배포

## 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 업무, 패키지 매니저 수정 등
```

## 릴리즈 주기

1. **개발 단계**: 기능 브랜치 → dev (수시)
2. **테스트 배포**: dev → staging (주 1-2회)
3. **프로덕션 배포**: staging → main (2주 단위 또는 필요시)

## 프로덕션 배포 후 다음 개발 시작

### main 푸시 완료 후 순서

```bash
# 1. 모든 브랜치를 최신 main과 동기화
git checkout main
git pull origin main

# 2. staging 브랜치 업데이트
git checkout staging
git merge main
git push origin staging

# 3. dev 브랜치 업데이트
git checkout dev
git merge main
git push origin dev

# 4. 새 기능 개발 시작
git checkout dev
git checkout -b feat/new-feature-name

# 이제 새 기능 개발 진행
```

### 중요 포인트

1. **동기화 필수**: main 배포 후 반드시 staging과 dev를 main과 동기화
2. **충돌 해결**: 동기화 중 충돌 발생 시 main의 코드를 우선시
3. **브랜치 정리**: 머지된 기능 브랜치들 삭제

```bash
# 머지된 로컬 브랜치 정리
git branch --merged | grep -v "\*\|main\|dev\|staging" | xargs -n 1 git branch -d

# 원격 브랜치 정리
git remote prune origin
```

## 체크리스트

### Staging 배포 전
- [ ] 모든 기능 브랜치가 dev에 머지됨
- [ ] dev 브랜치에서 테스트 완료
- [ ] 코드 리뷰 완료
- [ ] 단위 테스트 통과

### Production 배포 전
- [ ] Staging 환경에서 QA 완료
- [ ] 성능 테스트 완료
- [ ] 보안 점검 완료
- [ ] 롤백 계획 수립
- [ ] 배포 공지 발송