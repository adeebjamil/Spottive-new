import mongoose, { Schema, Model, model, models } from 'mongoose';

export interface ISubCategory {
  _id?: string;
  name: string;
  slug: string;
}

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;    
  description?: string;
  subcategories: ISubCategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

const subCategorySchema = new Schema<ISubCategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  subcategories: [subCategorySchema]
}, { timestamps: true });

// Create slug from name
categorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  
  next();
});

const Category = mongoose.models.Category as Model<ICategory> || 
  mongoose.model<ICategory>('Category', categorySchema);

export default Category;