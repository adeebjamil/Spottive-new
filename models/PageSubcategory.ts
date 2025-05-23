import mongoose, { Schema } from 'mongoose';

export interface IPageSubcategory {
  _id?: string;
  name: string;
  slug: string;
  parentCategoryId: string;
  pageId: string;
  products: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const pageSubcategorySchema = new Schema<IPageSubcategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  parentCategoryId: { type: String, required: true },
  pageId: { type: String, required: true },
  products: [{ type: String }]
}, { timestamps: true });

// Create slug from name
pageSubcategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  
  next();
});

// Check if model exists before creating
const PageSubcategory = mongoose.models.PageSubcategory || mongoose.model<IPageSubcategory>('PageSubcategory', pageSubcategorySchema);

export default PageSubcategory;