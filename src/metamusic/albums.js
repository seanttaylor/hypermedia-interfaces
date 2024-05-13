export const albums = {
    n97PvnilLJ: {
      AlbumId: 'n97PvnilLJ',
      AlbumTitle: 'The Best of 2022',
      Artist: 'Various Artists',
      ReleaseDate: '2022-04-20',
      Genre: ['Pop', 'Rock'],
      Tracks: [
        {
          TrackId: 'n97PvnilLJ:001',
          TrackTitle: 'Summer Vibes',
          Duration: '3:30',
          Lyrics: 'Sunshine, beaches, and good times',
          Credits: ['John Smith', 'Emma Johnson'],
          Bpm: 120,
        },
        {
          TrackId: 'n97PvnilLJ:002',
          TrackTitle: 'City Lights',
          Duration: '4:10',
          Lyrics: 'Neon signs and bustling streets',
          Credits: ['Sarah Brown', 'Michael Lee'],
          Bpm: 140,
        },
        {
          TrackId: 'n97PvnilLJ:003',
          TrackTitle: 'In the Moment',
          Duration: '3:45',
          Lyrics: 'Cherish every second',
          Credits: ['David Wilson', 'Emily Parker'],
          Bpm: 110,
        },
      ],
    },
};

/**
 * Create a unique patch spec for the album
 */
export const generateAlbumTrackPatchSpec = (tracks, patches) => {
  tracks.forEach((track, index) => {
      patches.push(
          { op: 'move', from: `/tracks/${index}/TrackId`, path: `/tracks/${index}/track_id` },
          { op: 'move', from: `/tracks/${index}/TrackTitle`, path: `/tracks/${index}/track_title` },
          { op: 'move', from: `/tracks/${index}/Duration`, path: `/tracks/${index}/duration` },
          { op: 'move', from: `/tracks/${index}/Lyrics`, path: `/tracks/${index}/lyrics` },
          { op: 'move', from: `/tracks/${index}/Credits`, path: `/tracks/${index}/credits` },
          { op: 'move', from: `/tracks/${index}/Bpm`, path: `/tracks/${index}/bpm` }
      );
  });
  return patches;
};