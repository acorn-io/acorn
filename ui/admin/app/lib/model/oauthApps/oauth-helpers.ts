import { ZodObject, ZodType } from "zod";

import { apiBaseUrl } from "~/lib/routers/apiRoutes";

export const OAuthProvider = {
    GitHub: "github",
    Google: "google",
    Microsoft365: "microsoft365",
    Slack: "slack",
    Notion: "notion",
    Custom: "custom",
} as const;
export type OAuthProvider = (typeof OAuthProvider)[keyof typeof OAuthProvider];

export type OAuthFormStep<T extends object = Record<string, string>> =
    | { type: "markdown"; text: string; copy?: string }
    | {
          type: "input";
          input: keyof T;
          label: string;
          inputType?: "password" | "text";
      }
    | { type: "copy"; text: string }
    | {
          type: "sectionGroup";
          sections: {
              title: string;
              steps: OAuthFormStep[];
              displayStepsInline?: boolean;
              defaultOpen?: boolean;
          }[];
      };

export type OAuthAppSpec = {
    schema: ZodObject<Record<string, ZodType>>;
    displayName: string;
    refName: string;
    type: OAuthProvider;
    logo?: string;
    darkLogo?: string;
    steps: OAuthFormStep[];
    disableConfiguration?: boolean;
    disabledReason?: string;
    invertDark?: boolean;
};

export function getOAuthLinks(type: OAuthProvider) {
    return {
        authorizeURL: `${apiBaseUrl}/app-oauth/authorize/${type}`,
        redirectURL: `${apiBaseUrl}/app-oauth/callback/${type}`,
        refreshURL: `${apiBaseUrl}/app-oauth/refresh/${type}`,
    };
}
