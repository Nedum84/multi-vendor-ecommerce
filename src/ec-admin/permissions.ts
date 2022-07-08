export const PERMISIONS = [
  {
    name: "E-commerce",
    slug: "general.ecommerce",
  },

  /**
   * Products
   */
  {
    name: "Products",
    slug: "products.index",
    parent_slug: "general.ecommerce",
  },
  {
    name: "Create",
    slug: "products.create",
    parent_slug: "products.index",
  },
  {
    name: "Edit",
    slug: "products.edit",
    parent_slug: "products.index",
  },
  {
    name: "Delete",
    slug: "products.delete",
    parent_slug: "products.index",
  },

  /**
   * Categories
   */
  {
    name: "Product categories",
    slug: "product-categories.index",
    parent_slug: "general.ecommerce",
  },
  {
    name: "Create",
    slug: "product-categories.create",
    parent_slug: "product-categories.index",
  },
  {
    name: "Edit",
    slug: "product-categories.edit",
    parent_slug: "product-categories.index",
  },
  {
    name: "Delete",
    slug: "product-categories.delete",
    parent_slug: "product-categories.index",
  },

  /**
   * Tags
   */
  {
    name: "Product tags",
    slug: "product-tag.index",
    parent_slug: "general.ecommerce",
  },
  {
    name: "Create",
    slug: "product-tag.create",
    parent_slug: "product-tag.index",
  },
  {
    name: "Edit",
    slug: "product-tag.edit",
    parent_slug: "product-tag.index",
  },
  {
    name: "Delete",
    slug: "product-tag.delete",
    parent_slug: "product-tag.index",
  },
];
