import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
    @ApiProperty({
        required: true,
        description: '사용자 이메일',
        example: 'test@bidders.com',
    })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        required: true,
        description: '사용자 비밀번호',
        example: 'hello$world!',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
