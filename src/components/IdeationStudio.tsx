import React, { useState } from 'react';
import { 
  Palette, 
  Mail, 
  Utensils, 
  Music, 
  Sparkles, 
  Copy, 
  Check, 
  GlassWater, 
  Smile, 
  Zap, 
  Flame
} from 'lucide-react';
import { FullEventPlan, ColorPaletteItem } from '../types/event';

interface IdeationStudioProps {
  plan: FullEventPlan;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const IdeationStudio: React.FC<IdeationStudioProps> = ({
  plan,
  onOpenCopilotWithPrompt,
}) => {
  const { details, ideas, milestones } = plan;

  const [activeCategory, setActiveCategory] = useState<'theme' | 'invitations' | 'menu' | 'activities' | 'music'>('theme');
  const [selectedInviteTone, setSelectedInviteTone] = useState<'formal' | 'modernPlayful' | 'casual'>('modernPlayful');
  const [copiedColorHex, setCopiedColorHex] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColorHex(hex);
    setTimeout(() => setCopiedColorHex(null), 1800);
  };

  const handleCopyInvite = () => {
    const text = ideas.invitationWording[selectedInviteTone];
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Palette className="w-6 h-6 text-brand-600" />
            <span>Personalized Ideation Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Aesthetic color palettes, custom invitation drafts, multi-course dining, and curated entertainment.
          </p>
        </div>

        <button
          onClick={() => onOpenCopilotWithPrompt(`Can you generate 3 fresh decor or theme variations for ${details.title}?`)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate More Ideas with AI</span>
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'theme', label: 'Theme & Palette', icon: Palette },
          { id: 'invitations', label: 'Invitations & RSVP', icon: Mail },
          { id: 'menu', label: 'Catering & Cocktails', icon: Utensils },
          { id: 'activities', label: 'Activities & Flow', icon: Smile },
          { id: 'music', label: 'Music & Playlists', icon: Music },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Theme & Color Palette */}
      {activeCategory === 'theme' && (
        <div className="space-y-6">
          {/* Theme Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-brand-600">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Concept Definition</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {ideas.themeName}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{ideas.tagline}"
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {details.themeDescription}
            </p>
          </div>

          {/* Color Swatches Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Palette className="w-4 h-4 text-brand-500" />
                <span>Curated Hex Color Harmony</span>
              </h3>
              <span className="text-xs text-slate-400">Click any swatch to copy HEX</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {ideas.palette.map((color: ColorPaletteItem, idx: number) => {
                const isCopied = copiedColorHex === color.hex;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCopyColor(color.hex)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:scale-102 hover:shadow-md transition text-left group"
                  >
                    <div
                      className="w-full h-16 rounded-xl shadow-inner mb-2.5 border border-black/5 relative flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isCopied && (
                        <span className="px-2 py-1 rounded bg-black/75 text-white font-bold text-[10px] animate-fade-in">
                          Copied!
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {color.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{color.role}</div>
                    <div className="text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400 mt-1 uppercase">
                      {color.hex}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decor Concepts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Architectural Decor & Styling Guidelines</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ideas.decorConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start space-x-3"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {concept}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Invitations & RSVP */}
      {activeCategory === 'invitations' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <span>Invitation Copywriter</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select a tone suited to your celebration format.
                </p>
              </div>

              {/* Tone Switcher */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                {(['formal', 'modernPlayful', 'casual'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedInviteTone(tone)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition capitalize ${
                      selectedInviteTone === tone
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {tone === 'modernPlayful' ? 'Modern & Playful' : tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Card Preview */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-brand-50/50 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-800/80 dark:to-brand-950/30 border border-brand-100 dark:border-brand-900/50 shadow-inner relative text-center space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
                Official Invitation Draft
              </span>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 max-w-xl mx-auto font-serif italic leading-relaxed">
                "{ideas.invitationWording[selectedInviteTone]}"
              </p>

              <div className="text-xs text-slate-500 pt-2 space-y-1">
                <div className="font-semibold">{details.date} • {details.location}</div>
                <div className="text-[11px] text-slate-400">RSVP requested by {milestones.find(m => m.phase === '1_month_out')?.dueDate || details.date}</div>
              </div>

              <button
                onClick={handleCopyInvite}
                className="mt-4 inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition"
              >
                {copiedInvite ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedInvite ? 'Copied Invitation!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>

          {/* RSVP Checklist Suggestions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Essential RSVP Questions to Include
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Dietary & Allergies</span>
                "Do you have any dietary requirements (vegan, gluten-free, nut allergy)?"
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Song Request</span>
                "What song is guaranteed to get you onto the dance floor?"
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Shuttle / Accessibility</span>
                "Will you be using the scheduled guest coach shuttle service?"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Catering & Cocktails */}
      {activeCategory === 'menu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appetizers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-emerald-500" />
                <span>Passed Appetizers</span>
              </h3>
              <ul className="space-y-2.5">
                {ideas.menuSuggestions.appetizers.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mains */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-brand-500" />
                <span>Main Entrées</span>
              </h3>
              <ul className="space-y-2.5">
                {ideas.menuSuggestions.mains.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desserts */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-amber-500" />
                <span>Desserts & Sweets</span>
              </h3>
              <ul className="space-y-2.5">
                {ideas.menuSuggestions.desserts.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Signature Drinks Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <GlassWater className="w-4 h-4 text-sky-500" />
              <span>Signature Cocktail & Mocktail Pairings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ideas.menuSuggestions.signatureDrinks.map((drink, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {drink.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          drink.isAlcoholic
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {drink.isAlcoholic ? 'Cocktail' : 'Zero-Proof Mocktail'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {drink.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Activities & Flow */}
      {activeCategory === 'activities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ideas.activitiesAndEntertainment.map((activity, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md inline-block">
                    {activity.timing}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Music Playlists */}
      {activeCategory === 'music' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ideas.musicPlaylistVibes.map((vibe, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center space-x-2 text-brand-600">
                  <Music className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {vibe.style}
                  </h3>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Inspiration Tracks:
                  </span>
                  {vibe.sampleTracks.map((track, trackIdx) => (
                    <div
                      key={trackIdx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                    >
                      🎵 {track}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
