import React, { useState } from 'react';
import axios from 'axios';
import xml2js from 'xml2js';

import { Podcast, Episode } from './types/podcast';

const PodcastViewer: React.FC = () => {
    const [rssUrl, setRssUrl] = useState<string>('');
    const [podcast, setPodcast] = useState<Podcast | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPodcast = async (url: string) => {
        try {
            const newUrl = 'https://corsproxy.io/?' + encodeURIComponent(url); 
            const response = await axios.get(newUrl, { responseType: 'text' });
            const parsedResult = await xml2js.parseStringPromise(response.data, {
                trim: true,
                explicitArray: false,
            });

            const channel = parsedResult.rss.channel;
            const episodes: Episode[] = (Array.isArray(channel.item) ? channel.item : [channel.item]).map((item: any) => ({
                title: item.title,
                description: item.description,
                pubDate: item.pubDate,
                duration: item['itunes:duration'] ? parseInt(item['itunes:duration'], 10) : undefined,
                url: item.enclosure?.$.url,
                author: item['itunes:author'],
                episodeType: item['itunes:episodeType'],
                subtitle: item['itunes:subtitle'],
            }));

            setPodcast({
                title: channel.title,
                description: channel.description,
                imageUrl: channel['itunes:image']?.$.href || channel.image?.url,
                episodes: episodes,
                language: channel.language,
                lastBuildDate: channel.lastBuildDate,
                author: channel['itunes:author'],
                summary: channel['itunes:summary'],
            });
            setError(null);
        } catch (err) {
            setError('Failed to fetch or parse the podcast RSS feed.');
            setPodcast(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPodcast(rssUrl);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Podcast Viewer</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="rssUrl" className="form-label">Podcast RSS URL</label>
                    <input
                        type="text"
                        className="form-control"
                        id="rssUrl"
                        value={rssUrl}
                        onChange={(e) => setRssUrl(e.target.value)}
                        placeholder="Enter podcast RSS feed URL"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Fetch Podcast</button>
            </form>

            {error && <div className="alert alert-danger mt-4">{error}</div>}

            {podcast && (
                <div className="mt-4">
                    <div className="row">
                        {podcast.imageUrl && (
                            <div className="col-md-3">
                                <img src={podcast.imageUrl} alt={podcast.title} className="img-fluid rounded" />
                            </div>
                        )}
                        <div className={podcast.imageUrl ? "col-md-9" : "col-md-12"}>
                            <h2>{podcast.title}</h2>
                            <p><strong>Description:</strong> {podcast.description}</p>
                            <p><strong>Language:</strong> {podcast.language}</p>
                            <p><strong>Last Build Date:</strong> {podcast.lastBuildDate}</p>
                            <p><strong>Author:</strong> {podcast.author}</p>
                            <p><strong>Summary:</strong> {podcast.summary}</p>
                        </div>
                    </div>

                    <h3 className="mt-4">Episodes</h3>
                    <hr />
                    <ul className="list-group">
                        {podcast.episodes.map((episode, index) => (
                            <li key={index} className="list-group-item">
                                <h4>{episode.title}</h4>
                                {episode.subtitle && <p><strong>Subtitle:</strong> {episode.subtitle}</p>}
                                {episode.description && <p><strong>Description:</strong> {episode.description}</p>}
                                <p><strong>Published:</strong> {new Date(episode.pubDate).toLocaleDateString()}</p>
                                {episode.author && <p><strong>Author:</strong> {episode.author}</p>}
                                {episode.episodeType && <p><strong>Type:</strong> {episode.episodeType}</p>}
                                {episode.duration && <p><strong>Duration:</strong> {episode.duration} seconds</p>}
                                <a href={episode.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">Listen</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PodcastViewer;
