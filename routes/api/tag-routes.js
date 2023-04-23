const router = require('express').Router();

const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [
        {
          model: Product,
          attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
        },
      ],
});
res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
try{
  const tags = await Tag.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
      },
    ],
  });
  if(!tags){
    res.status(404).json({message: 'There are no tags with that id number'});
  }
  res.json(tags)
} catch (err){
  res.status(500).json(err);
}
});

// create a new tag
router.post('/', async (req, res) => {
  try {
    const tags = await Tag.create({
      tag_name: req.body.tag_name
  });
  res.json(tags);
} catch (err) {
  res.status(500).json(err);
}
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const [count] = await Tag.update(body, {
      where: { id },
    });
    if (count === 0) {
      res.status(404).json(err);
      return;
    }
    const dbTagData = await Tag.findByPk(id);
    res.json(dbTagData);
  } catch (error) {
    console.error("Error updating tag: ", error.message);
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
    try {
      const tags = await Tag.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.json(tags);
  } catch (err){
    res.status(500).json(err);
}
});


module.exports = router;
