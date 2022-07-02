"use strict";

var Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable "Collection", deps: []
 * createTable "Orders", deps: []
 * createTable "ProductAttribute", deps: []
 * createTable "Tag", deps: []
 * createTable "Token", deps: []
 * createTable "VendorSettlement", deps: []
 * createTable "User", deps: []
 * createTable "Store", deps: [User]
 * createTable "Category", deps: [Category]
 * createTable "Product", deps: [Store]
 * createTable "ProductVariation", deps: [Product]
 * createTable "Coupon", deps: [User]
 * createTable "CategoryProduct", deps: [Product, Category]
 * createTable "CollectionProduct", deps: [Product, Collection]
 * createTable "CouponUser", deps: [Coupon, User]
 * createTable "CreditCode", deps: [User]
 * createTable "CreditCodeUser", deps: [CreditCode]
 * createTable "Cart", deps: [User, ProductVariation]
 * createTable "FlashSales", deps: [ProductVariation]
 * createTable "MediaFolder", deps: [MediaFolder]
 * createTable "MediaFiles", deps: [MediaFolder]
 * createTable "OrdersAddress", deps: [Orders]
 * createTable "CouponStore", deps: [Coupon, Store]
 * createTable "OrdersPayment", deps: [Orders]
 * createTable "StoreOrders", deps: [Orders, Store]
 * createTable "ProductAttributeSets", deps: [ProductAttribute]
 * createTable "FlashSalesProducts", deps: [FlashSales, ProductVariation]
 * createTable "CouponProduct", deps: [Coupon, Product]
 * createTable "StoreOrdersProduct", deps: [StoreOrders]
 * createTable "ProductDiscount", deps: [ProductVariation]
 * createTable "ProductVariationWithAttributeSet", deps: [ProductVariation, ProductAttributeSets]
 * createTable "ProductWithAttribute", deps: [Product]
 * createTable "RelatedProduct", deps: [Product, Product]
 * createTable "ProductRating", deps: [User, Product, Store]
 * createTable "TagProduct", deps: [Tag, Product]
 * createTable "UserAddress", deps: [User]
 * createTable "UserWallet", deps: [User]
 * createTable "Wishlist", deps: [Product, User]
 * createTable "Withdrawal", deps: [User]
 * addIndex "category_parent_id" to table "Category"
 * addIndex "coupon_product_coupon_code" to table "CouponProduct"
 * addIndex "coupon_store_coupon_code" to table "CouponStore"
 * addIndex "coupon_user_coupon_code" to table "CouponUser"
 * addIndex "credit_code_user_credit_code" to table "CreditCodeUser"
 * addIndex "flash_sales_products_flash_sale_id" to table "FlashSalesProducts"
 * addIndex "media_files_folder_id" to table "MediaFiles"
 * addIndex "store_orders_order_id" to table "StoreOrders"
 * addIndex "store_orders_store_id" to table "StoreOrders"
 * addIndex "orders_payment_order_id" to table "OrdersPayment"
 * addIndex "store_orders_product_sub_order_id" to table "StoreOrdersProduct"
 * addIndex "product_attribute_sets_attribute_id" to table "ProductAttributeSets"
 * addIndex "product_discount_variation_id" to table "ProductDiscount"
 * addIndex "product_name" to table "Product"
 * addIndex "product_store_id" to table "Product"
 * addIndex "product_status_slug" to table "Product"
 * addIndex "product_rating_product_id" to table "ProductRating"
 * addIndex "product_rating_store_id" to table "ProductRating"
 * addIndex "product_variation_product_id" to table "ProductVariation"
 * addIndex "related_product_product_id" to table "RelatedProduct"
 * addIndex "store_user_id" to table "Store"
 * addIndex "user_wallet_user_id" to table "UserWallet"
 * addIndex "wishlist_user_id" to table "Wishlist"
 * addIndex "withdrawal_user_id" to table "Withdrawal"
 *
 **/

var info = {
  revision: 1,
  name: "noname",
  created: "2022-03-20T10:10:54.650Z",
  comment: "",
};

var migrationCommands = [
  {
    fn: "createTable",
    params: [
      "Collection",
      {
        collection_id: {
          type: Sequelize.STRING,
          field: "collection_id",
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING,
          field: "slug",
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.STRING,
          field: "description",
        },
        image: {
          type: Sequelize.STRING,
          field: "image",
        },
        status: {
          type: Sequelize.ENUM("pending", "published"),
          field: "status",
          defaultValue: "published",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Orders",
      {
        order_id: {
          type: Sequelize.STRING,
          field: "order_id",
          primaryKey: true,
        },
        amount: {
          type: Sequelize.FLOAT,
          field: "amount",
          allowNull: false,
        },
        sub_total: {
          type: Sequelize.FLOAT,
          field: "sub_total",
          allowNull: false,
        },
        coupon_code: {
          type: Sequelize.STRING,
          field: "coupon_code",
        },
        coupon_amount: {
          type: Sequelize.FLOAT,
          field: "coupon_amount",
          allowNull: false,
        },
        shipping_amount: {
          type: Sequelize.FLOAT,
          field: "shipping_amount",
          defaultValue: 0,
        },
        tax_amount: {
          type: Sequelize.FLOAT,
          field: "tax_amount",
          defaultValue: 0,
        },
        purchased_by: {
          type: Sequelize.STRING,
          field: "purchased_by",
          allowNull: false,
        },
        payed_from_wallet: {
          type: Sequelize.BOOLEAN,
          field: "payed_from_wallet",
          defaultValue: false,
        },
        payment_completed: {
          type: Sequelize.BOOLEAN,
          field: "payment_completed",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductAttribute",
      {
        attribute_id: {
          type: Sequelize.STRING,
          field: "attribute_id",
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        desc: {
          type: Sequelize.STRING,
          field: "desc",
        },
        active: {
          type: Sequelize.BOOLEAN,
          field: "active",
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          field: "deletedAt",
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Tag",
      {
        tag_id: {
          type: Sequelize.STRING,
          field: "tag_id",
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING,
          field: "slug",
          allowNull: false,
          unique: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          field: "is_active",
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Token",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          comment: "Token Id",
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.STRING,
          field: "user_id",
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING,
          field: "type",
          defaultValue: "refresh",
        },
        token: {
          type: Sequelize.STRING,
          field: "token",
          allowNull: false,
        },
        expires: {
          type: Sequelize.DATE,
          field: "expires",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "VendorSettlement",
      {
        settlement_id: {
          type: Sequelize.STRING,
          field: "settlement_id",
          primaryKey: true,
        },
        sub_order_ids: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          field: "sub_order_ids",
          allowNull: false,
        },
        amount: {
          type: Sequelize.FLOAT,
          field: "amount",
          allowNull: false,
        },
        store_id: {
          type: Sequelize.STRING,
          field: "store_id",
          allowNull: false,
        },
        processed: {
          type: Sequelize.BOOLEAN,
          field: "processed",
          defaultValue: false,
        },
        processed_at: {
          type: Sequelize.DATE,
          field: "processed_at",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "User",
      {
        user_id: {
          type: Sequelize.STRING,
          field: "user_id",
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          field: "email",
          validate: {
            isEmail: true,
          },
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          field: "phone",
        },
        photo: {
          type: Sequelize.STRING,
          field: "photo",
        },
        role: {
          type: Sequelize.ENUM("user", "vendor", "support", "admin1", "admin2", "admin3", "superadmin", "omegaadmin"),
          field: "role",
          defaultValue: "user",
        },
        last_login: {
          type: Sequelize.DATE,
          field: "last_login",
          defaultValue: Sequelize.Date,
        },
        suspended: {
          type: Sequelize.BOOLEAN,
          field: "suspended",
          defaultValue: false,
        },
        password: {
          type: Sequelize.STRING,
          field: "password",
          allowNull: false,
        },
        bank_details: {
          type: Sequelize.JSONB,
          field: "bank_details",
          defaultValue: Sequelize.Object,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Store",
      {
        store_id: {
          type: Sequelize.STRING,
          field: "store_id",
          unique: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "user_id",
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          field: "email",
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          field: "phone",
        },
        slug: {
          type: Sequelize.STRING,
          field: "slug",
          unique: true,
          allowNull: false,
        },
        logo: {
          type: Sequelize.STRING,
          field: "logo",
        },
        address: {
          type: Sequelize.STRING,
          field: "address",
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING,
          field: "city",
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          field: "state",
          allowNull: false,
        },
        country: {
          type: Sequelize.STRING,
          field: "country",
          defaultValue: "US",
        },
        description: {
          type: Sequelize.TEXT,
          field: "description",
        },
        rating: {
          type: Sequelize.INTEGER,
          field: "rating",
          defaultValue: 5,
        },
        verified: {
          type: Sequelize.BOOLEAN,
          field: "verified",
          defaultValue: false,
        },
        verified_at: {
          type: Sequelize.DATE,
          field: "verified_at",
          defaultValue: Sequelize.Date,
        },
        disable_store: {
          type: Sequelize.BOOLEAN,
          field: "disable_store",
          defaultValue: false,
        },
        store_percentage: {
          type: Sequelize.INTEGER,
          field: "store_percentage",
          defaultValue: 90,
        },
        settings: {
          type: Sequelize.JSONB,
          field: "settings",
          defaultValue: Sequelize.Object,
        },
        bank_details: {
          type: Sequelize.JSONB,
          field: "bank_details",
          defaultValue: Sequelize.Object,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Category",
      {
        category_id: {
          type: Sequelize.STRING,
          field: "category_id",
          unique: true,
          comment: "Category Id",
          primaryKey: true,
        },
        parent_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Category",
            key: "category_id",
          },
          allowNull: true,
          field: "parent_id",
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        desc: {
          type: Sequelize.STRING,
          field: "desc",
        },
        icon: {
          type: Sequelize.STRING,
          field: "icon",
        },
        active: {
          type: Sequelize.BOOLEAN,
          field: "active",
          defaultValue: true,
        },
        is_featured: {
          type: Sequelize.BOOLEAN,
          field: "is_featured",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Product",
      {
        product_id: {
          type: Sequelize.STRING,
          field: "product_id",
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING,
          field: "slug",
          allowNull: false,
          unique: true,
        },
        desc: {
          type: Sequelize.TEXT,
          field: "desc",
        },
        images: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          field: "images",
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM("published", "draft", "pending", "blocked"),
          field: "status",
          defaultValue: "pending",
        },
        is_featured: {
          type: Sequelize.BOOLEAN,
          field: "is_featured",
          defaultValue: false,
        },
        store_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Store",
            key: "store_id",
          },
          field: "store_id",
          allowNull: false,
        },
        is_approved: {
          type: Sequelize.BOOLEAN,
          field: "is_approved",
          defaultValue: false,
        },
        approved_by: {
          type: Sequelize.STRING,
          field: "approved_by",
        },
        created_by: {
          type: Sequelize.STRING,
          field: "created_by",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          field: "deletedAt",
        },
        attribute_id: {
          type: Sequelize.STRING,
          field: "attribute_id",
          allowNull: true,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductVariation",
      {
        variation_id: {
          type: Sequelize.STRING,
          field: "variation_id",
          unique: true,
          primaryKey: true,
        },
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Product",
            key: "product_id",
          },
          field: "product_id",
          allowNull: false,
        },
        sku: {
          type: Sequelize.STRING,
          field: "sku",
        },
        price: {
          type: Sequelize.FLOAT,
          field: "price",
          allowNull: false,
        },
        with_storehouse_management: {
          type: Sequelize.BOOLEAN,
          field: "with_storehouse_management",
          defaultValue: true,
        },
        stock_status: {
          type: Sequelize.ENUM("instock", "outofstock", "onbackorder"),
          field: "stock_status",
          defaultValue: "instock",
        },
        stock_qty: {
          type: Sequelize.INTEGER,
          field: "stock_qty",
          defaultValue: 10,
        },
        max_purchase_qty: {
          type: Sequelize.INTEGER,
          field: "max_purchase_qty",
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          field: "is_default",
          defaultValue: false,
        },
        weight: {
          type: Sequelize.INTEGER,
          field: "weight",
        },
        length: {
          type: Sequelize.INTEGER,
          field: "length",
        },
        height: {
          type: Sequelize.INTEGER,
          field: "height",
        },
        width: {
          type: Sequelize.INTEGER,
          field: "width",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          field: "deletedAt",
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Coupon",
      {
        coupon_code: {
          type: Sequelize.STRING,
          field: "coupon_code",
          unique: true,
          primaryKey: true,
          allowNull: false,
          comment: "Class Comment Id",
        },
        coupon_apply_for: {
          type: Sequelize.ENUM("allorders", "user", "store", "product", "userproduct"),
          field: "coupon_apply_for",
          allowNull: false,
        },
        coupon_type: {
          type: Sequelize.ENUM("percentage", "fixedamount", "freeshipping"),
          field: "coupon_type",
          defaultValue: "percentage",
        },
        title: {
          type: Sequelize.STRING,
          field: "title",
          allowNull: false,
        },
        start_date: {
          type: Sequelize.DATE,
          field: "start_date",
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DATE,
          field: "end_date",
        },
        usage_limit: {
          type: Sequelize.INTEGER,
          field: "usage_limit",
          defaultValue: 10,
        },
        product_qty_limit: {
          type: Sequelize.INTEGER,
          field: "product_qty_limit",
        },
        usage_limit_per_user: {
          type: Sequelize.INTEGER,
          field: "usage_limit_per_user",
          defaultValue: 1,
        },
        created_by: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "created_by",
          allowNull: false,
        },
        percentage_discount: {
          type: Sequelize.INTEGER,
          field: "percentage_discount",
          allowNull: false,
        },
        max_coupon_amount: {
          type: Sequelize.INTEGER,
          field: "max_coupon_amount",
        },
        revoke: {
          type: Sequelize.BOOLEAN,
          field: "revoke",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "CategoryProduct",
      {
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Product",
            key: "product_id",
          },
          unique: "CategoryProduct_product_id_category_id_unique",
          field: "product_id",
          primaryKey: true,
          allowNull: false,
        },
        category_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Category",
            key: "category_id",
          },
          unique: "CategoryProduct_product_id_category_id_unique",
          field: "category_id",
          primaryKey: true,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "CollectionProduct",
      {
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Product",
            key: "product_id",
          },
          unique: "CollectionProduct_product_id_collection_id_unique",
          field: "product_id",
          primaryKey: true,
          allowNull: false,
        },
        collection_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Collection",
            key: "collection_id",
          },
          unique: "CollectionProduct_product_id_collection_id_unique",
          field: "collection_id",
          primaryKey: true,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "CouponUser",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        coupon_code: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Coupon",
            key: "coupon_code",
          },
          field: "coupon_code",
          allowNull: false,
        },
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "user_id",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "CreditCode",
      {
        credit_code: {
          type: Sequelize.STRING,
          field: "credit_code",
          unique: true,
          primaryKey: true,
          allowNull: false,
          comment: "Class Comment Id",
        },
        credit_type: {
          type: Sequelize.ENUM("all", "user"),
          field: "credit_type",
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING,
          field: "title",
          allowNull: false,
        },
        amount: {
          type: Sequelize.FLOAT,
          field: "amount",
          allowNull: false,
        },
        start_date: {
          type: Sequelize.DATE,
          field: "start_date",
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DATE,
          field: "end_date",
        },
        usage_limit: {
          type: Sequelize.INTEGER,
          field: "usage_limit",
          defaultValue: 10,
        },
        created_by: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "created_by",
          allowNull: false,
        },
        revoke: {
          type: Sequelize.BOOLEAN,
          field: "revoke",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "CreditCodeUser",
      {
        credit_code: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "CreditCode",
            key: "credit_code",
          },
          field: "credit_code",
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.STRING,
          field: "user_id",
          primaryKey: true,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Cart",
      {
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "user_id",
          primaryKey: true,
          allowNull: false,
        },
        variation_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "ProductVariation",
            key: "variation_id",
          },
          field: "variation_id",
          primaryKey: true,
          allowNull: false,
        },
        store_id: {
          type: Sequelize.STRING,
          field: "store_id",
          allowNull: false,
        },
        qty: {
          type: Sequelize.INTEGER,
          field: "qty",
          defaultValue: 1,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "FlashSales",
      {
        flash_sale_id: {
          type: Sequelize.STRING,
          field: "flash_sale_id",
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        start_date: {
          type: Sequelize.DATE,
          field: "start_date",
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DATE,
          field: "end_date",
          allowNull: false,
        },
        revoke: {
          type: Sequelize.BOOLEAN,
          field: "revoke",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        variation_id: {
          type: Sequelize.STRING,
          field: "variation_id",
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          references: {
            model: "ProductVariation",
            key: "variation_id",
          },
          allowNull: true,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "MediaFolder",
      {
        folder_id: {
          type: Sequelize.STRING,
          field: "folder_id",
          unique: true,
          allowNull: false,
          comment: "MediaFolder Id",
          primaryKey: true,
        },
        parent_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "MediaFolder",
            key: "folder_id",
          },
          allowNull: true,
          field: "parent_id",
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        desc: {
          type: Sequelize.STRING,
          field: "desc",
        },
        icon: {
          type: Sequelize.STRING,
          field: "icon",
        },
        created_by: {
          type: Sequelize.STRING,
          field: "created_by",
          comment: "Creator of the folder",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          field: "deletedAt",
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "MediaFiles",
      {
        file_id: {
          type: Sequelize.STRING,
          field: "file_id",
          unique: true,
          allowNull: false,
          comment: "MediaFiles Id",
          primaryKey: true,
        },
        folder_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "MediaFolder",
            key: "folder_id",
          },
          allowNull: true,
          field: "folder_id",
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        desc: {
          type: Sequelize.STRING,
          field: "desc",
        },
        icon: {
          type: Sequelize.STRING,
          field: "icon",
        },
        uploaded_by: {
          type: Sequelize.STRING,
          field: "uploaded_by",
          comment: "Creator of the folder",
          allowNull: false,
        },
        url: {
          type: Sequelize.STRING,
          field: "url",
          allowNull: false,
        },
        size_in_mb: {
          type: Sequelize.INTEGER,
          field: "size_in_mb",
          allowNull: false,
        },
        ext: {
          type: Sequelize.STRING,
          field: "ext",
          allowNull: false,
        },
        file_type: {
          type: Sequelize.ENUM("pdf", "image", "video"),
          field: "file_type",
          defaultValue: "image",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          field: "deletedAt",
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "OrdersAddress",
      {
        order_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Orders",
            key: "order_id",
          },
          field: "order_id",
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          field: "email",
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          field: "phone",
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING,
          field: "address",
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING,
          field: "city",
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          field: "state",
          allowNull: false,
        },
        country: {
          type: Sequelize.STRING,
          field: "country",
          allowNull: false,
        },
        zip_code: {
          type: Sequelize.INTEGER,
          field: "zip_code",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "CouponStore",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        coupon_code: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Coupon",
            key: "coupon_code",
          },
          field: "coupon_code",
          allowNull: false,
        },
        store_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Store",
            key: "store_id",
          },
          field: "store_id",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "OrdersPayment",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        order_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Orders",
            key: "order_id",
          },
          field: "order_id",
          allowNull: false,
        },
        payment_status: {
          type: Sequelize.ENUM("failed", "pending", "completed"),
          field: "payment_status",
          defaultValue: "pending",
        },
        payment_channel: {
          type: Sequelize.ENUM("paystack", "squad", "flutterwave", "refund"),
          field: "payment_channel",
          allowNull: false,
        },
        payment_reference: {
          type: Sequelize.STRING,
          field: "payment_reference",
          unique: true,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "StoreOrders",
      {
        sub_order_id: {
          type: Sequelize.STRING,
          field: "sub_order_id",
          allowNull: false,
          primaryKey: true,
        },
        order_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Orders",
            key: "order_id",
          },
          field: "order_id",
          allowNull: false,
        },
        store_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Store",
            key: "store_id",
          },
          field: "store_id",
          allowNull: false,
        },
        amount: {
          type: Sequelize.FLOAT,
          field: "amount",
          allowNull: false,
        },
        sub_total: {
          type: Sequelize.FLOAT,
          field: "sub_total",
          allowNull: false,
        },
        coupon_amount: {
          type: Sequelize.FLOAT,
          field: "coupon_amount",
          defaultValue: 0,
        },
        shipping_amount: {
          type: Sequelize.FLOAT,
          field: "shipping_amount",
          defaultValue: 0,
        },
        tax_amount: {
          type: Sequelize.FLOAT,
          field: "tax_amount",
          defaultValue: 0,
        },
        store_price: {
          type: Sequelize.FLOAT,
          field: "store_price",
          allowNull: false,
        },
        order_status: {
          type: Sequelize.ENUM("cancelled", "pending", "completed"),
          field: "order_status",
          defaultValue: "pending",
        },
        delivery_status: {
          type: Sequelize.ENUM(
            "not_approved",
            "approved",
            "picking",
            "delay_picking",
            "picked",
            "not_picked",
            "delivering",
            "delivered",
            "not_delivered",
            "audited",
            "cancelled"
          ),
          field: "delivery_status",
          defaultValue: "delivering",
        },
        refunded: {
          type: Sequelize.BOOLEAN,
          field: "refunded",
          defaultValue: false,
        },
        refunded_at: {
          type: Sequelize.DATE,
          field: "refunded_at",
        },
        delivered: {
          type: Sequelize.BOOLEAN,
          field: "delivered",
          defaultValue: false,
        },
        delivered_at: {
          type: Sequelize.DATE,
          field: "delivered_at",
        },
        cancelled_by: {
          type: Sequelize.STRING,
          field: "cancelled_by",
        },
        settled: {
          type: Sequelize.BOOLEAN,
          field: "settled",
          defaultValue: false,
        },
        settled_at: {
          type: Sequelize.DATE,
          field: "settled_at",
        },
        purchased_by: {
          type: Sequelize.STRING,
          field: "purchased_by",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          field: "deletedAt",
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductAttributeSets",
      {
        attribute_set_id: {
          type: Sequelize.STRING,
          field: "attribute_set_id",
          primaryKey: true,
        },
        attribute_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "ProductAttribute",
            key: "attribute_id",
          },
          field: "attribute_id",
          allowNull: false,
        },
        value: {
          type: Sequelize.STRING,
          field: "value",
          allowNull: false,
        },
        color: {
          type: Sequelize.STRING,
          field: "color",
        },
        image: {
          type: Sequelize.STRING,
          field: "image",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "FlashSalesProducts",
      {
        flash_sale_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "FlashSales",
            key: "flash_sale_id",
          },
          field: "flash_sale_id",
          primaryKey: true,
          allowNull: false,
        },
        variation_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "ProductVariation",
            key: "variation_id",
          },
          field: "variation_id",
          primaryKey: true,
          allowNull: false,
        },
        price: {
          type: Sequelize.FLOAT,
          field: "price",
          allowNull: false,
        },
        qty: {
          type: Sequelize.INTEGER,
          field: "qty",
          allowNull: false,
        },
        sold: {
          type: Sequelize.INTEGER,
          field: "sold",
          defaultValue: 0,
        },
        index: {
          type: Sequelize.INTEGER,
          field: "index",
          defaultValue: 0,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "CouponProduct",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        coupon_code: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Coupon",
            key: "coupon_code",
          },
          field: "coupon_code",
          allowNull: false,
        },
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Product",
            key: "product_id",
          },
          field: "product_id",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "StoreOrdersProduct",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        sub_order_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "StoreOrders",
            key: "sub_order_id",
          },
          field: "sub_order_id",
          allowNull: false,
        },
        variation_id: {
          type: Sequelize.STRING,
          field: "variation_id",
          allowNull: false,
        },
        product_id: {
          type: Sequelize.STRING,
          field: "product_id",
          allowNull: false,
        },
        price: {
          type: Sequelize.INTEGER,
          field: "price",
          allowNull: false,
        },
        purchased_price: {
          type: Sequelize.INTEGER,
          field: "purchased_price",
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        desc: {
          type: Sequelize.TEXT,
          field: "desc",
          allowNull: false,
        },
        qty: {
          type: Sequelize.INTEGER,
          field: "qty",
          allowNull: false,
        },
        weight: {
          type: Sequelize.INTEGER,
          field: "weight",
          allowNull: false,
        },
        variation_snapshot: {
          type: Sequelize.TEXT,
          field: "variation_snapshot",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductDiscount",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        variation_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "ProductVariation",
            key: "variation_id",
          },
          field: "variation_id",
          allowNull: false,
        },
        price: {
          type: Sequelize.FLOAT,
          field: "price",
          allowNull: false,
        },
        discount_from: {
          type: Sequelize.DATE,
          field: "discount_from",
          allowNull: false,
        },
        discount_to: {
          type: Sequelize.DATE,
          field: "discount_to",
        },
        revoke: {
          type: Sequelize.BOOLEAN,
          field: "revoke",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductVariationWithAttributeSet",
      {
        variation_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "ProductVariation",
            key: "variation_id",
          },
          unique: "ProductVariationWithAttributeSet_variation_id_attribute_set_id_unique",
          field: "variation_id",
          primaryKey: true,
        },
        attribute_set_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "ProductAttributeSets",
            key: "attribute_set_id",
          },
          unique: "ProductVariationWithAttributeSet_variation_id_attribute_set_id_unique",
          field: "attribute_set_id",
          primaryKey: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductWithAttribute",
      {
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Product",
            key: "product_id",
          },
          allowNull: true,
          field: "product_id",
          primaryKey: true,
        },
        attribute_id: {
          type: Sequelize.STRING,
          field: "attribute_id",
          primaryKey: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "RelatedProduct",
      {
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Product",
            key: "product_id",
          },
          field: "product_id",
          primaryKey: true,
          allowNull: false,
        },
        related_product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Product",
            key: "product_id",
          },
          field: "related_product_id",
          primaryKey: true,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductRating",
      {
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          allowNull: true,
          field: "user_id",
          primaryKey: true,
        },
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Product",
            key: "product_id",
          },
          allowNull: true,
          field: "product_id",
          primaryKey: true,
        },
        store_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "Store",
            key: "store_id",
          },
          field: "store_id",
          allowNull: false,
        },
        rating: {
          type: Sequelize.INTEGER,
          field: "rating",
          allowNull: false,
        },
        message: {
          type: Sequelize.STRING,
          field: "message",
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "TagProduct",
      {
        product_id: {
          type: Sequelize.STRING,
          field: "product_id",
          primaryKey: true,
          allowNull: false,
        },
        tag_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Tag",
            key: "tag_id",
          },
          unique: "TagProduct_tag_id_ProductProductId_unique",
          field: "tag_id",
          primaryKey: true,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        ProductProductId: {
          type: Sequelize.STRING,
          field: "ProductProductId",
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Product",
            key: "product_id",
          },
          unique: "TagProduct_tag_id_ProductProductId_unique",
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "UserAddress",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        address_id: {
          type: Sequelize.STRING,
          field: "address_id",
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "user_id",
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          field: "email",
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          field: "phone",
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING,
          field: "address",
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING,
          field: "city",
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          field: "state",
          allowNull: false,
        },
        country: {
          type: Sequelize.STRING,
          field: "country",
          allowNull: false,
        },
        zip_code: {
          type: Sequelize.INTEGER,
          field: "zip_code",
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          field: "is_default",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "UserWallet",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "user_id",
          allowNull: false,
          comment: "User's' Id",
        },
        amount: {
          type: Sequelize.FLOAT,
          field: "amount",
          allowNull: false,
        },
        fund_type: {
          type: Sequelize.ENUM("refund", "payment", "reg_bonus", "redeem_credit"),
          field: "fund_type",
          defaultValue: "refund",
        },
        payment_reference: {
          type: Sequelize.STRING,
          field: "payment_reference",
          allowNull: false,
          unique: true,
        },
        action_performed_by: {
          type: Sequelize.STRING,
          field: "action_performed_by",
          allowNull: false,
        },
        sub_order_id: {
          type: Sequelize.STRING,
          field: "sub_order_id",
        },
        credit_code: {
          type: Sequelize.STRING,
          field: "credit_code",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Wishlist",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        product_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model: "Product",
            key: "product_id",
          },
          field: "product_id",
          allowNull: false,
        },
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "user_id",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "Withdrawal",
      {
        withdrawal_id: {
          type: Sequelize.STRING,
          field: "withdrawal_id",
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.STRING,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: {
            model: "User",
            key: "user_id",
          },
          field: "user_id",
          allowNull: false,
        },
        amount: {
          type: Sequelize.FLOAT,
          field: "amount",
          allowNull: false,
        },
        amount_user_will_receive: {
          type: Sequelize.FLOAT,
          field: "amount_user_will_receive",
          allowNull: false,
        },
        charges: {
          type: Sequelize.FLOAT,
          field: "charges",
          allowNull: false,
        },
        processed: {
          type: Sequelize.BOOLEAN,
          field: "processed",
          defaultValue: false,
        },
        processed_at: {
          type: Sequelize.DATE,
          field: "processed_at",
        },
        is_declined: {
          type: Sequelize.BOOLEAN,
          field: "is_declined",
          defaultValue: false,
        },
        declined_reason: {
          type: Sequelize.STRING,
          field: "declined_reason",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Category",
      ["parent_id"],
      {
        indexName: "category_parent_id",
        name: "category_parent_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "CouponProduct",
      ["coupon_code"],
      {
        indexName: "coupon_product_coupon_code",
        name: "coupon_product_coupon_code",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "CouponStore",
      ["coupon_code"],
      {
        indexName: "coupon_store_coupon_code",
        name: "coupon_store_coupon_code",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "CouponUser",
      ["coupon_code"],
      {
        indexName: "coupon_user_coupon_code",
        name: "coupon_user_coupon_code",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "CreditCodeUser",
      ["credit_code"],
      {
        indexName: "credit_code_user_credit_code",
        name: "credit_code_user_credit_code",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "FlashSalesProducts",
      ["flash_sale_id"],
      {
        indexName: "flash_sales_products_flash_sale_id",
        name: "flash_sales_products_flash_sale_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "MediaFiles",
      ["folder_id"],
      {
        indexName: "media_files_folder_id",
        name: "media_files_folder_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "StoreOrders",
      ["order_id"],
      {
        indexName: "store_orders_order_id",
        name: "store_orders_order_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "StoreOrders",
      ["store_id"],
      {
        indexName: "store_orders_store_id",
        name: "store_orders_store_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "OrdersPayment",
      ["order_id"],
      {
        indexName: "orders_payment_order_id",
        name: "orders_payment_order_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "StoreOrdersProduct",
      ["sub_order_id"],
      {
        indexName: "store_orders_product_sub_order_id",
        name: "store_orders_product_sub_order_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "ProductAttributeSets",
      ["attribute_id"],
      {
        indexName: "product_attribute_sets_attribute_id",
        name: "product_attribute_sets_attribute_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "ProductDiscount",
      ["variation_id"],
      {
        indexName: "product_discount_variation_id",
        name: "product_discount_variation_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Product",
      ["name"],
      {
        indexName: "product_name",
        name: "product_name",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Product",
      ["store_id"],
      {
        indexName: "product_store_id",
        name: "product_store_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Product",
      ["status", "slug"],
      {
        indexName: "product_status_slug",
        name: "product_status_slug",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "ProductRating",
      ["product_id"],
      {
        indexName: "product_rating_product_id",
        name: "product_rating_product_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "ProductRating",
      ["store_id"],
      {
        indexName: "product_rating_store_id",
        name: "product_rating_store_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "ProductVariation",
      ["product_id"],
      {
        indexName: "product_variation_product_id",
        name: "product_variation_product_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "RelatedProduct",
      ["product_id"],
      {
        indexName: "related_product_product_id",
        name: "related_product_product_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Store",
      ["user_id"],
      {
        indexName: "store_user_id",
        name: "store_user_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "UserWallet",
      ["user_id"],
      {
        indexName: "user_wallet_user_id",
        name: "user_wallet_user_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Wishlist",
      ["user_id"],
      {
        indexName: "wishlist_user_id",
        name: "wishlist_user_id",
      },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Withdrawal",
      ["user_id"],
      {
        indexName: "withdrawal_user_id",
        name: "withdrawal_user_id",
      },
    ],
  },
];

module.exports = {
  pos: 0,
  up: function (queryInterface, Sequelize) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < migrationCommands.length) {
          let command = migrationCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  info: info,
};
