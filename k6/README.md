## Prerequisites

-   assets/users.json 파일에 존재하는 사용자들 전부 signup 하기

```sh
## e.g.
$ k6 run -e BASE_URL=http://localhost:4000 signup-user.js
```

-   category 생성하기

```sh
## e.g.
$ k6 run -e BASE_URL=http://localhost:4000 post-category.js
```

## Run performance test

```sh
## e.g.
$ k6 run -e BASE_URL=http://localhost:4000 post-item.js
```
