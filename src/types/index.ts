export interface Story {
  title: string;
  imageUrl: string;
  headlineUrl: string;
  description: string;
  photoGallery: string;
  date: Date;
}

export interface Incident {
  "Fire Date": string;
  Address: string;
  Town: string;
  Department: string;
}
