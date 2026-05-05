export interface Work {
  id: string;
  title: string;
  description: string[];
  images: string[];
  technologies: string[];
  links?: {
    demo?: string;
    github?: string;
    appStore?: string;
    googlePlay?: string;
  };
}