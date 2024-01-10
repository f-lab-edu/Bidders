import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const categories = new SharedArray('categories', () => {
    return JSON.parse(open('./assets/categories.json')).categories;
});

export default function () {
    categories.forEach((v) => {
        const category = {
            c_code: v.c_code,
            c_name: v.c_name,
        };
        let response = http.post(`${__ENV.BASE_URL}/category`, category);

        check(response, {
            'status is 201': (res) => res.status === 201,
        });
    });
}
