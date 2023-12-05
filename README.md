# The Bidders

## Getting started

### Requirements

-   Node.js
-   npm
-   MySQL

### Setup

-   root 디렉토리에 .env 생성

```
NODE_ENV=
PORT=

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

### Migration scripts

-   마이그레이션 스크립트 명령어
-   mysql-migrations 디렉토리에서 마이그레이션 파일 관리

```sh
## let TypeORM generate migration file / --name 옵션 필수
$ npm run migration:generate --name=

## create migration file / --name 옵션 필수
$ npm run migration:create --name=

## run migration file
$ npm run migration:run

## revert migration file
$ npm run migration:revert
```

### Test

```sh
$ npm run test
```

### Run

```sh
## Dev mode
$ npm run start:dev
```

<br>

## Authentication flow

### Sign up 프로세스

```mermaid
sequenceDiagram

Client-)Server: 1. POST /auth/signup
Note over Server: email 조회
Server--)Client: 409 Conflict - Email in use
Note over Server: password 해싱
Note over Server: user 정보 저장
Note over Server: atk, rtk 생성 (JsonWebToken)
Note over Server: rtk 저장 (Redis)
Server-)Client: 2. atk, rtk 발급
Client-)Server: 3. atk로 리소스 요청
Note over Server: Guard에서 인증/인가
Server--)Client: 401 Unauthorized - Token is missing
Server--)Client: 400 Bad Request - Token is invalid
Server-)Client: 4. 리소스 응답
```

<br>

### Sign in 프로세스

```mermaid
sequenceDiagram

Client-)Server: 1. POST /auth/signin { email, password }
Note over Server: email 조회
Server--)Client: 404 Not Found - User not found
Note over Server: password 비교
Server--)Client: 401 Unauthorized - Invalid password
Note over Server: atk, rtk 생성 (JsonWebToken)
Note over Server: rtk 저장 (Redis)
Server-)Client: 2. atk, rtk 발급
Client-)Server: 3. atk로 리소스 요청
Note over Server: Guard에서 인증/인가
Server--)Client: 401 Unauthorized - Token is missing
Server--)Client: 400 Bad Request - Token is invalid
Server-)Client: 4. 리소스 응답
```

<br>

### Access token 재발급 프로세스

-   **_RTR(Refresh Token Rotation) 도입_**
-   **_JWT로 Refresh Token 생성_**

```mermaid
sequenceDiagram

Client-)Server: 1. GET /auth/refresh (rtk로 재발급 요청)
Note over Server: Guard에서 재발급 프로세스 수행
Server--)Client: 401 Unauthorized - Token is missing
Note over Server: Verify rtk
Server--)Client: 400 Bad Request - Token is invalid
Note over Server: Redis에 저장된 rtk 값 비교 (key : value = userId : rtk)
Server--)Client: 403 Forbidden - Should login again (서버는 Redis key 삭제)
Note over Server: atk & rtk 모두 재발급
Note over Server: Redis에 저장된 rtk 갱신
Server-)Client: 2. atk, rtk
```
