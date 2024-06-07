import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const TABLE_PRODUCT_CHAPTER = 'product_chapters';
@Entity(TABLE_PRODUCT_CHAPTER)
export class ProductChapter {
  @PrimaryColumn({ type: 'int' })
  id: string;

  @Column()
  uuid: string;

  @Column({ type: 'int' })
  product_id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  content: string;

  @Column()
  url_mtlnovel_com: string;

  @Column()
  rank: number;

  @Column()
  view: number;

  @Column()
  is_crawler_chapter: boolean;

  @Column()
  status: number;

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
