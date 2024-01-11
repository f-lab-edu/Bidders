import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const users = new SharedArray('users', () => {
    return JSON.parse(open('./assets/users.json')).users;
});

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        'http_req_duration{api:bid:post-first}': ['p(95)<1000'],
        'http_req_duration{api:bid:post}': ['p(95)<1000'],
        'http_req_duration{api:bid:patch}': ['p(95)<1000'],
        checks: ['rate>=0.95'],
        'checks{api:bid:post-first}': ['rate>=0.95'],
        'checks{api:bid:post}': ['rate>=0.95'],
        'checks{api:bid:patch}': ['rate>=0.95'],
    },
    stages: [
        { duration: '1m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '1m', target: 0 },
    ],
};

export default function () {
    const randomUser = randomItem(users);
    // sign-in
    let response = http.post(
        `${__ENV.BASE_URL}/user/signin/`,
        {
            email: randomUser.email,
            password: randomUser.password,
        },
        { tags: { api: 'signin' } },
    );
    sleep(1);

    const atk = response.json().atk;

    // me
    response = http.get(`${__ENV.BASE_URL}/user/me/`, {
        headers: { Authorization: `Bearer ${atk}` },
    });
    const userId = response.json().id;

    // get items
    response = http.get(`${__ENV.BASE_URL}/auction/items/`);
    const items = response.json().items;
    const randItem = randomItem(items);
    sleep(1);

    // get item
    let itemResponse = http.get(
        `${__ENV.BASE_URL}/auction/item/${randItem.id}`,
    );
    const myBid = itemResponse.json().bids.filter((v) => v.user_id === userId);
    sleep(randomIntBetween(1, 5));

    // no my bid and no other bids
    if (!myBid[0] && !itemResponse.json().bids.length) {
        response = http.post(
            `${__ENV.BASE_URL}/auction/bid/`,
            {
                item_id: randItem.id,
                bid_amount: randItem.start_price,
            },
            {
                headers: {
                    Authorization: `Bearer ${atk}`,
                },
                tags: { api: 'bid:post-first' },
            },
        );
        sleep(1);

        check(
            response,
            {
                'status is 201': (res) => res.status === 201,
            },
            {
                api: 'bid:post-first',
            },
        );
    }

    // no my bid but other bids exist
    if (!myBid[0] && itemResponse.json().bids.length) {
        const newAmount = itemResponse.json().bids[0].bid_amount + 100;
        response = http.post(
            `${__ENV.BASE_URL}/auction/bid/`,
            {
                item_id: randItem.id,
                bid_amount: newAmount,
            },
            {
                headers: {
                    Authorization: `Bearer ${atk}`,
                },
                tags: { api: 'bid:post' },
            },
        );
        sleep(1);

        check(
            response,
            {
                'status is 201': (res) => res.status === 201,
            },
            {
                api: 'bid:post',
            },
        );
    }

    // if my bid exists
    if (myBid[0]) {
        const newAmount = itemResponse.json().bids[0].bid_amount + 100;
        response = http.patch(
            `${__ENV.BASE_URL}/auction/bid/${myBid[0].id}/`,
            {
                bid_amount: newAmount,
            },
            {
                headers: {
                    Authorization: `Bearer ${atk}`,
                },
                tags: { api: 'bid:patch' },
            },
        );
        sleep(1);

        check(
            response,
            {
                'status is 200': (res) => res.status === 200,
            },
            {
                api: 'bid:patch',
            },
        );
    }
}
