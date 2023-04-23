const router = require('express').Router();
// const api = require('./index');
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const category1 = await Category.findAll({
      include: { model: Product },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: { model: Product },
    });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
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
    const [count, [category]] = await Category.update(body, {
      returning: true,
      where: { id },
    });
    if (count === 0) {
      res.status(404).json({ message: "There is no category with that id" });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category: ", error.message);
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
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
