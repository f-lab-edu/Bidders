import {
    Body,
    Controller,
    Get,
    Post,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../services/user.service';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import {
    ApiAuthGuard,
    HttpExceptionFilter,
    SerializeInterceptor,
} from '@libs/common';
import { CreateUserDto, SignInDto, SignSuccessDto, UserDto } from '@libs/dto';
import { User } from '@libs/common/decorators';
import { IUserPayload } from '@libs/util/jwt';

@ApiTags('User')
@Controller('user')
@UseFilters(HttpExceptionFilter)
export class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @ApiOperation({ summary: '사용자 회원가입' })
    @ApiCreatedResponse({ description: '회원가입 성공', type: SignSuccessDto })
    @Post('signup')
    async signUp(@Body() createUserDto: CreateUserDto) {
        return await this.authService.signup(createUserDto);
    }

    @ApiOperation({ summary: '사용자 로그인' })
    @ApiCreatedResponse({ description: '로그인 성공', type: SignSuccessDto })
    @Post('signin')
    async signIn(@Body() singInDto: SignInDto) {
        return await this.authService.signin(singInDto);
    }

    @ApiOperation({ summary: '사용자 정보 조회' })
    @ApiOkResponse({ description: '사용자 정보', type: UserDto })
    @ApiBearerAuth('bearerAuth')
    @UseGuards(ApiAuthGuard)
    @UseInterceptors(new SerializeInterceptor(UserDto))
    @Get('me')
    async me(@User() user: IUserPayload) {
        return await this.userService.findOne(user.id);
    }
}
