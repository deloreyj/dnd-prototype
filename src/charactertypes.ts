export type Ability = {
	name: string;
	description: string;
	usesLeft: number;
	effect: string;
};
export type AbilityIndex = {
	[key: string]: Ability;
};
export enum StatName {
	STR,
	DEX,
	CON,
	INT,
	WIS,
	CHA
}
type Stat = {
	raw: number;
	bonus: number;
};
export type StatIndex = {
	[key in keyof StatName as string]: Stat;
};
export const SkillNameToStatNameMap = {
	ACROBATICS: StatName.DEX,
	ANIMAL_HANDLING: StatName.WIS,
	ARCANA: StatName.INT,
	ATHLETICS: StatName.STR,
	DECEPTION: StatName.CHA,
	HISTORY: StatName.INT,
	INSIGHT: StatName.WIS,
	INTIMIDATION: StatName.CHA,
	INVESTIGATION: StatName.INT,
	MEDICINE: StatName.WIS,
	NATURE: StatName.INT,
	PERCEPTION: StatName.WIS,
	PERFORMANCE: StatName.CHA,
	PERSUASION: StatName.CHA,
	RELIGION: StatName.INT,
	SLEIGHT_OF_HAND: StatName.DEX,
	STEALTH: StatName.DEX,
	SURVIVAL: StatName.WIS,
} as const;
type Skill = {
	drivingStat: StatName;
	proficient: boolean;
	value: number;
	passiveValue: number;
};
export type SkillIndex = {
	[key in keyof typeof SkillNameToStatNameMap as string]: Skill;
};
export type SkillProficiencySet = keyof StatName;
