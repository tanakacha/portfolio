export interface PublicProfile {
  displayName: string;
  tagline: string;
  hobbies: string[];
  profileImage?: string;
}

export interface PrivateProfile {
  fullName: string;
  university: string;
  major: string;
  hobbies: string[];
  profileImage: string;
}
