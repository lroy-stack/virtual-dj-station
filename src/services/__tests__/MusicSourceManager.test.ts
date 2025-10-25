import { describe, it, expect } from 'vitest';
import { MusicSourceManager } from '../MusicSourceManager';
import { Track } from '@/types';

type Case = [string, number];

const createTracks = (): Track[] => [
  {
    id: '1',
    title: 'Track 1',
    artist: 'Artist',
    artist_id: 'artist',
    duration: 180,
    file_url: 'url1',
    plays_count: 0,
    priority_level: 0,
    upload_date: '2020-01-01',
    status: 'approved'
  },
  {
    id: '2',
    title: 'Track 2',
    artist: 'Artist',
    artist_id: 'artist',
    duration: 200,
    file_url: 'url2',
    plays_count: 0,
    priority_level: 0,
    upload_date: '2020-01-02',
    status: 'approved'
  }
];

describe('MusicSourceManager.generateQueue', () => {
  const cases: Case[] = [
    ['free', 60],
    ['artist_basic', 70],
    ['artist_premium', 80],
    ['advertiser_basic', 75],
    ['advertiser_premium', 85],
    // unknown tier should fallback to free
    ['unknown', 60]
  ];

  it.each(cases)('prioritizes user tracks for %s tier', (tier, base) => {
    const manager = new MusicSourceManager();
    const tracks = createTracks();
    const queue = manager.generateQueue(tracks, tier);
    expect(queue).toHaveLength(tracks.length);
    expect(queue.map(q => q.priority)).toEqual([base + 2, base + 1]);
    queue.forEach(item => {
      expect(item.source).toBe('user');
    });
  });
});
