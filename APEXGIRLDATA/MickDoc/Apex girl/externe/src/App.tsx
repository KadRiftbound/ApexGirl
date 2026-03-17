import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaMusic, FaDownload } from 'react-icons/fa';
import artistsData from './data/artists.json';
import { useArtists, useSkillCategorization, useArtistRanking, useFilteredArtists } from './hooks/useArtists';

const APP_PASSWORD = 'apexgirl';

function App() {
  const { artists, filters, updateFilter } = useArtists(artistsData);
  const { skillArrays, categories } = useSkillCategorization(artists);
  const { calculatePoints, getLetterGrade } = useArtistRanking(artists, categories);
  const filteredArtists = useFilteredArtists(artists, filters, getLetterGrade, calculatePoints);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const rankOptions = useMemo(() => [...new Set(artists.map(a => a.rank))], [artists]);
  const roles = useMemo(() => [...new Set(artists.map(a => a.position))], [artists]);
  const genres = useMemo(() => [...new Set(artists.map(a => a.genre))], [artists]);
  const buildOptions = useMemo(() => [...new Set(artists.map(a => a.build).filter(Boolean))] as string[], [artists]);
  const photosOptions = useMemo(() => [...new Set(artists.map(a => a.photos).filter(Boolean))] as string[], [artists]);

  useEffect(() => {
    localStorage.setItem('apexArtists', JSON.stringify(artists));
  }, [artists]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(artists, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'artist-and-records-1.9.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export artists', err);
    }
  };

  const handleOpenAddArtist = () => {
    (window as any).__artistData = {
      roles,
      genres,
      allSkills: skillArrays.allSkills,
      nextId: Math.max(0, ...artists.map(a => a.id)) + 1,
    };
    window.open('/add-artist.html', 'AddArtistModal', 'width=500,height=700,resizable=yes,scrollbars=yes');
  };

  const getSkillClass = (skill: string) => {
    if (!skill) return 'bg-blue-500 text-white';
    const trimmed = skill.trim();
    if (trimmed.toLowerCase().includes('damage to player')) return 'damage-to-player bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg';
    if (trimmed === '60% Basic Attack Damage') return 'basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg';
    if (trimmed === '50% Basic Attack Damage') return 'basic-attack-50 bg-gradient-to-r from-slate-700 to-slate-800 shadow-sm';
    if (trimmed.includes('Gold Brick')) return 'bg-gradient-to-r from-slate-600 to-slate-700 text-orange-500 border border-slate-500/40 gold-text';
    if (trimmed.includes('Reduction Basic Attack Damage')) return 'bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40 blue-text';
    if (trimmed === '24% Skill Damage') return 'bg-gradient-to-r from-slate-600 to-slate-700 text-orange-500 border border-slate-500/40 gold-text';
    if (['180/DPS Attacking Group Center, Club, Landmark', '30% Damage World Building Guard', '180/DPS Attacking Enemy Company', '20% Damage WG / 50% Drive Speed', '75% Drive Speed'].includes(trimmed)) return 'skill-specific-terrible bg-gradient-to-r from-slate-600 to-slate-700 shadow-sm border border-red-500/40';
    if (['20% Skill Damage', '30% Skill Damage', '12% Skill Damage Reduction'].includes(trimmed)) {
      return trimmed === '20% Skill Damage' || trimmed === '30% Skill Damage'
        ? 'skill-damage-20 bg-gradient-to-r from-emerald-400 to-green-600 shadow-sm'
        : 'bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40 blue-text';
    }
    return 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 border border-slate-500/40';
  };

  const getRankingClass = (grade: string) => {
    const classes: Record<string, string> = {
      S: 'ranking-a',
      A: 'ranking-b',
      B: 'ranking-c',
      C: 'ranking-d',
      F: 'ranking-f',
    };
    return classes[grade] || 'text-white';
  };

  const renderSelect = (value: string, onChange: (v: string) => void, options: string[], placeholder: string, optgroups?: { label: string; options: string[] }[]) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
    >
      <option value="">{placeholder}</option>
      {optgroups ? optgroups.map(grp => (
        <optgroup key={grp.label} label={grp.label}>
          {grp.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </optgroup>
      )) : options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Enter Password</h1>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              placeholder="Password"
              required
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <div className="w-full flex flex-col items-center py-8 text-white gap-8">
        <header className="flex flex-col items-center gap-4 app-header">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_0_25px_rgba(236,72,153,0.6)] tracking-tight text-center bg-gradient-to-r from-pink-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent animate-pulse">
            Mick's Awesome SSR Artist Helper
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={handleOpenAddArtist} className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 transform" title="Add New Artist">
              <FaMusic size={24} />
            </button>
            <button onClick={handleExport} className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 transform" title="Download JSON">
              <FaDownload size={22} />
            </button>
          </div>
        </header>

        <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Search artists..."
              className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border-2 border-amber-500/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-200 text-center hover:border-pink-400/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
            />
            <FaSearch className="absolute right-3 top-3 text-amber-400 group-hover:text-pink-400 transition-colors duration-200" />
          </div>
        </div>

        <main className="w-fit flex flex-col items-center bg-gradient-to-br from-violet-700/90 via-fuchsia-700/85 to-pink-600/90 rounded-2xl text-white shadow-[0_0_40px_rgba(219,39,119,0.5)] border-2 border-pink-400/50 backdrop-blur-md ring-2 ring-fuchsia-400/40 hover:shadow-[0_0_60px_rgba(219,39,119,0.7)] transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="table-auto table-force-white table-with-spacing italic">
              <thead className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
                <tr className="align-middle bg-gradient-to-r from-violet-800/70 via-fuchsia-800/70 to-pink-700/70">
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2">{renderSelect(filters.selectedGenre, (v) => updateFilter('selectedGenre', v), genres, 'Select Genre')}</th>
                  <th className="px-2 py-2">{renderSelect(filters.selectedRole, (v) => updateFilter('selectedRole', v), roles, 'Select Role')}</th>
                  <th className="px-2 py-2">{renderSelect(filters.selectedRank, (v) => updateFilter('selectedRank', v), rankOptions, 'Select Rank')}</th>
                  <th className="px-2 py-2">
                    {renderSelect(filters.selectedSkill, (v) => updateFilter('selectedSkill', v), [], 'Select Skill 2', [
                      { label: 'Best', options: categories.s2.best },
                      { label: 'Good', options: categories.s2.good },
                      { label: 'Okay', options: categories.s2.okay },
                      { label: 'Worst', options: categories.s2.worst },
                      { label: 'Terrible', options: categories.s2.terrible },
                    ])}
                  </th>
                  <th className="px-6 py-2">
                    {renderSelect(filters.selectedSkill3, (v) => updateFilter('selectedSkill3', v), [], 'Select Skill 3', [
                      { label: 'Best', options: categories.s3.best },
                      { label: 'Good', options: categories.s3.good },
                      { label: 'Okay', options: categories.s3.okay },
                      { label: 'Worst', options: categories.s3.worst },
                      { label: 'Terrible', options: categories.s3.terrible },
                    ])}
                  </th>
                  <th className="px-4 py-2">{renderSelect(filters.selectedRanking, (v) => updateFilter('selectedRanking', v), ['S', 'A', 'B', 'C', 'D', 'F'], 'Select Ranking')}</th>
                  <th className="px-2 py-2">{renderSelect(filters.selectedPhotos, (v) => updateFilter('selectedPhotos', v), photosOptions, 'Select Photos')}</th>
                  <th className="px-2 py-2">{renderSelect(filters.selectedBuild, (v) => updateFilter('selectedBuild', v), buildOptions, 'Select Build')}</th>
                </tr>
                <tr>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Artist</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Genre</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Role</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Rank</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Skill 2</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Skill 3</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Ranking</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Photos</th>
                  <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Best Usage</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/80">
                {filteredArtists.map((artist) => {
                  const grade = getLetterGrade(calculatePoints(artist));
                  return (
                    <tr key={artist.id} className="hover:bg-amber-400/10 transition-colors duration-200">
                      <td className="px-2 py-3 whitespace-nowrap"><div className="text-sm font-medium text-white" title={artist.name}>{artist.name}</div></td>
                      <td className="px-2 py-3 whitespace-nowrap"><div className="text-sm text-amber-100" title={artist.genre}>{artist.genre}</div></td>
                      <td className="px-2 py-3 whitespace-nowrap"><div className="text-sm text-white text-center" title={artist.position}>{artist.position}</div></td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-white text-center" title={artist.rank}>
                          {artist.rank}
                          {artist.rating && artist.rating > 0 && <span className="ml-1 text-xs text-white/80">({(artist.rating as number).toFixed(1)})</span>}
                        </div>
                      </td>
                      <td className="px-2 py-3"><div className="flex justify-center">{artist.skills[1] ? <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs shadow-sm transition-all duration-200 ${getSkillClass(artist.skills[1])}`}>{artist.skills[1]}</span> : <span className="text-white/50 text-xs">-</span>}</div></td>
                      <td className="px-2 py-3"><div className="flex justify-center">{artist.skills[2] ? <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs shadow-sm transition-all duration-200 ${getSkillClass(artist.skills[2])}`}>{artist.skills[2]}</span> : <span className="text-white/50 text-xs">-</span>}</div></td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm font-bold text-center" title={`Points: ${calculatePoints(artist)}`}>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 ${getRankingClass(grade)}`}>
                            {grade}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center"><span className="text-white text-sm">{artist.photos || 'N/A'}</span></td>
                      <td className="px-2 py-3 text-center"><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-sm`}>{artist.build || 'N/A'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div id="skill-legend" className="mt-8 mb-4 px-6 py-4 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl border-2 border-fuchsia-400/40 shadow-[0_0_30px_rgba(192,38,211,0.4)] relative z-10 w-fit mx-auto hover:shadow-[0_0_40px_rgba(192,38,211,0.6)] hover:border-pink-400/60 transition-all duration-300">
            <h3 className="text-xl font-bold text-pink-100 mb-4 text-center drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">Skill Color Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 place-items-center">
              <div className="flex items-center gap-3"><span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 damage-to-player">Gold</span><span className="text-white text-sm">Best Skills</span></div>
              <div className="flex items-center gap-3"><span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-700 to-slate-800 skill-good">Green</span><span className="text-white text-sm">Good Skills</span></div>
              <div className="flex items-center gap-3"><span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 blue-text">Blue</span><span className="text-white text-sm font-bold">Reduction Skills</span></div>
              <div className="flex items-center gap-3"><span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-600 to-slate-700 skill-specific-terrible">Red</span><span className="text-white text-sm">Terrible Skills</span></div>
              <div className="flex items-center gap-3"><span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 gold-text">Orange</span><span className="text-white text-sm font-bold">Gold Gathering</span></div>
              <div className="flex items-center gap-3"><span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-white">White</span><span className="text-white text-sm">All Other Skills</span></div>
            </div>
          </div>
        </main>

        <footer className="mt-8 py-4 w-full flex justify-center items-center text-sm relative z-10">
          <p className="text-white font-medium">© {new Date().getFullYear()} JustMick</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
