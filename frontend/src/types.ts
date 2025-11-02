export type Photo = {
  id: number;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  note: string | null;
  created_at: string;
  url: string;
};
