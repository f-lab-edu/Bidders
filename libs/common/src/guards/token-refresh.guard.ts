import { IUserPayload, JwtService } from '@libs/util/jwt';
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TokenRefreshGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers['authorization'];
        if (!authorizationHeader)
            throw new BadRequestException('refresh-token is null');

        const rtk = authorizationHeader.split('Bearer ')[1];
        const payload = this.decodeToken(rtk);
        await this.checkRtkValidity(payload, rtk);

        const tokens = await this.jwtService.generateTokens(payload, {
            atk_expire: '1h',
            rtk_expire: '1d',
        });
        request.token = tokens;

        return true;
    }

    async checkRtkValidity(payload: IUserPayload, rtk: string) {
        const isValidate = await this.jwtService.validateRtk(payload.id, rtk);
        if (!isValidate) {
            this.jwtService.delete(payload.id);
            throw new ForbiddenException('Should login again');
        }
    }

    private decodeToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        } catch (error) {
            if (error.message === 'JWT_MALFORMED')
                throw new UnauthorizedException('refresh-token is invalid');
        }
    }
}
