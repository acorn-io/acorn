import { RevealedEnv } from "~/lib/model/environmentVariables";
import { ApiRoutes } from "~/lib/routers/apiRoutes";
import { request } from "~/lib/service/api/primitives";

async function getEnvVariables(entityId: string) {
    const res = await request<RevealedEnv>({
        url: ApiRoutes.env.getEnv(entityId).url,
        errorMessage: "Failed to fetch workflow env",
    });

    return res.data;
}

async function updateEnvVariables(entityId: string, env: RevealedEnv) {
    await request({
        url: ApiRoutes.env.updateEnv(entityId).url,
        method: "POST",
        data: env,
        errorMessage: "Failed to update workflow env",
    });
}

export const EnvironmentApiService = {
    getEnvVariables,
    updateEnvVariables,
};
