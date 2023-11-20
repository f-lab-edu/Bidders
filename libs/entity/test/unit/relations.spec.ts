import { User } from '@libs/entity';
import { AuctionItem } from '@libs/entity/auction-item';
import { AuctionResult } from '@libs/entity/auction-result';
import { Bid } from '@libs/entity/bid';
import { Category } from '@libs/entity/category';
import { AppDataSource } from '@libs/type-orm-config/mysql-typeorm.config';
import { Repository } from 'typeorm';

describe('Entity Relations', () => {
    let categoryRepo: Repository<Category>;
    let userRepo: Repository<User>;
    let auctionItemRepo: Repository<AuctionItem>;
    let bidRepo: Repository<Bid>;
    let auctionResultRepo: Repository<AuctionResult>;

    beforeAll(async () => {
        await AppDataSource.initialize(); // Performs connection to the database
        categoryRepo = AppDataSource.getRepository(Category);
        userRepo = AppDataSource.getRepository(User);
        auctionItemRepo = AppDataSource.getRepository(AuctionItem);
        bidRepo = AppDataSource.getRepository(Bid);
        auctionResultRepo = AppDataSource.getRepository(AuctionResult);
    });

    beforeEach(async () => {
        const categoryData = [
            { c_code: '0000', c_name: '기본' },
            { c_code: '0001', c_name: '의류' },
        ];
        const category = categoryRepo.create(categoryData);
        await categoryRepo.save(category);

        const userData = {
            username: 'bitkunst',
            email: 'test@gmail.com',
            password: '1234',
        };
        const user = userRepo.create(userData);
        const savedUser = await userRepo.save(user);

        const itemData = [
            {
                c_code: '0000',
                title: '기본 상품',
                content: '기본 상품 상세 설명',
                user_id: savedUser.id,
                start_datetime: new Date('2023-11-21 15:00:00'),
                end_datetime: new Date('2023-11-22 15:00:00'),
                start_price: 1000,
            },
            {
                c_code: '0001',
                title: '의류 상품',
                content: '의류 상품 상세 설명',
                user_id: savedUser.id,
                start_datetime: new Date('2023-11-21 15:00:00'),
                end_datetime: new Date('2023-11-22 15:00:00'),
                start_price: 2000,
            },
        ];
        const auctionItem = auctionItemRepo.create(itemData);
        await auctionItemRepo.save(auctionItem);

        const [item] = await auctionItemRepo.find();
        const bidData = [
            { item_id: item.id, user_id: savedUser.id, bid_amount: 5000 },
            { item_id: item.id, user_id: savedUser.id, bid_amount: 6000 },
            { item_id: item.id, user_id: savedUser.id, bid_amount: 7000 },
        ];
        const bid = bidRepo.create(bidData);
        await bidRepo.save(bid);

        const winningBid = await bidRepo
            .createQueryBuilder()
            .orderBy('bid_amount', 'DESC')
            .getOne();
        const winningItem = await auctionItemRepo
            .createQueryBuilder()
            .where('id = :id', { id: winningBid.item_id })
            .getOne();
        const auctionResultData = {
            item_id: winningItem.id,
            winning_bid_id: winningBid.id,
            final_price: winningBid.bid_amount,
        };
        const auctionResult = auctionResultRepo.create(auctionResultData);
        await auctionResultRepo.save(auctionResult);
    });

    afterAll(async () => {
        const categories = await categoryRepo.find();
        const users = await userRepo.find();
        const auctionItems = await auctionItemRepo.find();

        await categoryRepo.remove(categories);
        await userRepo.remove(users);
        await auctionItemRepo.remove(auctionItems);

        await AppDataSource.destroy(); // Closes connection with the database
    });

    it('Get auction item', async () => {
        const [auctionItem] = await auctionItemRepo.find();
        const item = await auctionItemRepo.findOne({
            where: { id: auctionItem.id },
            relations: ['user', 'category'],
        });
        console.log('auction item', item);
    });

    it('Get user with auction items', async () => {
        const [user] = await userRepo.find();
        const userWithAuctionItems = await userRepo.findOne({
            where: { id: user.id },
            relations: ['auction_items'],
        });
        console.log('user with auction items', userWithAuctionItems);
    });

    it('Update category', async () => {
        await categoryRepo.update('0001', { c_code: '0002' });
        const item = await auctionItemRepo.findOne({
            where: { c_code: '0002' },
        });
        expect(item.c_code).toBe('0002');
    });

    it('Delete category', async () => {
        await categoryRepo.delete('0000');
        const item = await auctionItemRepo.findOne({
            where: { c_code: null },
        });
        expect(item.c_code).toBe(null);
    });

    it('Delete user', async () => {
        const [user] = await userRepo.find();
        const userIdx = user.id;

        await userRepo.remove(user);
        const item = await auctionItemRepo.findOne({
            where: { user_id: userIdx },
        });
        expect(item).toBe(null);
    });

    it('Delete auction item', async () => {
        const [item] = await auctionItemRepo.find();
        await auctionItemRepo.remove(item);

        const [user] = await userRepo.find({ relations: ['auction_items'] });
        console.log('user', user);
    });

    it('Select bids', async () => {
        const bids = await bidRepo.find();
        console.log('bids', bids);
    });

    it('Bids after delete item', async () => {
        const bids = await bidRepo.find();
        console.log('bids', bids);

        await auctionItemRepo.delete(bids[0].item_id);
        const bidsAfterDelete = await bidRepo.find();
        console.log('bids after delete item', bidsAfterDelete);
    });

    it('Get auction item with bids', async () => {
        const [item] = await auctionItemRepo.find();
        const itemWithBids = await auctionItemRepo.findOne({
            where: { id: item.id },
            relations: ['bids'],
        });
        console.log('itemWithBids', itemWithBids);
    });

    it('Get auction item with result', async () => {
        const items = await auctionItemRepo.find({
            relations: ['auction_result'],
        });
        console.log('items', items);
    });

    it('Get bid with result', async () => {
        const bids = await bidRepo.find({ relations: ['auction_result'] });
        console.log('bids', bids);
    });
});
