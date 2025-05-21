import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import mongoose from 'mongoose';

// Reference the BrandPage model
const BrandPage = mongoose.models.BrandPage;

type Params = {
  params: {
    id: string;
  };
};

// Delete a brand page
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    await dbConnect();
    
    if (!BrandPage) {
      return NextResponse.json(
        { error: 'BrandPage model not defined' },
        { status: 500 }
      );
    }
    
    const result = await BrandPage.findByIdAndDelete(params.id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Brand page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Brand page deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand page:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand page' },
      { status: 500 }
    );
  }
}