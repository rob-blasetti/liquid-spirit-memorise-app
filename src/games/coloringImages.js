const COLORING_IMAGES = [
  { id: 'love', label: 'Love', source: require('../assets/img/nuri_images/love.png') },
  { id: 'justice', label: 'Justice', source: require('../assets/img/nuri_images/justice.png') },
  { id: 'generosity', label: 'Generosity', source: require('../assets/img/nuri_images/generosity.png') },
  { id: 'purity', label: 'Purity', source: require('../assets/img/nuri_images/purity.png') },
  { id: 'selflessness', label: 'Selflessness', source: require('../assets/img/nuri_images/selflessness.png') },
  { id: 'truthfulness', label: 'Truthfulness', source: require('../assets/img/nuri_images/truthfulness.png') },
];

const COLORING_IMAGE_IDS = COLORING_IMAGES.map((img) => img.id);

const pickRandomImageId = () => {
  if (!COLORING_IMAGES.length) return null;
  const choice = COLORING_IMAGES[Math.floor(Math.random() * COLORING_IMAGES.length)];
  return choice?.id || null;
};

const getColoringImageById = (id) =>
  COLORING_IMAGES.find((img) => img.id === id) || null;

const isValidImageId = (id) => COLORING_IMAGE_IDS.includes(id);

export {
  COLORING_IMAGES,
  COLORING_IMAGE_IDS,
  pickRandomImageId,
  getColoringImageById,
  isValidImageId,
};
