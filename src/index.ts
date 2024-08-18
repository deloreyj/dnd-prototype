import { DurableObject, WorkerEntrypoint } from 'cloudflare:workers';
import { z } from 'zod';

const characterSchema = z.object({
	name: z.string(),
	alignment: z.string(),
	stats: z.object({}).passthrough(),
	backStory: z.string(),
	abilities: z.any(), // TODO: Add ability schema
	hitPoints: z.number(),
	movementSpeed: z.number(),
});

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * Associate bindings declared in wrangler.toml with the TypeScript type system
 */
export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	CHARACTERS: DurableObjectNamespace<Character>;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

/**
 * Encounter class
 * Keep track of turn order and current active character
 * Keep track of the current scene and the characters in the scene
 * -- This will include the grid of the scene and the placement of the characters, obstacles, elevation, etc so that we can calculate
 * Keep track of the current round and the actions taken in the current round
 */

/**
 * The Character class represents a character in a Dungeons and Dragons campaign.
 *
 * Properties:
 * - name: string - The name of the character.
 * - alignment: string - The alignment of the character (e.g., Lawful Good, Chaotic Evil).
 * - stats: object - An object containing the character's stats (e.g., strength, dexterity, constitution, intelligence, wisdom, charisma).
 * - backStory: string - A brief back story of the character.
 * - abilities: object - An object containing the character's regular and magical abilities.
 * - hitPoints: number - The current hit points of the character.
 *
 * Methods:
 * - constructor(name: string, alignment: string, stats: object, backStory: string, abilities: object, hitPoints: number) - Initializes a new character with the given properties.
 * - takeDamage(amount: number) - Reduces the character's hit points by the given amount.
 * - heal(amount: number) - Increases the character's hit points by the given amount.
 * - addAbility(name: string, description: string) - Adds a new ability to the character.
 * - removeAbility(name: string) - Removes an ability from the character.
 * - updateStats(newStats: object) - Updates the character's stats with the given new stats.
 */

type Ability = {
	name: string;
	description: string;
	usesLeft: number;
	effect: string;
};

type AbilityIndex = {
	[key: string]: Ability;
};

export class Character extends DurableObject {
	name: string;
	alignment: string;
	stats: object;
	backStory: string;
	abilities: AbilityIndex;
	hitPoints: number;
	movementSpeed: number;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.name = '';
		this.alignment = '';
		this.stats = {};
		this.backStory = '';
		this.abilities = {};
		this.hitPoints = 0;
		this.movementSpeed = 0;
	}

	initialize(
		name: string,
		alignment: string,
		stats: object,
		backStory: string,
		abilities: AbilityIndex,
		hitPoints: number,
		movementSpeed: number
	) {
		this.name = name;
		this.alignment = alignment;
		this.stats = stats;
		this.backStory = backStory;
		this.abilities = abilities;
		this.hitPoints = hitPoints;
		this.movementSpeed = movementSpeed;
	}

	takeDamage(amount: number) {
		this.hitPoints -= amount;
	}

	heal(amount: number) {
		this.hitPoints += amount;
	}

	addAbility(ability: Ability) {
		this.abilities[ability.name] = ability;
	}

	removeAbility(name: string) {
		delete this.abilities[name];
	}

	updateStats(newStats: object) {
		this.stats = { ...this.stats, ...newStats };
	}

	move(distance: number) {
		// TODO: Implement the logic for moving the character
		console.log(`${this.name} moves ${distance} units at a speed of ${this.movementSpeed}.`);
	}
}

export default class DNDPartyWorker extends WorkerEntrypoint<Env> {
	env: Env;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.env = env;
	}

	async fetch(request: Request) {
		const url = new URL(request.url);
		const characterName = url.searchParams.get('name');
		if (!characterName) {
			return new Response('Character name is required', { status: 400 });
		}

		const id = this.env.CHARACTERS.idFromName(characterName);
		const stub = await this.env.CHARACTERS.get(id);
		return new Response(stub.name);
	}

	async createCharacter(request: Request) {
		const parsedData = characterSchema.parse(await request.json());
		const { name, alignment, stats, backStory, abilities, hitPoints, movementSpeed } = parsedData;

		if (!name) {
			return new Response('Character name is required', { status: 400 });
		}

		const id = this.env.CHARACTERS.idFromName(name);
		const stub = await this.env.CHARACTERS.get(id);
		await stub.initialize(name, alignment, stats, backStory, abilities, hitPoints, movementSpeed);

		return new Response('Character created successfully', { status: 201 });
	}
}
