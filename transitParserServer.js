export function parseTransitItinerary(data) {
    const plan = data?.metaData?.plan;
    if (!plan || !plan.itineraries || plan.itineraries.length === 0) {
        return null;
    }

    const it = plan.itineraries[0];

    const totalTimeMin = Math.round((it.totalTime || 0) / 60);
    const totalFare = it.fare?.regular?.totalFare ?? 0;

    const legs = (it.legs || []).map(leg => ({
        mode: leg.mode,
        timeMin: Math.round((leg.sectionTime || 0) / 60),
        distanceM: leg.distance || 0,
        title: leg.route ? `버스 ${leg.route}` : leg.mode,
        sub: leg.start?.name && leg.end?.name
            ? `${leg.start.name} → ${leg.end.name}`
            : `${leg.distance}m 이동`
    }));

    return { totalTimeMin, totalFare, legs };
}
