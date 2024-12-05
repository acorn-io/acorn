import useSWR, { preload } from "swr";

import { ModelProvider } from "~/lib/model/modelProviders";
import { ModelProviderApiService } from "~/lib/service/api/modelProviderApiService";

import { TypographyH2 } from "~/components/Typography";
import { DefaultModelAliasFormDialog } from "~/components/composed/DefaultModelAliasForm";
import { ModelProviderBanner } from "~/components/model-providers/ModelProviderBanner";
import { ModelProviderList } from "~/components/model-providers/ModelProviderLists";
import { CommonModelProviderIds } from "~/components/model-providers/constants";

export async function clientLoader() {
    await preload(
        ModelProviderApiService.getModelProviders.key(),
        ModelProviderApiService.getModelProviders
    );

    return null;
}

const sortModelProviders = (modelProviders: ModelProvider[]) => {
    return [...modelProviders].sort((a, b) => {
        const preferredOrder = [
            CommonModelProviderIds.OPENAI,
            CommonModelProviderIds.AZURE_OPENAI,
            CommonModelProviderIds.ANTHROPIC,
            CommonModelProviderIds.OLLAMA,
            CommonModelProviderIds.VOYAGE,
        ];
        const aIndex = preferredOrder.indexOf(a.id);
        const bIndex = preferredOrder.indexOf(b.id);

        // If both providers are in preferredOrder, sort by their order
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }

        // If only a is in preferredOrder, it comes first
        if (aIndex !== -1) return -1;
        // If only b is in preferredOrder, it comes first
        if (bIndex !== -1) return 1;

        // For all other providers, sort alphabetically by name
        return a.name.localeCompare(b.name);
    });
};

export default function ModelProviders() {
    const getModelProviders = useSWR(
        ModelProviderApiService.getModelProviders.key(),
        ModelProviderApiService.getModelProviders
    );

    const configured = getModelProviders.data?.some(
        (provider) => provider.configured
    );
    const modelProviders = sortModelProviders(getModelProviders.data ?? []);
    return (
        <div>
            <div className="relative space-y-10 px-8 pb-8">
                <div className="sticky top-0 bg-background pt-8 flex items-center justify-between">
                    <TypographyH2 className="mb-0 pb-0">
                        Model Providers
                    </TypographyH2>
                    <DefaultModelAliasFormDialog disabled={!configured} />
                </div>

                {configured ? null : <ModelProviderBanner />}

                <div className="h-full flex flex-col gap-8 overflow-hidden">
                    <ModelProviderList modelProviders={modelProviders ?? []} />
                </div>
            </div>
        </div>
    );
}
