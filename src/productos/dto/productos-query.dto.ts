export class LikesDislikesDto {
  likes: number;
  dislikes: number;
}

export class RatingDto {
  rating: number;
}

export class FiltrarProductosDto {
  categoria?: string;
  plataforma?: string;
  min?: number;
  max?: number;
  sortBy?: string;
  sortOrder?: boolean;
}
