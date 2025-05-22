import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongoose';
import mongoose from 'mongoose';

// Define the PageCategory schema
const PageCategorySchema = new mongoose.Schema({
  pageId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String },
  products: [{ type: String }]
}, { timestamps: true });

// Create a slug before saving
PageCategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
  next();
});

const PageCategory = mongoose.models.PageCategory || mongoose.model('PageCategory', PageCategorySchema);

// GET all categories for a specific page
export async function GET(request: Request, { params }: { params: { pageId: string } }) {
  try {
    await dbConnect();
    
    const { pageId } = params;
    
    const categories = await PageCategory.find({ pageId });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching page categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page categories' },
      { status: 500 }
    );
  }
}

// POST to create a new category for a page
export async function POST(request: Request, { params }: { params: { pageId: string } }) {
  try {
    await dbConnect();
    
    const { pageId } = params;
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create the category
    const category = await PageCategory.create({
      pageId,
      name,
      products: []
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating page category:', error);
    return NextResponse.json(
      { error: 'Failed to create page category' },
      { status: 500 }
    );
  }
}