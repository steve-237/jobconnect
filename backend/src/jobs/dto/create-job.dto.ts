export class CreateJobDto {
  title!: string;
  description!: string;
  price!: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  categoryId!: string;
}
