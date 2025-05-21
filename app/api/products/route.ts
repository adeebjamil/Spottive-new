import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';
import mongoose from 'mongoose';

// Define an interface for MongoDB validation errors
interface MongooseValidationError extends Error {
  name: string;
  errors: {
    [key: string]: {
      message: string;
    }
  };
}

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Log incoming request for debugging
    console.log('Creating new product...');
    
    // Parse the request body
    const body = await request.json();
    console.log('Product data:', body);
    
    // Connect to database
    await dbConnect();
    
    // Validate required fields
    if (!body.name) {
      console.log('Validation failed: Missing name');
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }
    
    if (!body.category) {
      console.log('Validation failed: Missing category');
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }
    
    if (!body.websiteCategory) {
      console.log('Validation failed: Missing websiteCategory');
      return NextResponse.json(
        { error: 'Website Category is required' },
        { status: 400 }
      );
    }
    
    // Create the product
    console.log('Creating product in database...');
    const product = await Product.create(body);
    console.log('Product created successfully:', product);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle Mongoose validation errors with more details
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: `Validation error: ${messages.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors (e.g., unique constraint violations)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A product with this name already exists' },
        { status: 400 }
      );
    }
    
    // For any other error
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}