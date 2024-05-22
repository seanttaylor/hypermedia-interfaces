/**
 * 
 */
const albums = {
    pascalCase: {
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
    },
    camelCase: {
        n97PvnilLJ: {
            albumId: 'n97PvnilLJ',
            albumTitle: 'The Best of 2022',
            artist: 'Various Artists',
            releaseDate: '2022-04-20',
            genre: ['Pop', 'Rock'],
            tracks: [
                {
                    trackId: 'n97PvnilLJ:001',
                    trackTitle: 'Summer Vibes',
                    duration: '3:30',
                    lyrics: 'Sunshine, beaches, and good times',
                    credits: ['John Smith', 'Emma Johnson'],
                    bpm: 120,
                },
                {
                    trackId: 'n97PvnilLJ:002',
                    trackTitle: 'City Lights',
                    duration: '4:10',
                    lyrics: 'Neon signs and bustling streets',
                    credits: ['Sarah Brown', 'Michael Lee'],
                    bpm: 140,
                },
                {
                    trackId: 'n97PvnilLJ:003',
                    trackTitle: 'In the Moment',
                    duration: '3:45',
                    lyrics: 'Cherish every second',
                    credits: ['David Wilson', 'Emily Parker'],
                    bpm: 110,
                },
            ],
        },
    },
    random: {
        n97PvnilLJ: {
            albumIdentifier: 'n97PvnilLJ',
            title: 'The Best of 2022',
            artistName: 'Various Artists',
            releaseDateYYYYMMDDD: '2022-04-20',
            categor: ['Pop', 'Rock'],
            trackList: [
                {
                    id: 'n97PvnilLJ:001',
                    title: 'Summer Vibes',
                    duration: '3:30',
                    lyrics: 'Sunshine, beaches, and good times',
                    credits: ['John Smith', 'Emma Johnson'],
                    bpm: 120,
                },
                {
                    id: 'n97PvnilLJ:002',
                    title: 'City Lights',
                    duration: '4:10',
                    lyrics: 'Neon signs and bustling streets',
                    credits: ['Sarah Brown', 'Michael Lee'],
                    bpm: 140,
                },
                {
                    id: 'n97PvnilLJ:003',
                    title: 'In the Moment',
                    duration: '3:45',
                    lyrics: 'Cherish every second',
                    credits: ['David Wilson', 'Emily Parker'],
                    bpm: 110,
                },
            ],
        },
    }
};

export class AlbumServiceRandomStrategy {
    name = 'CamelCase';
    #patches = [
        { op: 'move', from: '/albumIdentifier', path: '/album_id' },
        { op: 'move', from: '/title', path: '/album_title' },
        { op: 'move', from: '/releaseDateYYYYMMDD', path: '/release_date' },
        { op: 'move', from: '/category', path: '/genre' },
        { op: 'move', from: '/trackList', path: '/tracks' },
        { op: 'move', from: '/artistName', path: '/artist' },
    ];

    /**
     * Create a unique patch spec for a specified album
     * @param {object} tracks
     */
    generateAlbumPatchSpec(album) {
        album.trackList.forEach((_, index) => {
            this.#patches.push(
                { op: 'move', from: `/tracks/${index}/id`, path: `/tracks/${index}/track_id` },
                { op: 'move', from: `/tracks/${index}/title`, path: `/tracks/${index}/track_title` },
                { op: 'move', from: `/tracks/${index}/duration`, path: `/tracks/${index}/duration` },
                { op: 'move', from: `/tracks/${index}/lyrics`, path: `/tracks/${index}/lyrics` },
                { op: 'move', from: `/tracks/${index}/credits`, path: `/tracks/${index}/credits` },
                { op: 'move', from: `/tracks/${index}/bpm`, path: `/tracks/${index}/bpm` }
            );
        });
        return this.#patches;
    };

    /**
     * 
     * @param {String} albumId
     * @returns {Promise<Object>} 
     */
    async getAlbum(albumId) {
        return Promise.resolve(albums.camelCase[albumId]);
    }
}

export class AlbumServiceCamelCaseStrategy {
    name = 'CamelCase';
    #patches = [
        { op: 'move', from: '/albumId', path: '/album_id' },
        { op: 'move', from: '/albumTitle', path: '/album_title' },
        { op: 'move', from: '/releaseDate', path: '/release_date' },
        { op: 'move', from: '/genre', path: '/genre' },
        { op: 'move', from: '/tracks', path: '/tracks' },
        { op: 'move', from: '/artist', path: '/artist' },
    ];

    /**
     * Create a unique patch spec for a specified album
     * @param {Array} tracks
     */
    generateAlbumPatchSpec(album) {
        album.tracks.forEach((_, index) => {
            this.#patches.push(
                { op: 'move', from: `/tracks/${index}/trackId`, path: `/tracks/${index}/track_id` },
                { op: 'move', from: `/tracks/${index}/trackTitle`, path: `/tracks/${index}/track_title` },
                { op: 'move', from: `/tracks/${index}/duration`, path: `/tracks/${index}/duration` },
                { op: 'move', from: `/tracks/${index}/lyrics`, path: `/tracks/${index}/lyrics` },
                { op: 'move', from: `/tracks/${index}/credits`, path: `/tracks/${index}/credits` },
                { op: 'move', from: `/tracks/${index}/bpm`, path: `/tracks/${index}/bpm` }
            );
        });
        return this.#patches;
    };

    /**
     * 
     * @param {String} albumId
     * @returns {Promise<Object>} 
     */
    async getAlbum(albumId) {
        return Promise.resolve(albums.camelCase[albumId]);
    }
}

/**
 * 
 */
export class AlbumServicePacalCaseStrategy {
    name = 'PascalCase';
    #patches = [
        { op: 'move', from: '/AlbumId', path: '/album_id' },
        { op: 'move', from: '/AlbumTitle', path: '/album_title' },
        { op: 'move', from: '/ReleaseDate', path: '/release_date' },
        { op: 'move', from: '/Genre', path: '/genre' },
        { op: 'move', from: '/Tracks', path: '/tracks' },
        { op: 'move', from: '/Artist', path: '/artist' },
    ];

   /**
     * Create a unique patch spec for a specified album
     * @param {Array} tracks
     */
    generateAlbumPatchSpec(album) {
        album.Tracks.forEach((_, index) => {
            this.#patches.push(
                { op: 'move', from: `/tracks/${index}/TrackId`, path: `/tracks/${index}/track_id` },
                { op: 'move', from: `/tracks/${index}/TrackTitle`, path: `/tracks/${index}/track_title` },
                { op: 'move', from: `/tracks/${index}/Duration`, path: `/tracks/${index}/duration` },
                { op: 'move', from: `/tracks/${index}/Lyrics`, path: `/tracks/${index}/lyrics` },
                { op: 'move', from: `/tracks/${index}/Credits`, path: `/tracks/${index}/credits` },
                { op: 'move', from: `/tracks/${index}/Bpm`, path: `/tracks/${index}/bpm` }
            );
        });
        return this.#patches;
    };

    /**
     * 
     * @param {String} albumId
     * @returns {Promise<Object>} 
     */
    async getAlbum(albumId) {
        return Promise.resolve(albums.pascalCase[albumId]);
    }
  }