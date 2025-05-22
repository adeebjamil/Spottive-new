import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongoose';
import mongoose from 'mongoose';

// GET a specific category
export async function GET(request: Request, { params }: { params: { pageId: string, categoryId: string } }) {
  try {
    await dbConnect();
    
    const { pageId, categoryId } = params;
    const PageCategory = mongoose.models.PageCategory || mongoose.model('PageCategory');
    
    const category = await PageCategory.findOne({ _id: categoryId, pageId });
    
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

// DELETE a category
export async function DELETE(request: Request, { params }: { params: { pageId: string, categoryId: string } }) {
  try {
    await dbConnect();
    
    const { pageId, categoryId } = params;
    
    const PageCategory = mongoose.models.PageCategory || mongoose.model('PageCategory');
    const PageSubcategory = mongoose.models.PageSubcategory || mongoose.model('PageSubcategory');
    
    // Delete the category
    const result = await PageCategory.findOneAndDelete({ _id: categoryId, pageId });
    
    if (!result) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Also delete all subcategories associated with this category
    await PageSubcategory.deleteMany({ parentCategoryId: categoryId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}