mp.events.add('entityStreamIn', (entity) => {
	if (entity.type === 'vehicle') {
		mp.events.callRemote('server::vehicleStreamIn', entity.remoteId);
	}
});