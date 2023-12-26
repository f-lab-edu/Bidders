import dotenv from 'dotenv';

export default async () => {
    dotenv.config({
        path: `./apps/api/.env.${process.env.NODE_ENV}`,
    });
};
