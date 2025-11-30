export const LEVELS = [
  { level: 1, name: 'Beginner', minPoints: 0, badge: 'beginner_badge' },
  { level: 2, name: 'Intermediate', minPoints: 100, badge: 'intermediate_badge' },
  { level: 3, name: 'Advanced', minPoints: 300, badge: 'advanced_badge' },
  { level: 4, name: 'Expert', minPoints: 600, badge: 'expert_badge' },
  { level: 5, name: 'Master', minPoints: 1000, badge: 'master_badge' },
  { level: 6, name: 'Grandmaster', minPoints: 1500, badge: 'grandmaster_badge' },
  { level: 7, name: 'Legend', minPoints: 2200, badge: 'legend_badge' },
  { level: 8, name: 'Mythic', minPoints: 3000, badge: 'mythic_badge' },
  { level: 9, name: 'Divine', minPoints: 4000, badge: 'divine_badge' },
  { level: 10, name: 'God', minPoints: 5000, badge: 'god_badge' },
]

export const POINTS_CONFIG = {
  FOOD_DONATION: 20,
  CLOTHES_DONATION: 10,
  ESSENTIALS_DONATION: 10,
  EVENT_ATTENDANCE: 15,
  MONEY_MULTIPLIER: 0.1, // 1 point per 10 currency units
}

export const BADGES = {
  BEGINNER: {
    name: 'Beginner',
    description: 'Started the journey of giving',
    icon: '🌱',
    category: 'milestone',
  },
  INTERMEDIATE: {
    name: 'Intermediate',
    description: 'Regular contributor to the community',
    icon: '🌿',
    category: 'milestone',
  },
  EXPERT: {
    name: 'Expert',
    description: 'Highly active community member',
    icon: '🌳',
    category: 'milestone',
  },
  LEGEND: {
    name: 'Legend',
    description: 'A legendary figure in social service',
    icon: '👑',
    category: 'milestone',
  },
  GOD: {
    name: 'God',
    description: 'The ultimate level of benevolence',
    icon: '🌟',
    category: 'milestone',
  },
  // Activity specific badges
  FIRST_DONATION: {
    name: 'First Drop',
    description: 'Made your first donation',
    icon: '💧',
    category: 'achievement',
  },
  EVENT_ENTHUSIAST: {
    name: 'Social Butterfly',
    description: 'Attended 5 events',
    icon: '🦋',
    category: 'participation',
  },
}
