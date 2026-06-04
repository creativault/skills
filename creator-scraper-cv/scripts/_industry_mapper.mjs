// Industry category mapper module
// Converts between category names (Chinese/English) and category IDs

import { readFileSync } from 'node:fs';

// Industry tree data structure (from industry-categories.md)
const fallbackIndustryTree = [
  {
    value: '19',
    label: 'Games',
    labelCn: '游戏',
    children: [
      {
        value: '19006',
        label: 'Shooter',
        children: [{ value: '19006001', label: 'Shooter' }],
      },
      {
        value: '19001',
        label: 'MOBA',
        children: [{ value: '19001001', label: 'MOBA' }],
      },
      {
        value: '19012',
        label: 'Strategy & Battle',
        children: [
          { value: '19012003', label: 'PvP' },
          { value: '19012004', label: 'Strategy Survival' },
          { value: '19012002', label: 'Card Battle' },
          { value: '19012001', label: 'Others' },
        ],
      },
      {
        value: '19004',
        label: 'Sports & Racing',
        children: [
          { value: '19004001', label: 'Sports' },
          { value: '19004003', label: 'Racing' },
          { value: '19004002', label: 'Others' },
        ],
      },
      {
        value: '19005',
        label: 'Action',
        children: [
          { value: '19005004', label: 'Fighting' },
          { value: '19005002', label: 'Action Adventure' },
          { value: '19005003', label: 'Platformer' },
          { value: '19005001', label: 'Others' },
        ],
      },
      {
        value: '19013',
        label: 'Role-Playing',
        children: [
          { value: '19013002', label: 'RPG' },
          { value: '19013004', label: 'Open World' },
          { value: '19013001', label: 'MMORPG' },
          { value: '19013003', label: 'Others' },
        ],
      },
      {
        value: '19009',
        label: 'Simulation & Management',
        children: [{ value: '19009001', label: 'Simulation & Management' }],
      },
      {
        value: '19003',
        label: 'Casual & Social',
        children: [
          { value: '19003003', label: 'Puzzle & Casual' },
          { value: '19003002', label: 'Party & Social' },
          { value: '19003001', label: 'Others' },
        ],
      },
      {
        value: '19014',
        label: 'Rhythm',
        children: [{ value: '19014001', label: 'Rhythm' }],
      },
      {
        value: '19007',
        label: 'Horror & Mystery',
        children: [{ value: '19007001', label: 'Horror & Mystery' }],
      },
      {
        value: '19002',
        label: 'Anime',
        children: [{ value: '19002001', label: 'Anime' }],
      },
      {
        value: '19008',
        label: 'Text Adventure',
        children: [{ value: '19008001', label: 'Text Adventure' }],
      },
      {
        value: '19010',
        label: 'Sandbox',
        children: [{ value: '19010001', label: 'Sandbox' }],
      },
      {
        value: '19011',
        label: 'Gaming Equipment',
        children: [{ value: '19011001', label: 'Gaming Equipment' }],
      },
    ],
  },
  {
    value: '25',
    label: 'Beauty & Personal Care',
    labelCn: '美妆与个人护理',
    children: [
      {
        value: '25006',
        label: 'Makeup',
        children: [
          { value: '25006004', label: 'Facial Makeup' },
          { value: '25006003', label: 'Eye Makeup' },
          { value: '25006002', label: 'Lip Makeup' },
          { value: '25006001', label: 'Others' },
        ],
      },
      {
        value: '25011',
        label: 'Tattoo',
        children: [{ value: '25011001', label: 'Tattoo' }],
      },
      {
        value: '25012',
        label: 'Nail Art & Tools',
        children: [{ value: '25012001', label: 'Nail Art & Tools' }],
      },
      {
        value: '25003',
        label: 'Makeup Tools & Accessories',
        children: [{ value: '25003001', label: 'Makeup Tools & Accessories' }],
      },
      {
        value: '25002',
        label: 'Wigs',
        children: [{ value: '25002001', label: 'Wigs' }],
      },
      {
        value: '25009',
        label: 'Skincare',
        children: [{ value: '25009001', label: 'Skincare' }],
      },
      {
        value: '25007',
        label: 'Hair Care',
        children: [{ value: '25007001', label: 'Hair Care' }],
      },
      {
        value: '25004',
        label: 'Oral Care',
        children: [{ value: '25004001', label: 'Oral Care' }],
      },
      {
        value: '25013',
        label: 'Body Care',
        children: [{ value: '25013001', label: 'Body Care' }],
      },
      {
        value: '25008',
        label: 'Beauty Devices & Accessories',
        children: [
          { value: '25008001', label: 'Beauty Devices & Accessories' },
        ],
      },
      {
        value: '25005',
        label: 'Feminine Care',
        children: [{ value: '25005001', label: 'Feminine Care' }],
      },
      {
        value: '25010',
        label: "Men's Care",
        children: [{ value: '25010001', label: "Men's Care" }],
      },
      {
        value: '25001',
        label: 'Adult Products',
        children: [{ value: '25001001', label: 'Adult Products' }],
      },
      {
        value: '25014',
        label: 'Perfume',
        children: [{ value: '25014001', label: 'Perfume' }],
      },
    ],
  },
  {
    value: '16',
    label: 'Clothing & Fashion',
    labelCn: '服装与时尚',
    children: [
      {
        value: '16002',
        label: "Women's Clothing",
        children: [{ value: '16002001', label: "Women's Clothing" }],
      },
      {
        value: '16003',
        label: "Men's Clothing",
        children: [{ value: '16003001', label: "Men's Clothing" }],
      },
      {
        value: '16004',
        label: "Kids' Clothing",
        children: [{ value: '16004001', label: "Kids' Clothing" }],
      },
      {
        value: '16007',
        label: 'Footwear',
        children: [{ value: '16007001', label: 'Footwear' }],
      },
      {
        value: '16005',
        label: 'Bags & Luggage',
        children: [{ value: '16005001', label: 'Bags & Luggage' }],
      },
      {
        value: '16008',
        label: 'Jewelry',
        children: [{ value: '16008001', label: 'Jewelry' }],
      },
      {
        value: '16006',
        label: 'Accessories',
        children: [
          { value: '16006006', label: 'Watches' },
          { value: '16006003', label: 'Sunglasses' },
          { value: '16006007', label: 'Belts' },
          { value: '16006005', label: 'Hats' },
          { value: '16006008', label: 'Ties' },
          { value: '16006004', label: 'Hair Accessories' },
          { value: '16006002', label: 'Scarves' },
          { value: '16006001', label: 'Others' },
        ],
      },
      {
        value: '16001',
        label: 'Occasion Wear',
        children: [
          { value: '16001007', label: 'Workplace & Business Meetings' },
          { value: '16001005', label: 'Daily Casual' },
          { value: '16001008', label: 'Sports' },
          { value: '16001002', label: 'Travel & Dating' },
          { value: '16001003', label: 'Weddings & Banquets' },
          { value: '16001006', label: 'Campus' },
          { value: '16001004', label: 'Niche Hobbies' },
          { value: '16001001', label: 'Others' },
        ],
      },
    ],
  },
  {
    value: '24',
    label: 'Technology & Electronics',
    labelCn: '科技数码',
    children: [
      {
        value: '24001',
        label: 'Electronics',
        children: [
          { value: '24001001', label: 'Mobile Phones' },
          { value: '24001002', label: 'Computers' },
          { value: '24001003', label: 'Photography & Video Equipment' },
          { value: '24001004', label: 'VR & AR' },
          { value: '24001005', label: 'Smart Watches & Bands' },
          { value: '24001006', label: 'Headphones' },
          { value: '24001007', label: 'Others' },
        ],
      },
      {
        value: '24002',
        label: 'Digital Accessories',
        children: [
          { value: '24002002', label: 'Mobile Phone Accessories' },
          { value: '24002003', label: 'Computer Accessories' },
          { value: '24002001', label: 'Others' },
        ],
      },
      {
        value: '24003',
        label: 'Technology News',
        children: [{ value: '24003001', label: 'Technology News' }],
      },
    ],
  },
  {
    value: '12',
    label: 'Outdoor & Sports',
    labelCn: '户外与运动',
    children: [
      {
        value: '12001',
        label: 'Fitness',
        children: [
          { value: '12001001', label: 'Aerobic Training' },
          { value: '12001002', label: 'Strength Training' },
          { value: '12001003', label: 'Healthy Recipes' },
          { value: '12001004', label: 'Fitness Equipment' },
          { value: '12001005', label: 'Yoga & Pilates' },
          { value: '12001006', label: 'Others' },
        ],
      },
      {
        value: '12002',
        label: 'Ball Sports',
        children: [
          { value: '12002001', label: 'Basketball' },
          { value: '12002002', label: 'Football' },
          { value: '12002003', label: 'Volleyball' },
          { value: '12002004', label: 'Tennis' },
          { value: '12002005', label: 'Table Tennis' },
          { value: '12002006', label: 'Badminton' },
          { value: '12002007', label: 'Baseball' },
          { value: '12002008', label: 'Rugby' },
          { value: '12002009', label: 'Hockey' },
          { value: '12002010', label: 'Golf' },
          { value: '12002011', label: 'Others' },
        ],
      },
      {
        value: '12003',
        label: 'Running',
        children: [{ value: '12003001', label: 'Running' }],
      },
      {
        value: '12004',
        label: 'Water Sports',
        children: [
          { value: '12004001', label: 'Swimming' },
          { value: '12004002', label: 'Diving' },
          { value: '12004003', label: 'Rowing & Boating' },
          { value: '12004004', label: 'Others' },
        ],
      },
      {
        value: '12005',
        label: 'Ice & Snow Sports',
        children: [
          { value: '12005001', label: 'Skiing' },
          { value: '12005002', label: 'Skating' },
          { value: '12005003', label: 'Others' },
        ],
      },
      {
        value: '12006',
        label: 'Cycling',
        children: [{ value: '12006001', label: 'Cycling' }],
      },
      {
        value: '12007',
        label: 'Combat & Martial Arts',
        children: [{ value: '12007001', label: 'Combat & Martial Arts' }],
      },
      {
        value: '12008',
        label: 'Camping & Gear',
        children: [{ value: '12008001', label: 'Camping & Gear' }],
      },
      {
        value: '12009',
        label: 'Hiking & Mountaineering',
        children: [{ value: '12009001', label: 'Hiking & Mountaineering' }],
      },
      {
        value: '12010',
        label: 'Extreme Sports',
        children: [
          { value: '12010001', label: 'Surfing' },
          { value: '12010002', label: 'Rock Climbing' },
          { value: '12010003', label: 'Skateboarding' },
          { value: '12010004', label: 'Others' },
        ],
      },
    ],
  },
  {
    value: '26',
    label: 'Food & Beverages',
    labelCn: '美食与饮品',
    children: [
      {
        value: '26001',
        label: 'Food',
        children: [{ value: '26001001', label: 'Food' }],
      },
      {
        value: '26002',
        label: 'Beverages',
        children: [
          { value: '26002001', label: 'Coffee' },
          { value: '26002002', label: 'Tea Drinks' },
          { value: '26002003', label: 'Alcoholic Drinks' },
          { value: '26002004', label: 'Others' },
        ],
      },
      {
        value: '26003',
        label: 'Cooking',
        children: [{ value: '26003001', label: 'Cooking' }],
      },
      {
        value: '26004',
        label: 'Food Exploration & Reviews',
        children: [{ value: '26004001', label: 'Food Exploration & Reviews' }],
      },
      {
        value: '26005',
        label: 'Food Live Streaming',
        children: [{ value: '26005001', label: 'Food Live Streaming' }],
      },
    ],
  },
  {
    value: '15',
    label: 'Travel & Lifestyle',
    labelCn: '旅行与生活方式',
    children: [
      {
        value: '15001',
        label: 'Travel',
        children: [
          { value: '15001001', label: 'Travel Guides' },
          { value: '15001002', label: 'Hotel Experiences' },
          { value: '15001003', label: 'Natural Scenery' },
          { value: '15001004', label: 'Cultural Experiences' },
          { value: '15001005', label: 'Others' },
        ],
      },
      {
        value: '15002',
        label: 'Lifestyle',
        children: [{ value: '15002001', label: 'Lifestyle' }],
      },
    ],
  },
];

function loadIndustryTree() {
  try {
    return JSON.parse(
      readFileSync(
        new URL('./influencer_industry_tree.json', import.meta.url),
        'utf8',
      ),
    );
  } catch (error) {
    console.error(
      `[industry-mapper] Failed to load complete industry tree, using fallback tree: ${error.message}`,
    );
    return fallbackIndustryTree;
  }
}

const IndustryTree = loadIndustryTree();

// Build lookup maps
const idToNameMap = new Map();
const nameToIdMap = new Map();
const cnNameToIdMap = new Map();
const childrenByIdMap = new Map();

function buildMaps(nodes, parentPath = []) {
  for (const node of nodes) {
    const { value, label, labelCn, children } = node;
    
    // ID to name mapping
    idToNameMap.set(value, label);
    
    // Name to ID mapping (case-insensitive)
    nameToIdMap.set(label.toLowerCase(), value);
    
    // Chinese name to ID mapping
    if (labelCn) {
      cnNameToIdMap.set(labelCn, value);
      // Auto-extract short form: "美妆与个人护理" -> "美妆"
      const shortCn = extractShortCn(labelCn);
      if (shortCn && shortCn !== labelCn) {
        cnNameToIdMap.set(shortCn, value);
      }
    }
    
    // Recursively process children
    if (children && children.length > 0) {
      childrenByIdMap.set(value, children.map((child) => child.value));
      buildMaps(children, [...parentPath, label]);
    }
  }
}

function extractShortCn(labelCn) {
  // Extract the first segment as short name
  // e.g. "美妆与个人护理" -> "美妆"
  // e.g. "服装与时尚" -> "服装"
  // e.g. "美食与饮品" -> "美食"
  // e.g. "旅行与生活方式" -> "旅行"
  const splitChars = ['与', '&', '和', '及'];
  for (const ch of splitChars) {
    const idx = labelCn.indexOf(ch);
    if (idx > 0) {
      return labelCn.slice(0, idx);
    }
  }
  return null;
}

buildMaps(IndustryTree);

// Additional common aliases (short form -> ID)
const aliasToIdMap = new Map([
  ['美妆', '25'],
  ['游戏', '19'],
  ['服装', '16'],
  ['数码', '24'],
  ['科技', '24'],
  ['户外', '12'],
  ['运动', '12'],
  ['美食', '26'],
  ['旅行', '15'],
  ['生活', '15'],
  ['电竞', '19'],
  ['手游', '19'],
  ['端游', '19'],
  ['护肤', '25009'],
  ['彩妆', '25006'],
  ['穿搭', '16'],
  ['潮牌', '16'],
  ['健身', '12001'],
  ['篮球', '12002'],
  ['足球', '12002'],
]);

// Merge aliases into cnNameToIdMap
for (const [alias, id] of aliasToIdMap) {
  if (!cnNameToIdMap.has(alias)) {
    cnNameToIdMap.set(alias, id);
  }
}

// Common English aliases/abbreviations → level-1 category ID
const englishAliasMap = new Map([
  ['fashion', '16'],
  ['clothing', '16'],
  ['apparel', '16'],
  ['beauty', '25'],
  ['cosmetics', '25'],
  ['makeup', '25006'],
  ['skincare', '25009'],
  ['haircare', '25007'],
  ['sports', '12'],
  ['fitness', '12001'],
  ['outdoor', '12'],
  ['tech', '24'],
  ['technology', '24'],
  ['electronics', '24001'],
  ['gadgets', '24'],
  ['food', '26'],
  ['cooking', '26003'],
  ['travel', '15'],
  ['lifestyle', '15002'],
  ['gaming', '19'],
  ['games', '19'],
  ['esports', '19'],
  ['entertainment', '5'],
  ['comedy', '5001'],
  ['humor', '5001'],
  ['pets', '9'],
  ['animals', '9'],
  ['home', '10'],
  ['furniture', '10'],
  ['art', '28'],
  ['music', '28'],
  ['education', '6'],
  ['finance', '29'],
  ['business', '29'],
  ['parenting', '1'],
  ['kids', '1'],
  ['baby', '1'],
  ['automotive', '17'],
  ['cars', '17'],
  ['health', '14'],
  ['wellness', '14'],
  ['books', '7'],
  ['reading', '7'],
]);

/**
 * Get all level-3 (leaf) category IDs below any known category ID.
 * Leaf IDs are returned unchanged.
 * @param {string} categoryId - Any known category ID
 * @returns {string[]} Array of level-3 category IDs
 */
export function getIndustryLeafCodes(categoryId) {
  if (!idToNameMap.has(categoryId)) {
    return [];
  }

  const childIds = childrenByIdMap.get(categoryId);
  if (!childIds?.length) {
    return [categoryId];
  }

  const leafIds = [];
  for (const childId of childIds) {
    leafIds.push(...getIndustryLeafCodes(childId));
  }
  return leafIds;
}

function normalizeIndustryName(name) {
  return String(name).trim().replace(/\s+/g, ' ');
}

function resolveIndustryId(value) {
  const normalized = normalizeIndustryName(value);
  if (!normalized) {
    return null;
  }

  if (isValidCategoryId(normalized)) {
    return normalized;
  }

  return getIndustryIdByName(normalized);
}

function convertSingleToLeafIds(value) {
  const categoryId = resolveIndustryId(value);
  if (!categoryId) {
    return [];
  }

  return getIndustryLeafCodes(categoryId);
}

function unique(values) {
  return [...new Set(values)];
}

function splitIndustryInput(input) {
  if (Array.isArray(input)) {
    return input.flatMap((value) => splitIndustryInput(value));
  }

  return String(input)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Validate and convert every input item. If any item is unknown, return an
 * empty result so callers fail before sending a partially-filtered request.
 */
export function convertToLeafIds(input) {
  if (!input) return [];

  const parts = splitIndustryInput(input);
  if (parts.length === 0) {
    return [];
  }

  const leafIds = [];
  for (const part of parts) {
    const converted = convertSingleToLeafIds(part);
    if (converted.length === 0) {
      return [];
    }
    leafIds.push(...converted);
  }

  return unique(leafIds);
}

/**
 * Get category ID by name (Chinese or English)
 * @param {string} name - Category name (e.g., "美妆", "Skincare", "Mobile Phones", "Fashion", "Beauty")
 * @returns {string|null} Category ID or null if not found
 */
export function getIndustryIdByName(name) {
  if (!name) return null;

  const normalizedName = normalizeIndustryName(name);
  
  // Try Chinese name first
  if (cnNameToIdMap.has(normalizedName)) {
    return cnNameToIdMap.get(normalizedName);
  }
  
  // Try English name (case-insensitive)
  const lowerName = normalizedName.toLowerCase();
  if (nameToIdMap.has(lowerName)) {
    return nameToIdMap.get(lowerName);
  }
  
  // Try English alias (common short names)
  if (englishAliasMap.has(lowerName)) {
    return englishAliasMap.get(lowerName);
  }
  
  return null;
}

/**
 * Get English category name by ID
 * @param {string} id - Category ID (e.g., "25009001")
 * @returns {string|null} English category name or null if not found
 */
export function getIndustryNameById(id) {
  return idToNameMap.get(id) || null;
}

/**
 * Check if a string is a known category ID.
 * @param {string} str - String to check
 * @returns {boolean} True if valid ID format
 */
export function isValidCategoryId(str) {
  const normalized = String(str).trim();
  return /^\d+$/.test(normalized) && idToNameMap.has(normalized);
}
