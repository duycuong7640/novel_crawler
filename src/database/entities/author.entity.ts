import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const TABLE_AUTHOR = 'authors';
@Entity(TABLE_AUTHOR)
export class Author {
  @PrimaryColumn({ type: 'int' })
  id: string;

  @Column()
  uuid: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  content: string;

  @Column()
  rank: number;

  @Column()
  type: string;

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
