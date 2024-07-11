
export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  image: string;
  ownerId: string;
  quantity: number;
}


export interface Post {
  title: string;
  content: string;
  image?: string;
}

export interface Owner {
  profileImage?: string;
  name: string;
  description: string;
  blog: Post[];
  rewards: Reward[];
}

export interface BlogPost {
  title: string;
  content: string;
  image: string;
}

export interface Claim {
  id: string;
  rewardId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  confirmedBy?: string;
}