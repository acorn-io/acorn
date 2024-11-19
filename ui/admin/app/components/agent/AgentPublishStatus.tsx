import { Link } from "@remix-run/react";
import { useMemo } from "react";
import { $path } from "remix-routes";
import useSWR from "swr";

import { Agent } from "~/lib/model/agents";
import { ConsumptionUrl } from "~/lib/routers/baseRouter";
import { AssistantApiService } from "~/lib/service/api/assistantApiService";

import { TypographySmall } from "~/components/Typography";
import { Publish } from "~/components/agent/Publish";
import { Unpublish } from "~/components/agent/Unpublish";
import { CopyText } from "~/components/composed/CopyText";

type AgentPublishStatusProps = {
    agent: Agent;
    onChange: (agent: Partial<Agent>) => void;
};

export function AgentPublishStatus({
    agent,
    onChange,
}: AgentPublishStatusProps) {
    const getAssistants = useSWR(
        () =>
            agent.alias && !agent.aliasAssigned
                ? AssistantApiService.getAssistants.key()
                : null,
        () => AssistantApiService.getAssistants()
    );

    const refAgent = useMemo(() => {
        if (!getAssistants.data) return null;

        return getAssistants.data.find(({ id }) => id === agent.alias);
    }, [getAssistants.data, agent.alias]);

    return (
        <div className="flex w-full justify-between px-8 pt-4 items-center gap-4">
            {renderAgentRef()}

            {agent.alias ? (
                <Unpublish onUnpublish={() => onChange({ alias: "" })} />
            ) : (
                <Publish
                    alias={agent.alias}
                    onPublish={(alias) => onChange({ alias })}
                />
            )}
        </div>
    );

    function renderAgentRef() {
        if (!agent.alias) return <div />;

        if (refAgent && refAgent.id !== agent.id) {
            const route =
                refAgent.type === "agent"
                    ? $path("/agents/:agent", {
                          agent: refAgent.entityID,
                      })
                    : $path("/workflows/:workflow", {
                          workflow: refAgent.entityID,
                      });

            return (
                <div className="flex flex-col gap-1 h-full">
                    <div className="flex items-center gap-2">
                        <div className="size-2 bg-warning rounded-full" />
                        <TypographySmall>Unavailable</TypographySmall>
                    </div>

                    <TypographySmall className="pb-0 text-muted-foreground">
                        <span className="min-w-fit">
                            Ref name <b>{refAgent.id}</b> used by{" "}
                        </span>
                        <Link
                            className="text-accent-foreground underline"
                            to={route}
                        >
                            {refAgent.name}
                        </Link>
                    </TypographySmall>
                </div>
            );
        }

        if (!agent.aliasAssigned) return <div />;

        const agentUrl = ConsumptionUrl(`/${agent.alias}`);

        return (
            <div className="flex items-center gap-2">
                <CopyText
                    className="h-8 text-muted-foreground text-sm bg-background flex-row-reverse"
                    holdStatusDelay={6000}
                    text={agentUrl}
                    iconOnly
                />

                <Link
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground underline"
                    to={agentUrl}
                >
                    {agentUrl}
                </Link>
            </div>
        );
    }
}
