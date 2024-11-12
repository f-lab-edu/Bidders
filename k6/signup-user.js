import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', () => {
    return JSON.parse(open('./assets/users.json')).users;
});

export default function () {
    users.forEach((user) => {
        const userCredential = {
            username: user.username,
            email: user.email,
            password: user.password,
        };

        let response = http.post(
            `${__ENV.BASE_URL}/user/signup/`,
            userCredential,
        );

        check(response, {
            'status is 201': (res) => res.status === 201,
        });
    });
}
