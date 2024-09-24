export type GetPostByIdDTO = {
  postId: number;
  accessToken: string | undefined;
};

export type GetMyPostsDTO = {
  userId: number;
  page: number;
};

export type DeletePostDTO = { userId: number; userPostId: number };

export type UpdatePostDTO = {
  userId: number;
  userPostId: number;
  description: string;
};

export type CreatePostDTO = {
  userId: number;
  images: Array<Express.Multer.File & { buffer: any }>;
  description?: string;
};
