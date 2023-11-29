import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
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
        description: '패스워드',
        example: 'hello$world!',
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        required: true,
        description: '사용자 닉네임',
        example: '비더스',
    })
    @IsString()
    @IsNotEmpty()
    username: string;
}
