import { supabase } from '../../infrastructure/config/supabase';

export default class ProductImageService {
    async uploadProductImage(file) {
        try {
            if (!file) {
                throw new Error('No file provided');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL of the file
            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return {
                success: true,
                url: data.publicUrl,
                path: filePath
            };
        } catch (error) {
            console.error('Error uploading product image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async uploadMultipleProductImages(files) {
        try {
            const uploadPromises = Array.from(files).map(file => this.uploadProductImage(file));
            const results = await Promise.all(uploadPromises);
            
            const successfulUploads = results.filter(result => result.success);
            const failedUploads = results.filter(result => !result.success);

            return {
                success: failedUploads.length === 0,
                urls: successfulUploads.map(upload => upload.url),
                failedUploads: failedUploads,
                totalUploaded: successfulUploads.length,
                totalFailed: failedUploads.length
            };
        } catch (error) {
            console.error('Error uploading multiple product images:', error);
            return {
                success: false,
                error: error.message,
                urls: [],
                failedUploads: [],
                totalUploaded: 0,
                totalFailed: files.length
            };
        }
    }
} 