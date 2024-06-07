import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const TABLE_CATEGORY = 'categories';
@Entity(TABLE_CATEGORY)
export class Category {
  @PrimaryColumn({ type: 'int' })
  id: string;

  @Column()
  uuid: string;

  @Column({ type: 'int' })
  parent_id: string;

  @Column({ type: 'int' })
  user_id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  thumbnail: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @Column()
  redirect_url: string;

  @Column()
  rank: number;

  @Column()
  type: string;

  @Column()
  status: number;

  @Column()
  choose_1: number;

  @Column()
  choose_2: number;

  @Column()
  choose_3: number;

  @Column()
  choose_4: number;

  @Column()
  choose_5: number;

  @Column()
  title_seo: string;

  @Column()
  meta_des: string;

  @Column()
  meta_key: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
