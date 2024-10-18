import { ZodObject, ZodType } from "zod";

import { apiBaseUrl } from "~/lib/routers/apiRoutes";

export const OAuthProvider = {
    GitHub: "github",
    // Google: "google",
    // HubSpot: "hubspot",
    // Microsoft365: "microsoft365",
    // Notion: "notion",
    // Slack: "slack",
} as const;
export type OAuthProvider = (typeof OAuthProvider)[keyof typeof OAuthProvider];

export type OAuthFormStep<T extends object = Record<string, string>> =
    | { type: "instruction"; text: string; copy?: string }
    | { type: "input"; input: keyof T; label: string }
    | { type: "copy"; text: string };

export type OAuthSingleAppSpec = {
    schema: ZodObject<Record<string, ZodType>>;
    labels: Record<string, string>;
    displayName: string;
    refName: string;
    type: OAuthProvider;
    steps: OAuthFormStep[];
};

export function getOAuthLinks(type: OAuthProvider) {
    return {
        authorizeURL: `${apiBaseUrl}/app/oauth/authorize/${type}`,
        redirectURL: `${apiBaseUrl}/app/oauth/callback/${type}`,
        refreshURL: `${apiBaseUrl}/app/oauth/refresh/${type}`,
    };
}
