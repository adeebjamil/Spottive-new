import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../../lib/mongoose';
import PageSubcategory from '../../../../../../../models/PageSubcategory';

interface Params {
  params: {
    pageId: string;
    subcategoryId: string;
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
    
    // Find the subcategory with both subcategoryId and pageId
    const subcategory = await PageSubcategory.findOne({
      _id: params.subcategoryId,
      pageId: params.pageId
    });
    
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }
    
    // Assign products to subcategory
    subcategory.products = products;
    await subcategory.save();
    
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Error assigning products to subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to assign products to subcategory' },
      { status: 500 }
    );
  }
}