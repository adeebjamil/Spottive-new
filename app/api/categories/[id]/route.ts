import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';

type Params = {
  params: {
    id: string;
  };
};

// Get a specific category
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    await dbConnect();
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// Update a category
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const body = await request.json();
    await dbConnect();
    
    // Make sure the category exists
    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (body.name) {
      category.name = body.name;
      // Update slug if name changes
      category.slug = body.name
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
    }
    
    if (body.description !== undefined) {
      category.description = body.description;
    }
    
    await category.save();
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// Delete a category
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    await dbConnect();
    
    const result = await Category.findByIdAndDelete(params.id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}