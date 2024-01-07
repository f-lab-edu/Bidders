// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

function addUserToFile(credentials, filePath) {
    // 파일이 존재하지 않으면 빈 객체로 초기화
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({ users: [] }), 'utf8');
    }

    // 파일에서 기존 데이터 읽기
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // 새 사용자 추가
    data.users.push({ ...credentials });

    // 파일에 데이터 쓰기
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

function generateUserCredential() {
    const randNum = Math.trunc(Math.random() * 100000);
    const randStr = randNum.toString();
    const userCredentials = {
        username: 'test-' + randStr,
        email: 'test-' + randStr + '@bidders.com',
        password: 'password-' + randStr,
    };

    return userCredentials;
}

const filePath = path.join(__dirname, 'assets', 'users.json'); // 파일 경로 설정

// 1000명 생성
for (let i = 0; i < 1000; i++) {
    const userCredential = generateUserCredential();
    addUserToFile(userCredential, filePath);
}
