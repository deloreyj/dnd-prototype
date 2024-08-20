import { Hono } from 'hono';
import { Character } from './Character';
import { zValidator } from '@hono/zod-validator';
import { Ai } from '@cloudflare/workers-types';
import { CharacterSchema } from './types';

export interface Env {
	CHARACTERS: DurableObjectNamespace<Character>;
	AI: Ai;
}

const app = new Hono<{ Bindings: Env }>();

app.get('/characters/:characterName', async (c) => {
	const characterName = c.req.param('characterName');
	if (!characterName) {
		return c.text('Character name is required', 400);
	}
	console.log(characterName);

	const id = c.env.CHARACTERS.idFromName(characterName);
	const stub = await c.env.CHARACTERS.get(id);
	return c.json(await stub.toJSON());
});

app.get('/characters/:characterName/image', async (c) => {
	const characterName = c.req.param('characterName');
	if (!characterName) {
		return c.text('Character name is required', 400);
	}

	const id = c.env.CHARACTERS.idFromName(characterName);
	const stub = c.env.CHARACTERS.get(id);
	stub.initialize({
		name: "Lil' Tex",
		alignment: 'Chaotic Evil',
		stats: {},
		backStory: 'Mock Backstory',
		abilities: {},
		hitPoints: 10,
		movementSpeed: 30,
		physicalDescription: 'I look like woody from toy story',
		proficiencyBonus: 2,
		race: 'Dwarf',
	});
	const image = await stub.getImage();
	return new Response(image, {
		status: 200,
		headers: {
			'Content-Type': 'image/png',
		},
	});
});

app.post('/character', zValidator('json', CharacterSchema), async (c) => {
	const { name, alignment, stats, backStory, abilities, hitPoints, movementSpeed, physicalDescription, proficiencyBonus, race } =
		c.req.valid('json');

	if (!name) {
		return c.text('Character name is required', 400);
	}

	const id = c.env.CHARACTERS.idFromName(name);
	const stub = await c.env.CHARACTERS.get(id);
	await stub.initialize({
		name,
		alignment,
		stats,
		backStory,
		abilities,
		hitPoints,
		movementSpeed,
		physicalDescription,
		proficiencyBonus,
		race,
	});

	return c.text('Character created successfully', 201);
});

export default app;

export { Character };
