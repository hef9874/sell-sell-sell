const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get("/", (req, res) => {
  // find all categories and include products
  Category.findAll({
    attributes: [
      'id',
      'category_name',
    ],
    include: [
      {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock','category_id'],
      }
    ]
  })
  .then(categoryDb => res.json(categoryDb))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  })
});

router.get("/:id", async (req, res) => {
  console.log('string testing')
  try {
    const category = await Category.findOne({ where: {id: req.params.id} }, {
      include: [Product],
    });
    console.log(category);
    res.status(200).json(category);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const newCat = req.body;
    const category2 = await Category.create(newCat);
    res.status(200).json(category2);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const category = await Category.update(body, {
      returning: true,
      where: { id },
    });

    res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category: ", error.message);
    res.status(500).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!category) {
      res.status(404).json({ message: "There is no category with that id" });
      return;
    }
    res.status(200).json("Category Deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
