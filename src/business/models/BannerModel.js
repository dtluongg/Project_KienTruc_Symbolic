export class BannerModel {
  constructor(data) {
    this.banner_id = data.banner_id;
    this.image_url = data.image_url;
    this.title = data.title;
    this.description = data.description;
    this.is_active = data.is_active ?? true;
    this.display_order = data.display_order;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  toJSON() {
    return {
      banner_id: this.banner_id,
      image_url: this.image_url,
      title: this.title,
      description: this.description,
      is_active: this.is_active,
      display_order: this.display_order,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
} 