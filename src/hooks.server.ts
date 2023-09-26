import cors from 'cors';

// or use cors middleware
const corsHandler = cors({
	origin: true,
	credentials: true
});

export const handle = async ({ event, resolve }) => {
	event.setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
	});

	const response = await resolve(event, {});

	return response;
};
