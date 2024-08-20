import type { MetaFunction } from '@remix-run/cloudflare';
import { json, LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{
			name: 'description',
			content: 'Welcome to Remix on Cloudflare!',
		},
	];
};

export const loader: LoaderFunction = async () => {
	const response = await fetch('http://localhost:8787/characters/katie');
	if (!response.ok) {
		throw new Error('Failed to fetch image');
	}
	const data = await response.json();

	return json(data);
};

export default function Index() {
	const data = useLoaderData<typeof loader>();
	console.log(data);
	return (
		<div className="font-sans p-4 flex flex-col items-center">
			<h1 className="text-3xl">Character Image</h1>
			<img src="http://localhost:8787/characters/katie/image" width="500px" alt="Character" className="mt-4" />
			<ul className="list-disc mt-4 pl-6 space-y-2">
				<li>
					<a className="text-blue-700 underline visited:text-purple-900" target="_blank" href="https://remix.run/docs" rel="noreferrer">
						Remix Docs
					</a>
				</li>
				<li>
					<a
						className="text-blue-700 underline visited:text-purple-900"
						target="_blank"
						href="https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/"
						rel="noreferrer"
					>
						Cloudflare Pages Docs - Remix guide
					</a>
				</li>
			</ul>
		</div>
	);
}
