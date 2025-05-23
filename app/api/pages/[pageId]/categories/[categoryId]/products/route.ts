import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../../lib/mongoose';
import PageCategory from '../../../../../../../models/PageCategory';

interface Params {
  params: {
    pageId: string;
    categoryId: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { products } = body;
    
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products must be an array' },
        { status: 400 }
      );
    }
    
    // Find the category
    const category = await PageCategory.findOne({
      _id: params.categoryId,
      pageId: params.pageId
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Assign products to category
    category.products = products;
    await category.save();
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error assigning products to category:', error);
    return NextResponse.json(
      { error: 'Failed to assign products to category' },
      { status: 500 }
    );
  }
}