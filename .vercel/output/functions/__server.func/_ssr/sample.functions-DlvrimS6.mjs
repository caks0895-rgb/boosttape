import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { c as healthPayload, d as queryEvents, s as ensureFresh, u as paymentPublicStatus } from "./query.server-DEuJnAZ-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sample.functions-DlvrimS6.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getLandingData_createServerFn_handler = createServerRpc({
	id: "2feaec2eed45c2aecd2f03b1d83c78806d0219c8931dbbeba7fad8b3a45c7185",
	name: "getLandingData",
	filename: "src/lib/boosttape/sample.functions.ts"
}, (opts) => getLandingData.__executeServer(opts));
var getLandingData = createServerFn({ method: "GET" }).handler(getLandingData_createServerFn_handler, async () => {
	try {
		await ensureFresh();
	} catch (err) {
		console.warn("[boosttape] landing refresh failed", err);
	}
	return {
		health: healthPayload(),
		sample: queryEvents({
			chain: "all",
			type: "all",
			limit: 5,
			min_liq: 5e3,
			sinceMs: null
		}),
		payment: paymentPublicStatus()
	};
});
//#endregion
export { getLandingData_createServerFn_handler };
