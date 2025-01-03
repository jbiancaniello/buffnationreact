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
