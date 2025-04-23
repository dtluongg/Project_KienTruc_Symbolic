export class CategoryModel {
  constructor(data) {
    this.category_id = data.category_id;
    this.category_name = data.category_name;
    this.slug = data.slug;
    this.description = data.description;
    this.image_url = data.image_url;
    this.created_at = data.created_at;
  }

  toJSON() {
    return {
      category_id: this.category_id,
      category_name: this.category_name,
      slug: this.slug,
      description: this.description,
      image_url: this.image_url,
      created_at: this.created_at
    };
  }
} 