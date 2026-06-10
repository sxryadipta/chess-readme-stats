export async function GET(request, context) {
  const { username } = await context.params

  return new Response(`Hello, ${username}!`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}