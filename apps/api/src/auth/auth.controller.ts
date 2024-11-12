import { Token, TokenRefreshGuard } from '@libs/common';
import { SignSuccessDto } from '@libs/dto';
import { IToken } from '@libs/util/jwt';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    @ApiOperation({ summary: '엑세스 토큰 갱신' })
    @ApiOkResponse({ description: 'atk & rtk 갱신', type: SignSuccessDto })
    @ApiBearerAuth('bearerAuth')
    @UseGuards(TokenRefreshGuard)
    @Get('refresh')
    refreshToken(@Token() token: IToken) {
        return token;
    }
}
