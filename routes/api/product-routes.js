const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, required: true },
        { model: Tag, through: ProductTag, required: true },
      ],
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error fetching products: ", error.message);
    res.status(500).json(err);
    
  }
});

// get one product by ID 
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({
      where: { id },
      include: [
        { model: Category, required: true },
        { model: Tag, through: ProductTag, required: true },
      ],
    });
    if (!product) {
      res.status(404).json({ message: "There is no product with that id" });
      return;
    }
    res.status(201).json(product);
   } catch (error) {
    console.error("Error fetching product: ", error.message);
    res.status(500).json(err);
  }
});

// make new product
router.post('/', async (req, res) => {
  try {
    const { product_name, price, stock, category_id, tagIds } = req.body;

    const product = await Product.create({ product_name, price, stock, category_id });

    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }
  } catch (error) {
    res.status(500).json(err);
    }
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter((tag) => !req.body.tagIds.includes(tag.tag_id))
        .map((tag) => tag.id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      console.log('error', err)
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const product = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
