import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongoose';
import mongoose from 'mongoose';

// Define the PageSubcategory schema
const PageSubcategorySchema = new mongoose.Schema({
  pageId: { type: String, required: true },
  name: { type: String, required: true },
  parentCategoryId: { type: String, required: true },
  slug: { type: String }
}, { timestamps: true });

// Create a slug before saving
PageSubcategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
  next();
});

const PageSubcategory = mongoose.models.PageSubcategory || mongoose.model('PageSubcategory', PageSubcategorySchema);

// GET all subcategories for a specific page
export async function GET(request: Request, { params }: { params: { pageId: string } }) {
  try {
    await dbConnect();
    
    const { pageId } = params;
    
    const subcategories = await PageSubcategory.find({ pageId });
    
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Error fetching page subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page subcategories' },
      { status: 500 }
    );
  }
}

// POST to create a new subcategory for a page
export async function POST(request: Request, { params }: { params: { pageId: string } }) {
  try {
    await dbConnect();
    
    const { pageId } = params;
    const { name, parentCategoryId } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Subcategory name is required' },
        { status: 400 }
      );
    }
    
    if (!parentCategoryId) {
      return NextResponse.json(
        { error: 'Parent category is required' },
        { status: 400 }
      );
    }
    
    // Create the subcategory
    const subcategory = await PageSubcategory.create({
      pageId,
      name,
      parentCategoryId
    });
    
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Error creating page subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to create page subcategory' },
      { status: 500 }
    );
  }
}