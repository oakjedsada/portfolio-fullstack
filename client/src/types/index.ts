export interface Project {
  id: number;
  name: string;
  description: string;
  techStack: string[];
  status: "Live" | "Done" | "R&D" | "Creative";
  icon: string;
  sortOrder: number;
}

export interface Skill {
  id: number;
  name: string;
  proficiency: number; // 0-100
  category: string;
  sortOrder: number;
}

export type WindowId =
  | "about"
  | "projects"
  | "skills"
  | "terminal"
  | "resume"
  | "contact"
  | "cv"
  | "farm";

export interface WindowState {
  id: WindowId;
  title: string;
  icon: string;
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
  width: number;
  zIndex: number;
}
