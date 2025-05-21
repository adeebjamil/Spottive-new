import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';

type Params = {
  params: {
    id: string;
  };
};

// Add a subcategory to a category
export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Subcategory name is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find the category
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Create slug for the subcategory
    const slug = body.name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Check if subcategory already exists
    const existingSubcategory = category.subcategories.find(sub => sub.slug === slug);
    
    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'A subcategory with this name already exists in this category' },
        { status: 400 }
      );
    }
    
    // Add new subcategory
    category.subcategories.push({
      name: body.name,
      slug
    });
    
    await category.save();
    
    return NextResponse.json(category.subcategories[category.subcategories.length - 1], { status: 201 });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to add subcategory' },
      { status: 500 }
    );
  }
}