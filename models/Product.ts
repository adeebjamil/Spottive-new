// filepath: c:\Users\USER\Desktop\spottive\spottive\models\Product.ts
import mongoose, { Schema, Model, model, models } from 'mongoose';
import clientPromise from '@/lib/mongodb';
import { getIo } from '@/lib/mongodb';

export interface IProduct {
  id?: string;
  _id?: string;
  name: string;
  category: string;
  websiteCategory: string;
  subcategoryId?: string;  // NEW: Reference to subcategory
  status: 'Active' | 'Featured' | 'New' | 'Discontinued';
  description?: string;
  imageUrl?: string;
  cloudinaryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define static methods for the Product model
interface ProductModel extends Model<IProduct> {
  setupChangeStream(): Promise<void>;
}

const productSchema = new Schema<IProduct, ProductModel>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  websiteCategory: { type: String, required: true },
  subcategoryId: { type: String }, // NEW: Reference to subcategory
  status: { 
    type: String, 
    enum: ['Active', 'Featured', 'New', 'Discontinued'], 
    default: 'Active' 
  },
  description: { type: String },
  imageUrl: { type: String },
  cloudinaryId: { type: String },
}, { timestamps: true });

// Add toJSON transform to handle _id and id
productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    return returnedObject;
  }
});

// Add static method properly
productSchema.statics.setupChangeStream = async function() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('products');
    
    // Watch for changes
    const changeStream = collection.watch([], { fullDocument: 'updateLookup' });
    
    changeStream.on('change', async (change) => {
      const io = getIo();
      if (!io) return;
      
      // Emit different events based on operation type
      switch(change.operationType) {
        case 'insert':
          io.emit('product:created', change.fullDocument);
          break;
        case 'update':
          io.emit('product:updated', change.fullDocument);
          break;
        case 'delete':
          io.emit('product:deleted', change.documentKey._id);
          break;
      }
      
      // Also emit a general update for any change
      const products = await collection.find({}).sort({ createdAt: -1 }).toArray();
      io.emit('products:updated', products);
    });
    
    console.log('Product change stream established');
  } catch (error) {
    console.error('Error setting up change stream:', error);
  }
};

// Initialize change stream when the model is first created
const Product = (models.Product || model<IProduct, ProductModel>('Product', productSchema)) as unknown as ProductModel;

// Set up change stream immediately if we have a db connection
if (mongoose.connection.readyState === 1) {
  Product.setupChangeStream();
}

export default Product;