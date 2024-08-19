export const onRequest: PagesFunction<Env> = (context) => {
  console.log(context.env.ASSETS);
  return new Response("Hello, world!");
};
