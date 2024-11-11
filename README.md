# NodeServerTester

## AWS 탄력적 IP 발급

<br>

## AWS 보안 인바운드 규칙 설정

1. MongoDB 에 적용할 포트 번호 규칙 추가 -> 27017 말고 다른 포트로 변경
2. 백엔드 포트 번호 규칙 추가
3. http, https, ssh 포트 번호 규칙 추가

<br>

## MongoDB Admin, User 추가

1. 접근 및 제어 가능한 admin 추가
2. 읽기 쓰기 가능한 User 추가

<br>

## mongod.conf 설정

1. 보안 설정 필수

```
security:
  authorization: enabled
```

2. bindIP 접근 변경 

```
127.0.0.1 --> 0.0.0.0
```

<br>

## Nginx 설정

1. root 경로 클라이언트 build 폴더로 수정
2. openssl 발급 및 적용(https)
3. http -> https 리다이렉트 설정

<br>

## .env 설정

1. front, back 폴더에 맞는 환경변수 생성(HOST, PORT ... )
2. front 변수는 REACT_APP 수식어 필수 -> front 소스코드 참조

<br>

## https 설정

1. 발급받은 ssl 파일을 기본으로 https 설정을 완료하여 요청을 받을 수 있도록 설정
2. 기타 사항은 server.js 소스코드 참조