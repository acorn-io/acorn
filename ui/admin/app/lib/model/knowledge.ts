export const KnowledgeSourceType = {
    OneDrive: "OneDrive",
    Notion: "Notion",
    Website: "Website",
} as const;
export type KnowledgeSourceType =
    (typeof KnowledgeSourceType)[keyof typeof KnowledgeSourceType];

export const KnowledgeFileState = {
    Pending: "pending",
    Ingesting: "ingesting",
    Ingested: "ingested",
    Error: "error",
    Unapproved: "unapproved",
    PendingApproval: "pending-approval",
} as const;
export type KnowledgeFileState =
    (typeof KnowledgeFileState)[keyof typeof KnowledgeFileState];

export const KnowledgeSourceStatus = {
    Pending: "pending",
    Syncing: "syncing",
    Synced: "synced",
    Error: "error",
} as const;
export type KnowledgeSourceStatus =
    (typeof KnowledgeSourceStatus)[keyof typeof KnowledgeSourceStatus];

export type KnowledgeSource = {
    id: string;
    name: string;
    agentID: string;
    state: KnowledgeSourceStatus;
    syncDetails?: RemoteKnowledgeSourceState;
    status?: string;
    error?: string;
    authStatus?: AuthStatus;
    lastSyncStartTime?: string;
    lastSyncEndTime?: string;
    lastRunID?: string;
} & KnowledgeSourceInput;

type AuthStatus = {
    url?: string;
    authenticated?: boolean;
    required?: boolean;
    error?: string;
};

export type KnowledgeSourceInput = {
    syncSchedule?: string;
    autoApprove?: boolean;
    onedriveConfig?: OneDriveConfig;
    notionConfig?: NotionConfig;
    websiteCrawlingConfig?: WebsiteCrawlingConfig;
};

type OneDriveConfig = {
    sharedLinks?: string[];
};

type NotionConfig = {
    pages?: string[];
};

type WebsiteCrawlingConfig = {
    urls?: string[];
};

type RemoteKnowledgeSourceState = {
    onedriveState?: OneDriveLinksConnectorState;
    notionState?: NotionConnectorState;
    websiteCrawlingState?: WebsiteCrawlingConnectorState;
};

type OneDriveLinksConnectorState = {
    folders?: FolderSet;
    files?: Record<string, FileState>;
    links?: Record<string, LinkState>;
};

type LinkState = {
    name?: string;
    isFolder?: boolean;
};

type FileState = {
    fileName: string;
    folderPath?: string;
    url?: string;
};

type NotionConnectorState = {
    pages?: Record<string, NotionPage>;
};

type NotionPage = {
    url?: string;
    title?: string;
    folderPath?: string;
};

type WebsiteCrawlingConnectorState = {
    pages?: Record<string, PageDetails>;
    scrapeJobIds?: Record<string, string>;
    folders?: FolderSet;
};

type PageDetails = {
    parentURL?: string;
};

type FolderSet = {
    [key: string]: undefined;
};

export type KnowledgeFile = {
    id: string;
    fileName: string;
    state: KnowledgeFileState;
    error?: string;
    agentID?: string;
    threadID?: string;
    knowledgeSetID?: string;
    knowledgeSourceID?: string;
    approved?: boolean;
    url?: string;
    updatedAt?: string;
    checksum?: string;
    lastIngestionStartTime?: Date;
    lastIngestionEndTime?: Date;
    lastRunIDs?: string[];
    deleted?: string;
};

export function getRemoteFileDisplayName(item: KnowledgeFile) {
    return item.fileName;
}

export function getMessage(state: KnowledgeFileState, error?: string) {
    if (state === KnowledgeFileState.Error) {
        return error ?? "Ingestion failed";
    }

    if (state === KnowledgeFileState.PendingApproval) {
        return "Pending approval, click to approve";
    }

    return state;
}

export function getKnowledgeSourceType(source: KnowledgeSource) {
    if (source.notionConfig) {
        return KnowledgeSourceType.Notion;
    }

    if (source.onedriveConfig) {
        return KnowledgeSourceType.OneDrive;
    }

    return KnowledgeSourceType.Website;
}

export function getKnowledgeSourceDisplayName(source: KnowledgeSource) {
    if (source.notionConfig) {
        return "Notion";
    }

    if (source.onedriveConfig) {
        if (
            source.syncDetails?.onedriveState?.links &&
            source.onedriveConfig.sharedLinks &&
            source.onedriveConfig.sharedLinks.length > 0
        ) {
            return source.syncDetails?.onedriveState?.links[
                source.onedriveConfig.sharedLinks[0]
            ].name;
        }

        return "OneDrive";
    }

    if (source.websiteCrawlingConfig) {
        if (
            source.websiteCrawlingConfig.urls &&
            source.websiteCrawlingConfig.urls.length > 0
        ) {
            return source.websiteCrawlingConfig.urls[0];
        }

        return "Website";
    }

    return source.name;
}

export function getToolRefForKnowledgeSource(sourceType: KnowledgeSourceType) {
    if (sourceType === KnowledgeSourceType.OneDrive) {
        return "onedrive-data-source";
    }

    if (sourceType === KnowledgeSourceType.Notion) {
        return "notion-data-source";
    }

    if (sourceType === KnowledgeSourceType.Website) {
        return "website-data-source";
    }

    return "";
}
