# The Bidders

## Getting started

### Requirements

-   Node.js
-   npm
-   MySQL

### Setup

-   root 디렉토리에 .env 생성
-   환경에 따라 다른 .env 파일 로드
-   production mode
    -   파일명 : `.env.prod`
-   development mode
    -   파일명 : `.env.dev`
-   test mode
    -   파일명 : `.env.test`

### Migration scripts

-   마이그레이션 스크립트 명령어
-   mysql-migrations 디렉토리에서 마이그레이션 파일 관리

```sh
## let TypeORM generate migration file / --env, --name 옵션 필수
## --env=dev , --env=test
$ npm run migration:generate --env= --name=

## create migration file / --name 옵션 필수
$ npm run migration:create --name=

## run migration file / --env 옵션 필수
## --env=dev , --env=test
$ npm run migration:run --env=

## revert migration file / --env 옵션 필수
## --env=dev , --env=test
$ npm run migration:revert --env=
```

### Test

-   `.env.test` 파일 필요

```sh
## unit test
$ npm run test

## e2e test
$ npm run test:e2e
```

### Run

-   `.env.dev` 파일 필요

```sh
## Dev mode
$ npm run start:dev
```

<br>
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

<br>
<br>

## Cache 무효화 전략

```mermaid
sequenceDiagram

Client-)Server: GET /auction/items/search?c_code=&minPrice=&maxPrice=
Note over Server: prefix `search:` 와 queryString(`c_code=&minPrice=&maxPrice=`)을 사용해 cache-key 생성
Server--)Cache: cached?
Note over Cache: yes!
Cache--)Server: cached data
Server-)Client: 리소스 응답
Note over Server: cache data가 없다면?
Server--)DB: 데이터 요청
DB--)Server: data
Server--)Cache: cache data
Server-)Client: 리소스 응답
Client-)Server: POST /auction/item or PUT /auction/item/{id}
Server--)DB: 상품 등록 or 업데이트
Note over Server: Cache 서버에 존재하는 cache-key 중 등록 혹은 변경된 상품 c_code가 포함된 것 필터링
Note over Server: Cache 서버에 존재하는 cache-key 중 등록 혹은 변경된 상품 start_price가 (minPrice, maxPrice)에 포함된 것 필터링
Note over Server: 해당 cache-key 데이터들만 삭제
Server--)Cache: DELETE `search:c_code=&minPrice=&maxPrice=`

```

<br>
<br>

## DB 정합성

-   Pessimistic Lock(비관적 락)을 사용하여 경매 입찰 트랜잭션 처리

### Bid Process

1. 트랜잭션 시작
    - 사용자가 경매에 입찰을 할 때, REPEATABLE READ 격리 수준의 트랜잭션 시작
2. 경매 상품 조회
    - 데이터베이스에서 해당 경매 상품의 정보를 조회
    - 입착 가격이 시작 가격 이상인지 확인하기 위함
    - `pessimistic_read` 락을 적용하여 다른 트랜잭션에서 해당 상품에 대한 쓰기 작업 방지
3. 최신 입찰 정보 조회
    - 경매 상품에 대한 최신 입찰 정보 조회
    - 사용자의 입찰 가격이 현재 최고 입찰 가격보다 높은지 확인하기 위함
    - `pessimistic_write` 락을 적용하여 다른 트랜잭션에서 데이터의 읽기 및 쓰기 작업 방지
4. 입찰 데이터 저장
    - 새로운 입찰 데이터 생성 후 데이터베이스에 저장
5. 트랜잭션 커밋 or 롤백
    - 모든 처리가 정상적으로 완료되면 트랜잭션을 커밋하여 데이터베이스에 반영
    - 오류가 발생하는 경우 트랜잭션을 롤백하여 모든 변경사항 취소

<br>

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database

    C->>S: Request to place a bid
    S->>DB: Start Transaction (REPEATABLE READ)
    Note over DB: 트랜잭션 시작

    DB->>DB: Find AuctionItem (pessimistic_read)
    Note over DB: 경매 상품 조회 (쓰기 금지)

    DB->>DB: Find Latest Bid (pessimistic_write)
    Note over DB: 최신 입찰 정보 조회 (읽기/쓰기 금지)

    S->>DB: Save New Bid
    Note over DB: 새 입찰 데이터 저장

    alt 정상 처리
        S->>DB: Commit Transaction
        Note over DB: 트랜잭션 커밋
    else 오류 발생
        S->>DB: Rollback Transaction
        Note over DB: 트랜잭션 롤백
    end

    Note over DB: 트랜잭션 종료
    S->>C: Return Response

```

<br>

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database

    C->>S: Request to update bid
    S->>DB: Start Transaction (REPEATABLE READ)
    Note over DB: 트랜잭션 시작

    DB->>DB: Find Bid (pessimistic_write)
    Note over DB: 입찰 정보 조회 (읽기/쓰기 금지)

    alt Bid amount is valid
        S->>DB: Update Bid
        Note over DB: 입찰 정보 업데이트

        S->>DB: Commit Transaction
        Note over DB: 트랜잭션 커밋
    else Bid amount is invalid
        S->>DB: Rollback Transaction
        Note over DB: 트랜잭션 롤백
    end

    Note over DB: 트랜잭션 종료
    S->>C: Return Response

```
