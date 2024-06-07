import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const TABLE_PRODUCT = 'products';
@Entity(TABLE_PRODUCT)
export class Product {
  @PrimaryColumn({ type: 'int' })
  id: string;

  @Column()
  uuid: string;

  @Column({ type: 'int' })
  author_id: string;

  @Column({ type: 'int' })
  category_id: string;

  @Column()
  title: string;

  @Column()
  title_short: string;

  @Column()
  title_alternate: string;

  @Column()
  slug: string;

  @Column()
  category_multi: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @Column()
  thumbnail: string;

  @Column()
  tags: string;

  @Column()
  thumbnail_root: string;

  @Column()
  url_mtlnovel_com: string;

  @Column()
  rank: number;

  @Column()
  total_chap: number;

  @Column()
  view: number;

  @Column()
  rate: string;

  @Column()
  is_crawler_chapter: boolean;

  @Column()
  status: number;

  @Column()
  type: string;

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
