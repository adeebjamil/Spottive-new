import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongoose';
import mongoose from 'mongoose';

// Define the PageProducts schema
const PageProductsSchema = new mongoose.Schema({
  pageId: { type: String, required: true, unique: true },
  productIds: [{ type: String }]
});

const PageProducts = mongoose.models.PageProducts || mongoose.model('PageProducts', PageProductsSchema);

// GET all products for a specific page
export async function GET(request: Request, { params }: { params: { pageId: string } }) {
  try {
    await dbConnect();
    
    const { pageId } = params;
    
    // Find the page products entry
    const pageProducts = await PageProducts.findOne({ pageId });
    
    if (!pageProducts || !pageProducts.productIds || pageProducts.productIds.length === 0) {
      // Return empty array if no products are assigned to this page
      return NextResponse.json([]);
    }
    
    // Get the actual products
    const Product = mongoose.models.Product;
    if (!Product) {
      return NextResponse.json([]);
    }
    
    const products = await Product.find({ _id: { $in: pageProducts.productIds } });

    // Transform products to ensure image URLs are properly handled
    const transformedProducts = products.map(product => {
      const data = product.toObject ? product.toObject() : product;
      
      // Ensure imageUrl exists even if it's stored in images array
      if (!data.imageUrl && data.images && data.images.length > 0) {
        data.imageUrl = data.images[0];
      }
      
      return data;
    });

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching page products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page products' },
      { status: 500 }
    );
  }
}

// POST to update products for a page
export async function POST(request: Request, { params }: { params: { pageId: string } }) {
  try {
    await dbConnect();
    
    const { pageId } = params;
    const { products } = await request.json();
    
    // Upsert the page products
    const pageProducts = await PageProducts.findOneAndUpdate(
      { pageId },
      { pageId, productIds: products },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(pageProducts);
  } catch (error) {
    console.error('Error updating page products:', error);
    return NextResponse.json(
      { error: 'Failed to update page products' },
      { status: 500 }
    );
  }
}