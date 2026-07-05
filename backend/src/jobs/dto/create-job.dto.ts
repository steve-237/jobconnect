export class CreateJobDto {
  title!: string;
  description!: string;
  price!: number;
  location?: string;
  categoryId!: string;
}
