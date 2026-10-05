export type BrochureSection = {
  id: string;
  title: string;
  content: string;
};

export type BrochureDraft = {
  id: string;
  name: string;
  dob: string;
  dod: string;
  bio: string;
  sections: BrochureSection[];
  privacy: "public" | "family";
  accessCode?: string;
  updatedAt: string;
  creatorId?: string;
};
