export interface Episode {
    title: string;
    description?: string;
    pubDate: string;
    duration?: number;
    url: string;
    author?: string;
    episodeType?: string;
    subtitle?: string;
}

export interface Podcast {
    title: string;
    description?: string;
    imageUrl?: string;
    episodes: Episode[];
    language?: string;
    lastBuildDate?: string;
    author?: string;
    summary?: string;
}
