import { useState, useEffect, useMemo, useCallback } from 'react';
import { Artist, FilterState, INITIAL_FILTER_STATE, RANKING_POINTS } from '../types';

export function useArtists(initialData: Artist[]) {
  const [artists, setArtists] = useState<Artist[]>(initialData);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  useEffect(() => {
    localStorage.setItem('apexArtists', JSON.stringify(artists));
  }, [artists]);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  return {
    artists,
    setArtists,
    filters,
    updateFilter,
    resetFilters,
  };
}

export function useSkillCategorization(artists: Artist[]) {
  const skillArrays = useMemo(() => {
    const allSkills = [...new Set(artists.map(a => a.skills[1]).filter(Boolean))];
    const allSkills3 = [...new Set(artists.map(a => a.skills[2]).filter(Boolean))];
    return { allSkills, allSkills3 };
  }, [artists]);

  const categorizeSkills = useCallback((skills: string[]) => {
    const isGoodBuff = (skill: string) => {
      const t = (skill || '').toLowerCase();
      if (t.includes('60%') && t.includes('basic attack damage')) return false;
      if (t.includes('reduc')) return false;
      return t.includes('skill damage') || t.includes('basic attack damage') || t.includes('basic damage');
    };

    const isTerribleSkill = (skill: string) => {
      const t = (skill || '').toLowerCase();
      const isDamageSkill = t.includes('damage') && (t.includes('sec/') || /\d+\s*damage/.test(t));
      if (isDamageSkill) return false;
      const is200DpsDefending = t.includes('200/dps') && (t.includes('defending') || t.includes('hq') || t.includes('gh') || t.includes('club') || t.includes('lm'));
      if (is200DpsDefending) return false;
      return t.includes('180/dps') || t.includes('200/dps') || 
             t.includes('world building guard') || t.includes('damage wg') ||
             (t.includes('10 sec') && !t.includes('sec/')) || t.includes('10/sec') ||
             t.includes('driving speed');
    };

    const isWorstSkill = (skill: string) => {
      const t = (skill || '').toLowerCase();
      return !isTerribleSkill(skill) && (
        t.includes('gold brick gathering') ||
        (t.includes('fan capacity') && !t.includes('10% rally fan capacity'))
      );
    };

    const isDirectDamage = (skill: string) => {
      const t = (skill || '').toLowerCase();
      if (t.includes('60%') && t.includes('basic attack damage')) return true;
      const mentionsDamage = t.includes('damage') && !t.includes('reduc') && !t.includes('taken');
      const timeBased = t.includes(' sec/') || /\bsec\b/.test(t);
      return (mentionsDamage || timeBased) && !isGoodBuff(skill) && !isWorstSkill(skill) && !isTerribleSkill(skill);
    };

    return {
      terrible: skills.filter(isTerribleSkill),
      worst: skills.filter(isWorstSkill),
      best: skills.filter(isDirectDamage),
      good: skills.filter(isGoodBuff),
      okay: skills.filter(s => !skills.filter(isDirectDamage).includes(s) && !skills.filter(isGoodBuff).includes(s) && !skills.filter(isWorstSkill).includes(s) && !skills.filter(isTerribleSkill).includes(s)),
    };
  }, []);

  const categories = useMemo(() => {
    const s2 = categorizeSkills(skillArrays.allSkills);
    const s3 = categorizeSkills(skillArrays.allSkills3);
    return { s2, s3 };
  }, [skillArrays, categorizeSkills]);

  return { skillArrays, categories };
}

export function useArtistRanking(_artists: Artist[], categories: ReturnType<typeof useSkillCategorization>['categories']) {
  const calculatePoints = useCallback((artist: Artist) => {
    let points = 0;
    artist.skills.forEach((skill, index) => {
      if (!skill || index === 0) return;
      const isBest = index === 1 ? categories.s2.best.includes(skill) : categories.s3.best.includes(skill);
      const isGood = index === 1 ? categories.s2.good.includes(skill) : categories.s3.good.includes(skill);
      const isOkay = index === 1 ? categories.s2.okay.includes(skill) : categories.s3.okay.includes(skill);
      const isWorst = index === 1 ? categories.s2.worst.includes(skill) : categories.s3.worst.includes(skill);
      const isTerrible = index === 1 ? categories.s2.terrible.includes(skill) : categories.s3.terrible.includes(skill);

      if (isBest) points += RANKING_POINTS.BEST;
      else if (isGood) points += RANKING_POINTS.GOOD;
      else if (isOkay) points += RANKING_POINTS.OKAY;
      else if (isWorst) points += RANKING_POINTS.WORST;
      else if (isTerrible) points += RANKING_POINTS.TERRIBLE;
    });
    return points;
  }, [categories]);

  const getLetterGrade = useCallback((points: number) => {
    if (points >= 14) return 'S';
    if (points >= 10) return 'A';
    if (points >= 5) return 'B';
    if (points >= 0) return 'C';
    return 'F';
  }, []);

  return { calculatePoints, getLetterGrade };
}

export function useFilteredArtists(
  _artists: Artist[],
  filters: FilterState,
  getLetterGrade: (points: number) => string,
  calculatePoints: (artist: Artist) => number
) {
  return useMemo(() => {
    return _artists
      .filter((artist) => {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          artist.name.toLowerCase().includes(searchLower) ||
          artist.group?.toLowerCase().includes(searchLower) ||
          artist.skills.some((skill) => skill && skill.toLowerCase().includes(searchLower));
        
        const matchesRank = !filters.selectedRank || artist.rank === filters.selectedRank;
        const matchesRole = !filters.selectedRole || artist.position === filters.selectedRole;
        const matchesGenre = !filters.selectedGenre || artist.genre === filters.selectedGenre;
        const matchesSkill = !filters.selectedSkill || artist.skills[1] === filters.selectedSkill;
        const matchesSkill3 = !filters.selectedSkill3 || artist.skills[2] === filters.selectedSkill3;
        const matchesBuild = !filters.selectedBuild || 
          (artist.build && artist.build.toLowerCase().includes(filters.selectedBuild.toLowerCase()));
        const matchesRanking = !filters.selectedRanking || 
          getLetterGrade(calculatePoints(artist)) === filters.selectedRanking;
        const matchesPhotos = !filters.selectedPhotos || artist.photos === filters.selectedPhotos;
        
        return matchesSearch && matchesRank && matchesRole && matchesGenre && matchesSkill && matchesSkill3 && matchesBuild && matchesRanking && matchesPhotos;
      })
      .sort((a, b) => {
        const aIsUR = a.rank.startsWith('UR');
        const bIsUR = b.rank.startsWith('UR');
        if (aIsUR !== bIsUR) return aIsUR ? 1 : -1;
        const genreCompare = a.genre.localeCompare(b.genre);
        if (genreCompare !== 0) return genreCompare;
        const roleCompare = a.position.localeCompare(b.position);
        if (roleCompare !== 0) return roleCompare;
        return a.name.localeCompare(b.name);
      });
  }, [_artists, filters, getLetterGrade, calculatePoints]);
}
