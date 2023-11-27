import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@libs/util/jwt';

@Injectable()
export class ApiAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers['authorization'];
        if (!authorizationHeader)
            throw new BadRequestException('api-token is null');

        const token = authorizationHeader.split('Bearer ')[1];
        const payload = this.decode(token);
        request.user = { id: payload.id, email: payload.email };

        return true;
    }

    private decode(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        } catch (error) {
            if (error.message === 'JWT_MALFORMED')
                throw new UnauthorizedException('api-token is invalid');
        }
    }
}
