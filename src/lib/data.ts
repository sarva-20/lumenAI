export type Installer = {
  id: string;
  name: string;
  rating: number;
  projects: number;
  avgPricing: string;
  position: { lat: number; lng: number };
  avatarId: string;
};

export const installers: Installer[] = [
  {
    id: '1',
    name: 'Solaris Experts',
    rating: 4.9,
    projects: 150,
    avgPricing: '$$$',
    position: { lat: 34.052235, lng: -118.243683 },
    avatarId: 'installer-avatar-1',
  },
  {
    id: '2',
    name: 'SunPower Pros',
    rating: 4.8,
    projects: 210,
    avgPricing: '$$$$',
    position: { lat: 34.062235, lng: -118.253683 },
    avatarId: 'installer-avatar-2',
  },
  {
    id: '3',
    name: 'EcoVolt Solutions',
    rating: 4.7,
    projects: 95,
    avgPricing: '$$',
    position: { lat: 34.042235, lng: -118.233683 },
    avatarId: 'installer-avatar-3',
  },
];

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  message: string;
};
