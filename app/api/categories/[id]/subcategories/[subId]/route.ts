import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';

type Params = {
  params: {
    id: string;
    subId: string;
  };
};

// Delete a subcategory
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    await dbConnect();
    
    // Find the category
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Find the subcategory index
    const subcategoryIndex = category.subcategories.findIndex(
      sub => sub._id?.toString() === params.subId
    );
    
    if (subcategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }
    
    // Remove the subcategory
    category.subcategories.splice(subcategoryIndex, 1);
    await category.save();
    
    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}