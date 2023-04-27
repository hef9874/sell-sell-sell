const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');


// get all products
router.get("/", async (req, res) => {
  try {
    const product = await Product.findAll({
      include: [
       Category,
       {
        model: Tag,
        through: ProductTag,
       }
      ],
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Error fetching products: ", err.message);
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
        Category,
        {
         model: Tag,
         through: ProductTag,
        }
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
    const { tagIds } = req.body;

    const product = await Product.create( req.body );

    // if (tagIds && tagIds.length) {
    //   const productTagIdArr = tagIds.map((tag_id) => {
    //     return {
    //       product_id: product.id,
    //       tag_id,
    //     };
    //   });

    //   await ProductTag.bulkCreate(productTagIdArr);
    // }
    res.json(product);
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
    .then( async (product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

      // get list of current tag_ids
      const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
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
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }
    return res.json(product);
    })
    // .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
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
