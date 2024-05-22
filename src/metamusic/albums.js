export const albums = {
    n97PvnilLJ: {
      AlbumId: 'n97PvnilLJ',
      AlbumTitle: 'The Best of 2022',
      Artist: 'Various Artists',
      ReleaseDate: '2022-04-20',
      Genre: ['Pop', 'Rock'],
      Tracks: [
        {
          TrackId: 'urn:metamusic:album:n97PvnilLJ:track:001',
          TrackTitle: 'Summer Vibes',
          Duration: '3:30',
          Lyrics: 'Sunshine, beaches, and good times',
          Credits: ['John Smith', 'Emma Johnson'],
          Bpm: 120,
        },
        {
          TrackId: 'urn:metamusic:album:n97PvnilLJ:track:002',
          TrackTitle: 'City Lights',
          Duration: '4:10',
          Lyrics: 'Neon signs and bustling streets',
          Credits: ['Sarah Brown', 'Michael Lee'],
          Bpm: 140,
        },
        {
          TrackId: 'urn:metamusic:album:n97PvnilLJ:track:003',
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
 * 
 */
export class AlbumService {
  #strategy;
  
  constructor() {

  }

  /**
   * 
   * @param {Object} myStrategy 
   */
  setStrategy(myStrategy) {
    if (!myStrategy) {
      console.error('INTERNAL_ERROR: Could not set strategy');
    }
    this.#strategy = myStrategy;
  }

  /**
   * 
   * @param {String} albumId
   * @returns {Promise<Object>} 
   */
  async getAlbum(albumId) {
    return this.#strategy.getAlbum(albumId);
  }

  /**
   * 
   * @param {Object} album 
   * @returns {Object}
   */
  generateAlbumPatchSpec(album) {
    return this.#strategy.generateAlbumPatchSpec(album);
  }
}