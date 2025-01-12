export interface Story {
  Headline: string;
  "Link to image": string;
  "Body Text": string;
  photoGallery: string;
  Date: Date;
  "Location - Street": string;
  "Location - Town": string;
  Latitude: string; // Add Latitude
  Longitude: string; // Add Longitude
  Department: string;
  headlineUrl: string;
  id?: string;
  "Display Photo"?: string;
  "Photo Key"?: string; // Key in S3
  photoUrl?: string | null;    // URL fetched from S3
}

export interface Incident {
  "Fire Date": string;
  Address: string;
  Town: string;
  Department: string;
  Latitude: string; // Add Latitude
  Longitude: string; // Add Longitude
  Battalion?: string;
}
