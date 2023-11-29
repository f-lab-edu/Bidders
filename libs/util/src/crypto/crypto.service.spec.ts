import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
    let service: CryptoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CryptoService],
        }).compile();

        service = module.get(CryptoService);
    });

    it('generates hash', async () => {
        const hashed = await service.hash('mypassword');
        console.log('hashed', hashed);
        expect(hashed).toBeDefined();
    });

    it('compares origin data and hashed data', async () => {
        const hashed = await service.hash('mypassword');
        const match = await service.compare('mypassword', hashed);
        console.log('match', match);
        expect(match).toBe(true);
    });
});
