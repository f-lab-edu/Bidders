import { HttpException, HttpStatus } from '@nestjs/common';

/* User Module */

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

/* Authorization */

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

/* Auction-Item Module */

export class InvalidDatetimeException extends HttpException {
    constructor(message: string) {
        super({ message, error: 'Bad Request' }, HttpStatus.BAD_REQUEST);
    }
}

export class InvalidCategoryException extends HttpException {
    constructor() {
        super(
            { message: 'Invalid category code', error: 'Bad Request' },
            HttpStatus.BAD_REQUEST,
        );
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

export class ItemAccessNotAllowedException extends HttpException {
    constructor() {
        super(
            { message: 'Access not allowed', error: 'Forbidden' },
            HttpStatus.FORBIDDEN,
        );
    }
}

/* Category Module */

export class DuplicateCategoryException extends HttpException {
    constructor() {
        super(
            { message: 'Category code in use', error: 'Conflict' },
            HttpStatus.CONFLICT,
        );
    }
}

export class CategoryNotFoundException extends HttpException {
    constructor() {
        super(
            { message: 'Category not found', error: 'Not Found' },
            HttpStatus.NOT_FOUND,
        );
    }
}

export class CategoryUpdateFailedException extends HttpException {
    constructor() {
        super(
            {
                message: 'Category update failed',
                error: 'Internal Server Error',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}

/* Bid Module */

export class BidNotFoundException extends HttpException {
    constructor() {
        super(
            { message: 'Bid not found', error: 'Not Found' },
            HttpStatus.NOT_FOUND,
        );
    }
}

export class BidCreationNotAllowedException extends HttpException {
    constructor(message: string) {
        super(
            {
                message,
                error: 'Bad Request',
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class BidAccessNotAllowedException extends HttpException {
    constructor() {
        super(
            { message: 'Access not allowed', error: 'Forbidden' },
            HttpStatus.FORBIDDEN,
        );
    }
}

export class BidUpdateNotAllowedException extends HttpException {
    constructor(message: string) {
        super({ message, error: 'Bad Request' }, HttpStatus.BAD_REQUEST);
    }
}

export class BidUpdateFailedException extends HttpException {
    constructor() {
        super(
            { message: 'Bid update failed', error: 'Internal Server Error' },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}

/* Auction Result Module */

export class InvalidAuctionResultException extends HttpException {
    constructor() {
        super(
            { message: 'Invalid auction result', error: 'Bad Request' },
            HttpStatus.BAD_REQUEST,
        );
    }
}
