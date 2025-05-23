import mongoose, { Schema } from 'mongoose';

export interface IPageCategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  pageId: string;
  products: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const pageCategorySchema = new Schema<IPageCategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  pageId: { type: String, required: true },
  products: [{ type: String }]
}, { timestamps: true });

// Create slug from name
pageCategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  
  next();
});

// Check if model exists before creating
const PageCategory = mongoose.models.PageCategory || mongoose.model<IPageCategory>('PageCategory', pageCategorySchema);

export default PageCategory;