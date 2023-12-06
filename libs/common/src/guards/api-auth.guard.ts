import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@libs/util/jwt';
import { TokenMissingException } from '../exceptions';

@Injectable()
export class ApiAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers['authorization'];
        if (!authorizationHeader) throw new TokenMissingException();

        const token = authorizationHeader.split('Bearer ')[1];
        const payload = this.decodeToken(token);
        request.user = { id: payload.id, email: payload.email };

        return true;
    }

    private decodeToken(token: string) {
        const decoded = this.jwtService.verify(token);
        return decoded;
    }
}
