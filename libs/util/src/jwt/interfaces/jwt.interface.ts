export interface IUserPayload {
    id: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface IToken {
    atk: string;
    rtk: string;
}

export interface IExpireOpt {
    atk_expire: string;
    rtk_expire: string;
}
