// Industry category mapper module
// Converts between category names (Chinese/English) and category IDs

// Industry tree data structure (from industry-categories.md)
const IndustryTree = [
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

// Build lookup maps
const idToNameMap = new Map();
const nameToIdMap = new Map();
const cnNameToIdMap = new Map();

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
    }
    
    // Recursively process children
    if (children && children.length > 0) {
      buildMaps(children, [...parentPath, label]);
    }
  }
}

buildMaps(IndustryTree);

/**
 * Get all level-3 (leaf) category IDs from a level-1 category ID
 * @param {string} level1Value - Level-1 category ID (e.g., "25")
 * @returns {string[]} Array of level-3 category IDs
 */
export function getIndustryLeafCodes(level1Value) {
  const node = IndustryTree.find((n) => n.value === level1Value);
  if (!node?.children) return [node?.value ?? level1Value];
  
  const codes = [];
  for (const l2 of node.children) {
    if (!l2.children?.length) {
      codes.push(l2.value);
    } else {
      for (const l3 of l2.children) {
        codes.push(l3.value);
      }
    }
  }
  return codes;
}

/**
 * Get category ID by name (Chinese or English)
 * @param {string} name - Category name (e.g., "美妆", "Skincare", "Mobile Phones")
 * @returns {string|null} Category ID or null if not found
 */
export function getIndustryIdByName(name) {
  if (!name) return null;
  
  // Try Chinese name first
  if (cnNameToIdMap.has(name)) {
    return cnNameToIdMap.get(name);
  }
  
  // Try English name (case-insensitive)
  const lowerName = name.toLowerCase();
  if (nameToIdMap.has(lowerName)) {
    return nameToIdMap.get(lowerName);
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
 * Check if a string is a valid category ID (2, 5, or 8 digits)
 * @param {string} str - String to check
 * @returns {boolean} True if valid ID format
 */
export function isValidCategoryId(str) {
  return /^\d{2}$|^\d{5}$|^\d{8}$/.test(str);
}

/**
 * Convert category input to level-3 IDs
 * Supports: Chinese name, English name, level-1 ID, level-3 ID
 * @param {string} input - Category input
 * @returns {string[]} Array of level-3 category IDs
 */
export function convertToLeafIds(input) {
  if (!input) return [];
  
  // If already a valid ID
  if (isValidCategoryId(input)) {
    // Level-1 ID (2 digits) - expand to all level-3 IDs
    if (input.length === 2) {
      return getIndustryLeafCodes(input);
    }
    // Level-3 ID (8 digits) - return as is
    if (input.length === 8) {
      return [input];
    }
    // Level-2 ID (5 digits) - expand to level-3 IDs
    if (input.length === 5) {
      const level1Id = input.slice(0, 2);
      const allLeafIds = getIndustryLeafCodes(level1Id);
      return allLeafIds.filter(id => id.startsWith(input));
    }
  }
  
  // Try to find by name (Chinese or English)
  const categoryId = getIndustryIdByName(input);
  if (categoryId) {
    // If found ID is level-1, expand to all level-3 IDs
    if (categoryId.length === 2) {
      return getIndustryLeafCodes(categoryId);
    }
    // If found ID is level-3, return as is
    if (categoryId.length === 8) {
      return [categoryId];
    }
    // If found ID is level-2, expand to level-3 IDs
    if (categoryId.length === 5) {
      const level1Id = categoryId.slice(0, 2);
      const allLeafIds = getIndustryLeafCodes(level1Id);
      return allLeafIds.filter(id => id.startsWith(categoryId));
    }
  }
  
  return [];
}
