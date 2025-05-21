import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

// Define BrandPage schema directly here since it's simple
const BrandPageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

// Create slug from name before saving
BrandPageSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  next();
});

// Get or create the model
const BrandPage = mongoose.models.BrandPage || 
  mongoose.model('BrandPage', BrandPageSchema);

// GET all brand pages
export async function GET() {
  try {
    await dbConnect();
    const brandPages = await BrandPage.find({}).sort({ name: 1 });
    
    // Format the response
    const formattedPages = brandPages.map(page => ({
      id: page._id.toString(),
      name: page.name,
      slug: page.slug
    }));
    
    return NextResponse.json(formattedPages);
  } catch (error) {
    console.error('Error fetching brand pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand pages' },
      { status: 500 }
    );
  }
}

// Create a new brand page
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Brand page name is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Create the slug from the name
    const slug = body.name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Check for existing brand page with same slug
    const existingPage = await BrandPage.findOne({ slug });
    if (existingPage) {
      return NextResponse.json(
        { error: 'A brand page with this name already exists' },
        { status: 400 }
      );
    }
    
    // Create new brand page
    const brandPage = await BrandPage.create({
      name: body.name,
      slug
    });
    
    return NextResponse.json({
      id: brandPage._id.toString(),
      name: brandPage.name,
      slug: brandPage.slug
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating brand page:', error);
    return NextResponse.json(
      { error: 'Failed to create brand page' },
      { status: 500 }
    );
  }
}