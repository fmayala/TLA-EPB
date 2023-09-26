import db from "$lib/server/db.js";
import { json } from "@sveltejs/kit";

async function getProfiles(page: number) {
    const limit = 5;

    const profiles = await db.xfmrDriverProfile.findMany({
        skip: (page - 1) * limit,
        take: limit
    });

    return profiles;
}

async function getProfileCount() {
    return await db.xfmrDriverProfile.count();
}

// Pull profiles page at a time
export async function GET({ url }) {
	const page = Number(url.searchParams.get('page') || 1);
    // const limit = Number(url.searchParams.get('limit') || 5);


    try {
        const profiles = await getProfiles(page);

        return json({
            profiles,
            count: await getProfileCount()
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        return json({ error: e }, { status: 400 });
    } 
}

