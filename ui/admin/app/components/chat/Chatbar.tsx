import { CircleArrowUpIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "~/lib/utils";

import { useChat } from "~/components/chat/ChatContext";
import { Button } from "~/components/ui/button";
import { AutosizeTextarea } from "~/components/ui/textarea";

type ChatbarProps = {
    className?: string;
};

export function Chatbar({ className }: ChatbarProps) {
    const [input, setInput] = useState("");
    const { processUserMessage } = useChat();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            processUserMessage(input, "user");
            setInput("");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex items-end gap-2 pb-10", className)}
        >
            <div className="relative flex-grow">
                <AutosizeTextarea
                    className="resize-none rounded-xl h-[2.5rem] line-height-[1.25rem] min-h-[2.5rem]"
                    value={input}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    maxHeight={200}
                    minHeight={0}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                />
            </div>

            <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                type="submit"
                disabled={!input}
            >
                <CircleArrowUpIcon />
            </Button>
        </form>
    );
}
