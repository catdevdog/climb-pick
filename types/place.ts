export type TypePlace = {
    address: string;
    lastUpdated: string;
    location: {
        lat: number;
        lng: number;
    };
    name: string;
    rating: number;
    types: string[];
    user_ratings_total: number;
};