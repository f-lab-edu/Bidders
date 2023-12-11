import { AppDataSource } from '@libs/database';
import { User } from '../src/user/entities/user.entity';
import { Category } from '../src/category/entities/category.entity';
import { AuctionItem } from '../src/auction-item/entities/auction-item.entity';
import { Bid } from '../src/bid/entities/bid.entity';

global.afterAll(async () => {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);
    const categoryRepo = AppDataSource.getRepository(Category);
    const auctionItemRepo = AppDataSource.getRepository(AuctionItem);
    const bidRepo = AppDataSource.getRepository(Bid);

    await userRepo.delete({});
    await categoryRepo.delete({});
    await auctionItemRepo.delete({});
    await bidRepo.delete({});

    await AppDataSource.destroy();
});
