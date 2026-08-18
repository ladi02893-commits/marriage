import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypass RLS for generic uploads
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'uploads';
    const folder = (formData.get('folder') as string) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // If the bucket doesn't exist, we can try to create it on the fly!
      if (error.message.includes('bucket not found') || error.message.includes('Bucket not found')) {
        await supabase.storage.createBucket(bucket, { public: true });
        
        // Retry upload
        const retry = await supabase.storage
          .from(bucket)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });
          
        if (retry.error) throw new Error(retry.error.message);
      } else {
        throw new Error(error.message);
      }
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data?.path || fileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data?.path || fileName
    });

  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
