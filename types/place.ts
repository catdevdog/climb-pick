export type TypePlace = {
  place_id: string;
  address: string;
  lastUpdated: string;
  lat_lng: string;
  location: {
    lat: number;
    lng: number;
  };
  name: string;
  rating: number;
  types: string[];
  user_ratings_total: number;
};
