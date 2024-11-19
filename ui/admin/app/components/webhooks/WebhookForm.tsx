import useSWR from "swr";

import { WorkflowService } from "~/lib/service/api/workflowService";

import {
    ControlledCustomInput,
    ControlledInput,
} from "~/components/form/controlledInputs";
import { Button } from "~/components/ui/button";
import { FormItem, FormLabel } from "~/components/ui/form";
import {
    Select,
    SelectContent,
    SelectEmptyItem,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    WebhookFormContextProps,
    WebhookFormContextProvider,
    useWebhookFormContext,
} from "~/components/webhooks/WebhookFormContext";

type WebhookFormProps = WebhookFormContextProps;

export function WebhookForm(props: WebhookFormProps) {
    return (
        <WebhookFormContextProvider {...props}>
            <WebhookFormContent />
        </WebhookFormContextProvider>
    );
}

export function WebhookFormContent() {
    const { form, handleSubmit, isLoading, isEdit } = useWebhookFormContext();

    const getWorkflows = useSWR(WorkflowService.getWorkflows.key(), () =>
        WorkflowService.getWorkflows()
    );

    const workflows = getWorkflows.data;

    // note(ryanhopperlowe): this will change depending on webhook type
    if (!form.watch("validationHeader")) {
        form.setValue("validationHeader", "X-Hub-Signature-256");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
            <ControlledInput
                control={form.control}
                name="name"
                className="text-3xl"
                placeholder="Enter the name of the webhook"
                variant="ghost"
            />

            <ControlledInput
                control={form.control}
                name="description"
                placeholder="Enter the description of the webhook"
                className="text-xl"
                variant="ghost"
            />

            <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value="Github" disabled>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="Github">Github</SelectItem>
                    </SelectContent>
                </Select>
            </FormItem>

            {/* Extract to custom github component */}

            <ControlledCustomInput
                control={form.control}
                name="workflow"
                label="Workflow"
                description="The workflow that will be triggered when the webhook is called."
            >
                {({ field: { ref: _, ...field }, className }) => (
                    <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className={className}>
                            <SelectValue placeholder="Select a workflow" />
                        </SelectTrigger>

                        <SelectContent>{getWorkflowOptions()}</SelectContent>
                    </Select>
                )}
            </ControlledCustomInput>

            <ControlledInput
                control={form.control}
                name="secret"
                label="Secret"
                description="This secret should match the secret you provide to GitHub."
            />

            <ControlledInput
                control={form.control}
                name="token"
                label="Token (optional)"
                description="Optionally provide a token to add an extra layer of security."
            />

            <Button
                className="w-full"
                type="submit"
                disabled={isLoading}
                loading={isLoading}
            >
                {isEdit ? "Update Webhook" : "Create Webhook"}
            </Button>
        </form>
    );

    function getWorkflowOptions() {
        if (getWorkflows.isLoading)
            return (
                <SelectEmptyItem disabled>Loading workflows...</SelectEmptyItem>
            );

        if (!workflows?.length)
            return (
                <SelectEmptyItem disabled>No workflows found</SelectEmptyItem>
            );

        return workflows.map((workflow) => (
            <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
            </SelectItem>
        ));
    }
}
