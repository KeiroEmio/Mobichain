import express from 'express';
import DB from '../models/db.js';
import { recordNotFound, sendError, sendValid } from '../helpers/response_helper.js';

const   router = express.Router();

// 添加商品
router.post('/add', async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            brand,
            owner,
            imagePath,
            txHash,
            from,
            to,
            blockNumber,
            productCount,
            blockHash,
            uid
        } = req.body;

        const productData = {
            name,
            description,
            category,
            price,
            brand,
            owner_address: owner,
            photo: imagePath,
            is_sold: 0,
            tx_hash: txHash,
            from: from,
            to: to,
            block_number: blockNumber,
            block_hash: blockHash,
            productCount,
            uid
        };

        console.log("productData:", productData);
        const product = await DB.Products.create(productData);
        return sendValid(res, { message: "商品添加成功", data: product });
    } catch (err) {
        console.error('添加商品失败:', err);
        return sendError(res, err);
    }
});

// 获取商品列表
router.get('/list', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const { address, search, minPrice, maxPrice } = req.query;

        console.log("req.query:", req.query);
        const whereClause = {
            is_sold: 0,
            ...(address ? {
                owner_address: {
                    [DB.op.ne]: address 
                }
            } : {})
        };

        // 添加价格范围条件
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[DB.op.gte] = minPrice;
            if (maxPrice) whereClause.price[DB.op.lte] = maxPrice;
        }

        // 添加搜索条件（模糊搜索名称、品牌和类别）
        if (search) {
            console.log("search:", search);
            whereClause[DB.op.or] = [
                { name: { [DB.op.like]: `%${search}%` } },
                { brand: { [DB.op.like]: `%${search}%` } },
                { category: { [DB.op.like]: `%${search}%` } }
            ];
        }
        
        const products = await DB.Products.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return sendValid(res, products);
    } catch (err) {
        return sendError(res, err);
    }
});

// 获取单个商品详情
router.get('/view/:id', async (req, res) => {
    try {
        const product = await DB.Products.findByPk(req.params.id);
        if (!product) {
            return recordNotFound(res);
        }
        return sendValid(res, product);
    } catch (err) {
        return sendError(res, err);
    }
});

// 更新商品状态（比如标记为已售）
router.put('/update/:id', async (req, res) => {
    try {
        const product = await DB.Products.findByPk(req.params.id);
        if (!product) {
            return recordNotFound(res);
        }

        await product.update(req.body);
        return sendValid(res, { message: "商品信息更新成功", data: product });
    } catch (err) {
        return sendError(res, err);
    }
});

// 获取用户的商品列表
router.get('/user/:address', async (req, res) => {
    try {
        const products = await DB.Products.findAll({
            where: {
                owner_address: req.params.address
            },
            order: [['created_at', 'DESC']]
        });
        return sendValid(res, products);
    } catch (err) {
        return sendError(res, err);
    }
});

// 更新交易信息
router.put('/transaction/:id', async (req, res) => {
    try {
        const { tx_hash, block_number, block_hash, from, to } = req.body;
        const product = await DB.Products.findByPk(req.params.id);

        if (!product) {
            return recordNotFound(res);
        }

        await product.update({
            tx_hash,
            block_number,
            block_hash,
            from,
            to
        });

        return sendValid(res, { message: "交易信息更新成功", data: product });
    } catch (err) {
        return sendError(res, err);
    }
});

// 更新交易信息
router.put('/transaction/:id', async (req, res) => {
    try {
        const { tx_hash, block_number, block_hash, from, to } = req.body;
        const product = await DB.Products.findByPk(req.params.id);

        if (!product) {
            return recordNotFound(res);
        }

        await product.update({
            tx_hash,
            block_number,
            block_hash,
            from,
            to
        });

        return sendValid(res, { message: "交易信息更新成功", data: product });
    } catch (err) {
        return sendError(res, err);
    }
});

// 记录已售出商品信息
router.post('/sold', async (req, res) => {
    // 开启事务
    const t = await DB.sequelize.transaction();

    try {
        const {
            pid,
            buyer_address,
            seller_address,
            price,
            tx_hash,
            block_number,
            block_hash,
            uid,
        } = req.body;

        const product = await DB.Products.findByPk(pid, { transaction: t });
        if (!product) {
            await t.rollback();
            return recordNotFound(res, "商品不存在");
        }
        const soldProductData = {
            pid,
            buyer_address,
            seller_address: seller_address || product.owner_address,
            price: price || product.price, 
            tx_hash,
            block_number,
            block_hash,
            payment_status: 1,
            uid,
        };

        const soldProduct = await DB.SoldProducts.create(soldProductData, { transaction: t });

        await product.update({
            is_sold: 1,
        }, { transaction: t });

        // 提交事务
        await t.commit();

        return sendValid(res, { 
            message: "商品交易记录已保存", 
            data: {
                soldProduct,
                product
            }
        });
    } catch (err) {
        await t.rollback();
        console.error('记录已售出商品失败:', err);
        return sendError(res, err);
    }
});

//列表未售出商品根据用户的地址
router.get('/unsold/:address', async (req, res) => {
    try {
        const products = await DB.Products.findAll({
            where: {
                owner_address: req.params.address,
                is_sold: 0 
            },
            order: [['created_at', 'DESC']]
        });
        
        return sendValid(res, {
            message: "获取未售出商品列表成功",
            data: products
        });
    } catch (err) {
        console.error('获取未售出商品列表失败:', err);
        return sendError(res, err);
    }
});

//展示已经售卖的商品
router.get('/isold/:address', async (req, res) => {
    try {
        const soldProducts = await DB.SoldProducts.findAll({
            where: {
                buyer_address: req.params.address
            },
            include: [
                {
                    model: DB.Products,
                    as: 'product',
                    required: true
                }
            ],
            order: [['transaction_time', 'DESC']]
        });
        
        if (!soldProducts || soldProducts.length === 0) {
            return sendValid(res, {
                message: "暂无已售出商品",
                data: []
            });
        }
        
        return sendValid(res, {
            message: "获取已售出商品列表成功",
            data: soldProducts
        });
    } catch (err) {
        console.error('获取已售出商品列表失败:', err);
        return sendError(res, err);
    }
});

router.post('/confirmReceipt', async (req, res) => {
    try {
        const { tx_hash,receipt_tx } = req.body;
        
        if (!tx_hash) {
            return sendError(res, new Error('交易哈希不能为空'));
        }
        
        // 查找对应的交易记录
        const soldProduct = await DB.SoldProducts.findOne({
            where: { tx_hash }
        });
        
        if (!soldProduct) {
            return recordNotFound(res, "找不到对应的交易记录");
        }
        
        // 更新收货状态
        await soldProduct.update({
            is_received: 1,
            receipt_tx:receipt_tx,
            receipt_time: new Date()
        });
        
        return sendValid(res, {
            message: "确认收货成功",
            data: soldProduct
        });
    } catch (err) {
        console.error('确认收货失败:', err);
        return sendError(res, err);
    }
});

export default router;