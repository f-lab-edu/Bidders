import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const users = new SharedArray('users', () => {
    return JSON.parse(open('./assets/users.json')).users;
});

const categories = new SharedArray('categories', () => {
    return JSON.parse(open('./assets/categories.json')).categories;
});

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        'http_req_duration{api:signin}': ['p(95)<1000'],
        'http_req_duration{api:item}': ['p(95)<1000'],
        checks: ['rate>=0.95'],
        'checks{api:signin}': ['rate>=0.95'],
        'checks{api:item}': ['rate>=0.95'],
    },
    stages: [
        { duration: '1m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '1m', target: 0 },
    ],
};

export default function () {
    const randomUser = randomItem(users);
    const randomCategory = randomItem(categories);

    // sign-in
    let response = http.post(
        `${__ENV.BASE_URL}/user/signin/`,
        {
            email: randomUser.email,
            password: randomUser.password,
        },
        { tags: { api: 'signin' } },
    );
    sleep(randomIntBetween(1, 5));

    check(
        response,
        {
            'status is 201': (res) => res.status === 201,
            'has atk': (res) => res.json().atk !== undefined,
        },
        {
            api: 'signin',
        },
    );

    const atk = response.json().atk;
    const randStr = randomString(5);

    const item = {
        c_code: randomCategory.c_code,
        title: '상품-' + randStr,
        content: '상품내용-' + randStr,
        image: 'https://auction-item.image.url',
        start_datetime: '2024-02-14 15:00:00',
        end_datetime: '2024-02-15 15:00:00',
        start_price: 10000,
    };

    // post item
    response = http.post(`${__ENV.BASE_URL}/auction/item/`, item, {
        headers: { Authorization: `Bearer ${atk}` },
        tags: { api: 'item' },
    });
    sleep(1);

    check(
        response,
        {
            'status is 201': (res) => res.status === 201,
        },
        {
            api: 'item',
        },
    );
}
