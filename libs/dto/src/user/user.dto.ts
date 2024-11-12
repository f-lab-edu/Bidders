import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDto {
    @ApiProperty({
        description: '사용자 id',
        example: '507asdff-c3c4-46f0-ad38-29d60qwer9',
    })
    @Expose()
    id: string;

    @ApiProperty({
        description: '사용자 이메일',
        example: 'test@bidders.com',
    })
    @Expose()
    email: string;

    @ApiProperty({ description: '사용자 닉네임', example: '비더스' })
    @Expose()
    username: string;
}
