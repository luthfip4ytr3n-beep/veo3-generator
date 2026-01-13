import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Users, 
  MessageSquare, 
  Aperture, 
  Settings,
  Sparkles,
  Video
} from './Icons';
import { Button } from './ui/Button';

// --- Constants & Options ---

const RACE_OPTIONS = [
  { label: 'Indonesia', value: 'Indonesian' },
  { label: 'Asia Timur', value: 'East Asian' },
  { label: 'Asia Tenggara', value: 'Southeast Asian' },
  { label: 'Asia Selatan', value: 'South Asian' },
  { label: 'Timur Tengah', value: 'Middle Eastern' },
  { label: 'Afrika', value: 'African' },
  { label: 'Eropa', value: 'European' },
  { label: 'Amerika Latin', value: 'Latino/Hispanic' },
  { label: 'Suku Asli Amerika', value: 'Native American' },
  { label: 'Pasifik', value: 'Pacific Islander' },
  { label: 'Campuran', value: 'Mixed Race' },
  { label: 'Lainnya', value: 'Other' },
];

const GENDER_OPTIONS = [
  { label: 'Laki-laki', value: 'Male' },
  { label: 'Perempuan', value: 'Female' },
  { label: 'Non-biner', value: 'Non-binary' },
  { label: 'Genderfluid', value: 'Genderfluid' },
];

const VOICE_OPTIONS = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Berbisik', value: 'Whispering' },
  { label: 'Berteriak', value: 'Shouting' },
  { label: 'Lirih', value: 'Soft' },
  { label: 'Serak', value: 'Raspy' },
  { label: 'Rendah', value: 'Deep' },
  { label: 'Tinggi', value: 'High-pitched' },
  { label: 'Sarkastik', value: 'Sarcastic' },
  { label: 'Penuh Semangat', value: 'Excited' },
  { label: 'Monoton', value: 'Monotone' },
];

const LIGHTING_OPTIONS = [
  "Rembrandt lighting", "Butterfly lighting", "Split lighting", "Loop lighting",
  "Ambient lighting", "Rim lighting", "Softbox lighting", "Three-point lighting",
  "High-key lighting", "Low-key lighting", "Cinematic lighting", "Natural light",
  "Fluorescent light", "Neon light", "Candlelight"
];

const CAMERA_ANGLES = [
  "Wide Shot", "Full Shot", "Medium Shot", "Close-up", "Extreme Close-up",
  "Over-the-shoulder shot", "Point of view (POV) shot", "High angle shot",
  "Low angle shot", "Dutch angle shot", "Bird's-eye view shot", "Worm's-eye view shot"
];

const SHOT_STYLES = [
  "Single-camera setup", "Multi-camera setup", "Handheld camera", "Steadicam shot",
  "Dolly shot", "Crane shot", "Zoom shot", "Pan shot", "Tilt shot", "Tracking shot",
  "Arc shot", "Whip pan shot", "Slow motion", "Time-lapse", "Bullet time"
];

// --- Sub-Components ---

const SectionHeader = ({ icon: Icon, title, colorClass }: any) => (
  <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
    <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
      <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
    </div>
    <h2 className="text-xl font-bold text-gray-100">{title}</h2>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", className = "" }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, className = "" }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
      >
        <option value="">Pilih...</option>
        {options.map((opt: any, idx: number) => {
          const labelVal = typeof opt === 'string' ? opt : opt.label;
          const valVal = typeof opt === 'string' ? opt : opt.label; 
          return <option key={idx} value={valVal}>{labelVal}</option>;
        })}
      </select>
      <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder, className = "" }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-600 resize-y"
    />
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors flex items-center gap-1 text-xs"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      {copied ? 'Tersalin' : 'Salin'}
    </button>
  );
};

// --- Main Component ---

interface PromptBuilderProps {
  onUsePrompt: (prompt: string) => void;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ onUsePrompt }) => {
  // State
  const [characters, setCharacters] = useState([
    { id: 1, race: '', raceCustom: '', gender: '', age: '', clothing: '', hair: '', voice: '', description: '', action: '' }
  ]);
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [env, setEnv] = useState({
    description: '',
    lighting: '',
    angle: '',
    style: '',
    other: ''
  });

  // Handlers
  const addCharacter = () => {
    const newId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
    setCharacters([...characters, { id: newId, race: '', raceCustom: '', gender: '', age: '', clothing: '', hair: '', voice: '', description: '', action: '' }]);
  };

  const removeCharacter = (id: number) => {
    setCharacters(characters.filter(c => c.id !== id));
    setDialogs(dialogs.filter(d => d.charId !== id)); 
  };

  const updateCharacter = (id: number, field: string, value: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addDialog = () => {
    setDialogs([...dialogs, { id: Date.now(), charId: '', text: '' }]);
  };

  const removeDialog = (id: number) => {
    setDialogs(dialogs.filter(d => d.id !== id));
  };

  const updateDialog = (id: number, field: string, value: string) => {
    setDialogs(dialogs.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // Generation Logic
  const getPromptIndonesian = () => {
    let parts = [];

    // Environment
    let envParts = [];
    if (env.description) envParts.push(env.description);
    if (env.lighting) envParts.push(`Pencahayaan ${env.lighting}`);
    if (env.angle) envParts.push(`Sudut kamera ${env.angle}`);
    if (env.style) envParts.push(`Gaya ${env.style}`);
    if (env.other) envParts.push(env.other);
    if (envParts.length > 0) parts.push(`LINGKUNGAN: ${envParts.join(', ')}.`);

    // Characters
    characters.forEach((char, index) => {
      let charDesc = `KARAKTER ${index + 1}:`;
      let details = [];
      const race = char.race === 'Lainnya' ? char.raceCustom : char.race;
      
      if (race) details.push(race);
      if (char.gender) details.push(char.gender);
      if (char.age) details.push(`usia ${char.age}`);
      if (char.description) details.push(char.description);
      if (char.clothing) details.push(`memakai ${char.clothing}`);
      if (char.hair) details.push(`rambut ${char.hair}`);
      if (char.voice) details.push(`suara ${char.voice}`);
      if (char.action) details.push(`AKSI: ${char.action}`);

      if (details.length > 0) {
        parts.push(`${charDesc} ${details.join(', ')}.`);
      }
    });

    // Dialog
    if (dialogs.length > 0) {
      let dialogLines = dialogs.map(d => {
        const char = characters.find(c => c.id == Number(d.charId));
        const name = char ? `Karakter ${characters.indexOf(char) + 1} (${char.gender || 'Unknown'})` : 'Unknown';
        return `${name}: "${d.text}"`;
      });
      parts.push(`DIALOG:\n${dialogLines.join('\n')}`);
    }

    return parts.join('\n\n');
  };

  const getPromptEnglish = () => {
    // Helper to find English value
    const getEngRace = (val: string) => RACE_OPTIONS.find(r => r.label === val)?.value || val;
    const getEngGender = (val: string) => GENDER_OPTIONS.find(r => r.label === val)?.value || val;
    const getEngVoice = (val: string) => VOICE_OPTIONS.find(r => r.label === val)?.value || val;

    let parts = [];

    // Environment
    let envParts = [];
    if (env.description) envParts.push(env.description); 
    if (env.lighting) envParts.push(`${env.lighting}`);
    if (env.angle) envParts.push(`${env.angle}`);
    if (env.style) envParts.push(`${env.style}`);
    if (env.other) envParts.push(env.other);
    if (envParts.length > 0) parts.push(`ENVIRONMENT: ${envParts.join(', ')}.`);

    // Characters
    characters.forEach((char, index) => {
      let charDesc = `CHARACTER ${index + 1}:`;
      let details = [];
      const race = char.race === 'Lainnya' ? char.raceCustom : getEngRace(char.race);
      
      if (race) details.push(race);
      if (char.gender) details.push(getEngGender(char.gender));
      if (char.age) details.push(`age ${char.age}`);
      if (char.description) details.push(char.description); 
      if (char.clothing) details.push(`wearing ${char.clothing}`);
      if (char.hair) details.push(`${char.hair} hair`);
      if (char.voice) details.push(`${getEngVoice(char.voice)} voice`);
      if (char.action) details.push(`ACTION: ${char.action}`);

      if (details.length > 0) {
        parts.push(`${charDesc} ${details.join(', ')}.`);
      }
    });

    // Dialog
    if (dialogs.length > 0) {
      let dialogLines = dialogs.map(d => {
        const char = characters.find(c => c.id == Number(d.charId));
        const name = char ? `Character ${characters.indexOf(char) + 1}` : 'Unknown';
        return `${name}: "${d.text}"`;
      });
      parts.push(`DIALOGUE:\n${dialogLines.join('\n')}`);
    }

    return parts.join('\n\n');
  };

  const getPromptJSON = () => {
    const data = {
      meta: {
        generator: "VEO3 Prompt Generator",
        version: "1.0"
      },
      environment: {
        description: env.description,
        lighting: env.lighting,
        camera: env.angle,
        style: env.style,
        additional: env.other
      },
      characters: characters.map(c => ({
        race: c.race === 'Lainnya' ? c.raceCustom : c.race,
        gender: c.gender,
        age: c.age,
        appearance: {
          clothing: c.clothing,
          hair: c.hair,
          details: c.description
        },
        voice: c.voice,
        action: c.action
      })),
      dialogue: dialogs.map(d => {
        const char = characters.find(c => c.id == Number(d.charId));
        return {
          speaker_id: d.charId,
          speaker_gender: char ? char.gender : null,
          line: d.text
        };
      })
    };
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
      {/* LEFT COLUMN: INPUTS */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Group 1: Characters */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
          <SectionHeader icon={Users} title="Kelompok 1: Karakter" colorClass="bg-blue-500 text-blue-400" />
          
          <div className="space-y-6">
            {characters.map((char, index) => (
              <div key={char.id} className="bg-gray-950/50 border border-gray-800 rounded-lg p-5 relative group transition-all hover:border-gray-700">
                <div className="absolute top-4 right-4 flex gap-2">
                    <span className="text-xs font-mono text-gray-600 bg-gray-900 px-2 py-1 rounded">ID: {index + 1}</span>
                  {characters.length > 1 && (
                    <button 
                      onClick={() => removeCharacter(char.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Hapus Karakter"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">Karakter {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField 
                    label="Ras/Etnis" 
                    value={char.race} 
                    onChange={(e: any) => updateCharacter(char.id, 'race', e.target.value)}
                    options={RACE_OPTIONS} 
                  />
                  {char.race === 'Lainnya' && (
                    <InputField 
                      label="Sebutkan Ras/Etnis" 
                      value={char.raceCustom} 
                      onChange={(e: any) => updateCharacter(char.id, 'raceCustom', e.target.value)}
                      placeholder="Mis: Alien, Cyborg..."
                    />
                  )}
                  <SelectField 
                    label="Jenis Kelamin" 
                    value={char.gender} 
                    onChange={(e: any) => updateCharacter(char.id, 'gender', e.target.value)}
                    options={GENDER_OPTIONS} 
                  />
                  <InputField 
                    label="Usia" 
                    value={char.age} 
                    onChange={(e: any) => updateCharacter(char.id, 'age', e.target.value)}
                    placeholder="Mis: 25 tahun, Remaja..." 
                  />
                    <InputField 
                    label="Pakaian" 
                    value={char.clothing} 
                    onChange={(e: any) => updateCharacter(char.id, 'clothing', e.target.value)}
                    placeholder="Mis: Jas hitam, Kaos putih..." 
                  />
                  <InputField 
                    label="Gaya Rambut" 
                    value={char.hair} 
                    onChange={(e: any) => updateCharacter(char.id, 'hair', e.target.value)}
                    placeholder="Mis: Pendek bergelombang..." 
                  />
                  <SelectField 
                    label="Suara Karakter" 
                    value={char.voice} 
                    onChange={(e: any) => updateCharacter(char.id, 'voice', e.target.value)}
                    options={VOICE_OPTIONS} 
                  />
                  <div className="md:col-span-2">
                      <InputField 
                      label="Deskripsi Fisik Tambahan" 
                      value={char.description} 
                      onChange={(e: any) => updateCharacter(char.id, 'description', e.target.value)}
                      placeholder="Mis: Memiliki bekas luka di pipi, mata biru..." 
                    />
                  </div>
                  <div className="md:col-span-2">
                      <TextAreaField 
                      label="Aksi / Gerakan" 
                      value={char.action} 
                      onChange={(e: any) => updateCharacter(char.id, 'action', e.target.value)}
                      placeholder="Mis: Berjalan perlahan mendekati kamera sambil tersenyum..." 
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addCharacter}
              className="w-full py-3 border-2 border-dashed border-gray-800 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} /> Tambah Karakter
            </button>
          </div>
        </section>

        {/* Group 2: Dialog */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
          <SectionHeader icon={MessageSquare} title="Kelompok 2: Dialog" colorClass="bg-green-500 text-green-400" />
          
          <div className="space-y-4">
            {dialogs.length === 0 && (
              <div className="text-center py-6 text-gray-600 italic text-sm">
                Belum ada dialog. Tambahkan dialog untuk membuat cerita.
              </div>
            )}
            
            {dialogs.map((dialog, index) => (
              <div key={dialog.id} className="flex gap-3 items-start animate-fadeIn">
                <div className="w-1/3">
                  <select
                      value={dialog.charId}
                      onChange={(e) => updateDialog(dialog.id, 'charId', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 text-sm text-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Pilih Pembicara...</option>
                    {characters.map((c, idx) => (
                      <option key={c.id} value={c.id}>
                        Karakter {idx + 1} ({c.gender || '?'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={dialog.text}
                    onChange={(e) => updateDialog(dialog.id, 'text', e.target.value)}
                    placeholder="Ketik dialog di sini..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 text-sm text-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <button 
                  onClick={() => removeDialog(dialog.id)}
                  className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-gray-800 rounded-md transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button 
              onClick={addDialog}
              className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition flex items-center gap-2"
            >
              <Plus size={16} /> Tambah Baris Dialog
            </button>
          </div>
        </section>

        {/* Group 3: Environment */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
          <SectionHeader icon={Aperture} title="Kelompok 3: Lingkungan & Kamera" colorClass="bg-purple-500 text-purple-400" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
                <TextAreaField 
                label="Deskripsi Lingkungan" 
                value={env.description} 
                onChange={(e: any) => setEnv({...env, description: e.target.value})}
                placeholder="Mis: Hutan futuristik dengan pohon-pohon bercahaya neon, hujan rintik-rintik..." 
              />
            </div>
            <SelectField 
              label="Pencahayaan" 
              value={env.lighting} 
              onChange={(e: any) => setEnv({...env, lighting: e.target.value})}
              options={LIGHTING_OPTIONS} 
            />
            <SelectField 
              label="Sudut Kamera" 
              value={env.angle} 
              onChange={(e: any) => setEnv({...env, angle: e.target.value})}
              options={CAMERA_ANGLES} 
            />
            <SelectField 
              label="Gaya Pengambilan Gambar" 
              value={env.style} 
              onChange={(e: any) => setEnv({...env, style: e.target.value})}
              options={SHOT_STYLES} 
            />
            <InputField 
              label="Opsi Lainnya (Film Stock/Ratio)" 
              value={env.other} 
              onChange={(e: any) => setEnv({...env, other: e.target.value})}
              placeholder="Mis: 35mm film, 4k, HDR, 16:9..." 
            />
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: RESULTS */}
      <div className="lg:col-span-5 space-y-6">
        <div className="sticky top-24 space-y-6">
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-500" size={20} />
            <h2 className="text-xl font-bold text-white">Hasil Prompt</h2>
          </div>

          {/* Indo Prompt */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <img src="https://flagcdn.com/w20/id.png" alt="ID" className="rounded-sm opacity-80"/> Prompt Bahasa Indonesia
              </span>
              <div className="relative h-6 w-20"> {/* Spacer for button */} </div> 
            </div>
            <div className="p-4 relative bg-gray-900 min-h-[120px]">
                <CopyButton text={getPromptIndonesian()} />
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300 leading-relaxed">
                {getPromptIndonesian() || <span className="text-gray-600 italic">Isi formulir untuk melihat hasil...</span>}
              </pre>
            </div>
          </div>

          {/* English Prompt */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <img src="https://flagcdn.com/w20/gb.png" alt="GB" className="rounded-sm opacity-80"/> Prompt Bahasa Inggris
              </span>
            </div>
            <div className="p-4 relative bg-gray-900 min-h-[120px]">
                <CopyButton text={getPromptEnglish()} />
              <pre className="whitespace-pre-wrap font-mono text-xs text-blue-200 leading-relaxed mb-4">
                {getPromptEnglish() || <span className="text-gray-600 italic">Isi formulir untuk melihat hasil...</span>}
              </pre>
              
              {/* Added Button to Use this Prompt */}
              {getPromptEnglish() && (
                <Button 
                  onClick={() => onUsePrompt(getPromptEnglish())} 
                  className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-500"
                >
                  <Video className="w-3 h-3 mr-2" /> Use this Prompt in Studio
                </Button>
              )}
            </div>
          </div>

          {/* JSON Prompt */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Settings size={14} /> Prompt JSON
              </span>
            </div>
            <div className="p-4 relative bg-gray-950 min-h-[120px]">
                <CopyButton text={getPromptJSON()} />
              <pre className="whitespace-pre-wrap font-mono text-[10px] text-green-400 leading-relaxed overflow-x-auto">
                {getPromptJSON()}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};