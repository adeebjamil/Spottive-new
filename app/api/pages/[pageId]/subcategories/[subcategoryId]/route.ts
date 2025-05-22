import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongoose';
import mongoose from 'mongoose';

// DELETE a subcategory
export async function DELETE(request: Request, { params }: { params: { pageId: string, subcategoryId: string } }) {
  try {
    await dbConnect();
    
    const { pageId, subcategoryId } = params;
    
    const PageSubcategory = mongoose.models.PageSubcategory || mongoose.model('PageSubcategory');
    
    // Delete the subcategory
    const result = await PageSubcategory.findOneAndDelete({ _id: subcategoryId, pageId });
    
    if (!result) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}