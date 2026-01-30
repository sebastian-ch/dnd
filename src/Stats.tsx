import './App.css'

interface Character {
  name: string
  image: string
  race: string
  class: string
  hp: number
  ac: number
  speed: string
  initiative: string
  fort: string
  ref: string
  will: string
  attack: string
  notes: string
  skills?: string[]
  abilities: string[]
}

const base = import.meta.env.BASE_URL

const characters: Character[] = [
  {
    name: "Cat Stevens",
    image: `${base}cat.png`,
    race: "Catfolk",
    class: "Bard",
    hp: 8,
    ac: 15,
    speed: "30 ft",
    initiative: "+2",
    fort: "+0",
    ref: "+4",
    will: "+0",
    attack: "Wand of Ray of Frost (touch, 1d3)",
    notes: "Inspire Courage 9 rds/day (+1 atk/dmg). Bluff/Diplo +9. Cat's Luck 1/day.",
    abilities: [
      "Inspire Courage (9 rds/day): +1 atk/dmg/fear saves",
      "Fascinate: Will DC 15 or mesmerized",
      "Countersong / Distraction",
      "Cat's Luck (1/day): Reroll Reflex save",
      "Sprinter: +10 ft charge/run/withdraw",
      "Bardic Knowledge: +1 all Knowledge, use untrained",
      "Artifact Hunter: +1 Spellcraft/UMD",
    ],
  },
  {
    name: "Elkfor Wildwood",
    image: `${base}elkfor.png`,
    race: "Hobgoblin",
    class: "Necromancer",
    hp: 8,
    ac: 11,
    speed: "30 ft",
    initiative: "+3",
    fort: "+2",
    ref: "+1",
    will: "+2",
    attack: "Ray of Frost (1d3) / Grave Touch",
    notes: "Grave Touch 7/day (shaken). Turn Undead 7/day. Necro DC 15+lvl. Stealth +5.",
    skills: ["K. Arcana +8", "K. Planes +8", "K. Religion +8", "Spellcraft +8", "Stealth +5"],
    abilities: [
      "Grave Touch (7/day): Shaken 1 rd",
      "Turn Undead (7/day): DC 10, flee 1 min",
      "Arcane Bond: 1/day cast any spell from spellbook",
      "Scribe Scroll",
      "Pragmatic Activator: Int for UMD",
    ],
  },
  {
    name: "Fluff",
    image: `${base}fluff.png`,
    race: "Gnome",
    class: "Paladin",
    hp: 12,
    ac: 17,
    speed: "15 ft",
    initiative: "+2",
    fort: "+3",
    ref: "+0",
    will: "+4",
    attack: "MW Cold Iron Longsword +4 (1d8+2)",
    notes: "Smite Evil 1/day. Detect Evil at will. Fey Foundling (+2 HP/die healed). +4 AC vs giants.",
    skills: ["Sense Motive +5", "Heal +5", "Perception +3"],
    abilities: [
      "Smite Evil (1/day): +1 dmg, bypasses DR",
      "Detect Evil (at will)",
      "Fey Foundling: +2 HP/die healed",
      "Hatred: +1 atk vs goblinoids/reptilians",
      "Defensive Training: +4 AC vs giants",
      "Illusion Resistance: +2 vs illusions",
    ],
  },
  {
    name: "Robur",
    image: `${base}robur.png`,
    race: "Duergar",
    class: "Antipaladin",
    hp: 13,
    ac: 10,
    speed: "20 ft",
    initiative: "+0",
    fort: "+4",
    ref: "+0",
    will: "+4",
    attack: "Sword Cane +5 (1d6+4)",
    notes: "Smite Good 1/day. 5 PE/day (Mind Thrust, Ironskin). TK Invisibility at will. SR 12.",
    skills: ["Sense Motive +6", "Bluff +3", "Intimidate +1"],
    abilities: [
      "Smite Good (1/day): +1 dmg",
      "Detect Good (at will)",
      "Mind Thrust I (1 PE): 1d6 dmg, Will DC 12 half",
      "Ironskin (2 PE): DR 4/adamantine",
      "TK Invisibility: Invisible until attack",
      "TK Finesse: Use skills at 30 ft range",
      "Spell Resistance 12",
      "Immune: Paralysis, phantasms, poison",
    ],
  },
  {
    name: "Sebastian",
    image: `${base}sebastian.png`,
    race: "Duskwalker",
    class: "Investigator",
    hp: 8,
    ac: 10,
    speed: "30 ft",
    initiative: "+0",
    fort: "-1",
    ref: "+2",
    will: "+6",
    attack: "Rapier +0 (1d6, 18-20)",
    notes: "Inspiration 2/day. Trapfinding +1. Ghost Hunter 1/day. Knowledge (Geo) +9.",
    skills: ["K. Geography +9", "Perception +8", "K. Arcana +6", "K. History +6", "K. Nobility +6", "Craft (Alchemy) +6", "Linguistics +6", "Spellcraft +6", "Heal +6"],
    abilities: [
      "Inspiration (2/day): +1d6 to checks",
      "Trapfinding: +1 Perception/Disable Device vs traps",
      "Ghost Hunter (1/day): Ghost touch weapons 1 min",
      "Ward vs Corruption: +2 vs death/undead",
      "Alchemy: 2 extracts/day",
    ],
  },
  {
    name: "Stixon",
    image: `${base}stixon.png`,
    race: "Wyrwood",
    class: "Ranger",
    hp: 21,
    ac: 12,
    speed: "30 ft",
    initiative: "+3",
    fort: "+2",
    ref: "+3",
    will: "+1",
    attack: "Longbow +3 (1d6, ×3)",
    notes: "vs Undead: +5 atk, +3 dmg. Bird companion. Construct immunities. No cure spells!",
    abilities: [
      "Favored Enemy (Undead): +2 atk, +3 dmg",
      "Bird Companion: Scout, Distract (shaken 1 rd)",
      "Construct Immunities: Mind, poison, disease, sleep, paralysis, bleed, death, fatigue",
      "Darkvision 60 ft / Low-Light Vision",
      "Track: +1 Survival tracking",
      "Destroyed at 0 HP (no dying)",
    ],
  }
]

export default function Stats() {
  return (
    <div className="app">
      <div className="chart-container">
        <table className="stat-chart">
          <thead>
            <tr>
              <th className="label-col"></th>
              {characters.map((c) => (
                <th key={c.name} className="character-col">
                  <img src={c.image} alt={c.name} className="char-img" />
                  <div className="char-name">{c.name}</div>
                  <div className="char-class">{c.race} {c.class}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="hp-row">
              <td className="label">HP</td>
              {characters.map((c) => (
                <td key={c.name} className="value hp">{c.hp}</td>
              ))}
            </tr>
            <tr className="ac-row">
              <td className="label">AC</td>
              {characters.map((c) => (
                <td key={c.name} className="value ac">{c.ac}</td>
              ))}
            </tr>
            <tr>
              <td className="label">Speed</td>
              {characters.map((c) => (
                <td key={c.name} className="value">{c.speed}</td>
              ))}
            </tr>
            <tr>
              <td className="label">Init</td>
              {characters.map((c) => (
                <td key={c.name} className="value">{c.initiative}</td>
              ))}
            </tr>
            <tr className="save-row">
              <td className="label">Fort</td>
              {characters.map((c) => (
                <td key={c.name} className="value save">{c.fort}</td>
              ))}
            </tr>
            <tr className="save-row">
              <td className="label">Ref</td>
              {characters.map((c) => (
                <td key={c.name} className="value save">{c.ref}</td>
              ))}
            </tr>
            <tr className="save-row">
              <td className="label">Will</td>
              {characters.map((c) => (
                <td key={c.name} className="value save">{c.will}</td>
              ))}
            </tr>
            <tr className="attack-row">
              <td className="label">Attack</td>
              {characters.map((c) => (
                <td key={c.name} className="value attack">{c.attack}</td>
              ))}
            </tr>
            <tr className="skills-row">
              <td className="label">Skills</td>
              {characters.map((c) => (
                <td key={c.name} className="value skills">{c.skills ? c.skills.map((s, i) => <div key={i}>{s}</div>) : "—"}</td>
              ))}
            </tr>
            <tr className="abilities-row">
              <td className="label">Abilities</td>
              {characters.map((c) => (
                <td key={c.name} className="value abilities">{c.abilities.map((a, i) => <div key={i}>{a}</div>)}</td>
              ))}
            </tr>
            <tr className="notes-row">
              <td className="label">Notes</td>
              {characters.map((c) => (
                <td key={c.name} className="value notes">{c.notes}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
