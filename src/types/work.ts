export interface Work {
  id: string;
  title: string;
  description: string[];
  image: string;
  images: string[];
  url?: string;
  technologies: string[];
  links?: {
    demo?: string;
    github?: string;
    appStore?: string;
    googlePlay?: string;
  };
  achievements?: string[];
}