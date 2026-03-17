export interface Artist {
  id: number;
  name: string;
  group: string;
  genre: string;
  position: string;
  rank: string;
  rating?: number | null;
  skills: string[];
  description: string;
  image?: string;
  thoughts?: string;
  build?: string;
  photos?: string;
}

export interface FilterState {
  searchTerm: string;
  selectedRank: string;
  selectedRole: string;
  selectedGenre: string;
  selectedSkill: string;
  selectedSkill3: string;
  selectedBuild: string;
  selectedRanking: string;
  selectedPhotos: string;
}

export const INITIAL_FILTER_STATE: FilterState = {
  searchTerm: '',
  selectedRank: '',
  selectedRole: '',
  selectedGenre: '',
  selectedSkill: '',
  selectedSkill3: '',
  selectedBuild: '',
  selectedRanking: '',
  selectedPhotos: '',
};

export const RANKING_POINTS = {
  BEST: 10,
  GOOD: 6,
  OKAY: 3,
  WORST: 0,
  TERRIBLE: -1,
} as const;

export const LETTER_GRADES: Record<string, string> = {
  S: '14+',
  A: '10-13',
  B: '5-9',
  C: '0-4',
  F: '-1',
};
