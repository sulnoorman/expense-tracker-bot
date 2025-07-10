const defaultCategories = {
  EXPENSE: [
    { name: 'Food & Dining', color: '#ff6b6b' },
    { name: 'Transportation', color: '#4ecdc4' },
    { name: 'Shopping', color: '#45b7d1' },
    { name: 'Entertainment', color: '#96ceb4' },
    { name: 'Bills & Utilities', color: '#feca57' },
    { name: 'Healthcare', color: '#ff9ff3' },
    { name: 'Education', color: '#54a0ff' },
    { name: 'Other', color: '#5f27cd' }
  ],
  INCOME: [
    { name: 'Salary', color: '#00d2d3' },
    { name: 'Freelance', color: '#ff9f43' },
    { name: 'Investment', color: '#10ac84' },
    { name: 'Gift', color: '#ee5a6f' },
    { name: 'Other', color: '#0984e3' }
  ]
};

function formatRupiah(value) {
  // Remove all non-digit characters (except commas if needed)
  const numberOnly = value.toString().replace(/[^\d]/g, '');

  if (!numberOnly) return '0';

  const formatted = parseInt(numberOnly, 10).toLocaleString('id-ID');
  return 'Rp' + formatted;
}

function toRawNumber(value) {
  // Remove all dot separators
  const raw = value.replace(/\./g, '');

  // Parse to integer
  const num = parseInt(raw, 10);

  return isNaN(num) ? null : num;
}

function normalize(str) {
  return str.trim().toLowerCase();
}

function generateColorFromCategory(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, '0');
  }

  return color;
}

function getCategoryColor(name, type = 'EXPENSE') {
  const normalized = normalize(name);
  const categoryList = defaultCategories[type.toUpperCase()] || [];

  const match = categoryList.find(cat => normalize(cat.name) === normalized);
  if (match) return match.color;

  return generateColorFromCategory(name);
}

function isAlphabetOnly(input) {
  return /^[A-Za-z\s]+$/.test(input);
}

module.exports = {
  formatRupiah,
  toRawNumber,
  normalize,
  generateColorFromCategory,
  getCategoryColor,
}
