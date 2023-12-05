import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super(
            { message: 'User not found', error: 'Not Found' },
            HttpStatus.NOT_FOUND,
        );
    }
}

export class DuplicateEmailException extends HttpException {
    constructor() {
        super(
            { message: 'Email in use', error: 'Conflict' },
            HttpStatus.CONFLICT,
        );
    }
}

export class InvalidPasswordException extends HttpException {
    constructor() {
        super(
            { message: 'Invalid password', error: 'Unauthorized' },
            HttpStatus.UNAUTHORIZED,
        );
    }
}

export class TokenMissingException extends HttpException {
    constructor() {
        super(
            { message: 'Token is missing', error: 'Unauthorized' },
            HttpStatus.UNAUTHORIZED,
        );
    }
}

export class JwtMalformedException extends HttpException {
    constructor() {
        super(
            { message: 'Token is invalid', error: 'Bad Request' },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class LoginRequiredException extends HttpException {
    constructor() {
        super(
            { message: 'Should login again', error: 'Forbidden' },
            HttpStatus.FORBIDDEN,
        );
    }
}

export class InvalidDatetimeException extends HttpException {
    constructor(message: string) {
        super({ message, error: 'Bad Request' }, HttpStatus.BAD_REQUEST);
    }
}

export class ItemNotFoundException extends HttpException {
    constructor() {
        super(
            { message: 'Item not found', error: 'Not Found' },
            HttpStatus.NOT_FOUND,
        );
    }
}

export class ItemUpdateNotAllowedException extends HttpException {
    constructor() {
        super(
            { message: 'Not allowed', error: 'Bad Request' },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class ItemUpdateFailedException extends HttpException {
    constructor() {
        super(
            { message: 'Item update failed', error: 'Internal Server Error' },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}

export class AccessNotAllowedException extends HttpException {
    constructor() {
        super(
            { message: 'Access not allowed', error: 'Forbidden' },
            HttpStatus.FORBIDDEN,
        );
    }
}
