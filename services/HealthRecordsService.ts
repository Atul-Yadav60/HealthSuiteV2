import { supabase } from '../lib/supabase';
import * as DocumentPicker from 'expo-document-picker';

export interface HealthRecord {
  id: string;
  user_id: string;
  file_name: string;
  display_name: string;
  file_type: string;
  file_size?: number;
  mime_type?: string;
  file_path: string;
  storage_bucket: string;
  category: 'lab' | 'prescription' | 'imaging' | 'doctor_notes' | 'insurance' | 'general';
  description?: string;
  record_date?: string;
  provider_name?: string;
  provider_type?: 'doctor' | 'hospital' | 'lab' | 'pharmacy';
  is_active: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthRecordData {
  display_name: string;
  category?: HealthRecord['category'];
  description?: string;
  record_date?: string;
  provider_name?: string;
  provider_type?: HealthRecord['provider_type'];
}

export interface UpdateHealthRecordData extends Partial<CreateHealthRecordData> {
  is_favorite?: boolean;
}

export interface HealthRecordStats {
  total: number;
  byCategory: Record<string, number>;
  recentUploads: number;
  totalSize: number;
}

export class HealthRecordsService {
  private static readonly BUCKET_NAME = 'health-records';

  /**
   * Get all health records for a user
   */
  static async getUserHealthRecords(
    userId: string,
    options: {
      category?: string;
      limit?: number;
      offset?: number;
      includeInactive?: boolean;
    } = {}
  ): Promise<HealthRecord[]> {
    try {
      let query = supabase
        .from('health_records')
        .select('*')
        .eq('user_id', userId);

      if (!options.includeInactive) {
        query = query.eq('is_active', true);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching health records:', error);
        throw new Error(`Failed to fetch health records: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserHealthRecords:', error);
      throw error;
    }
  }

  /**
   * Get recent health records (last 7 days)
   */
  static async getRecentHealthRecords(userId: string, limit: number = 5): Promise<HealthRecord[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent health records:', error);
        throw new Error(`Failed to fetch recent health records: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentHealthRecords:', error);
      throw error;
    }
  }

  /**
   * Get health record statistics
   */
  static async getHealthRecordStats(userId: string): Promise<HealthRecordStats> {
    try {
      const records = await this.getUserHealthRecords(userId);
      
      const stats: HealthRecordStats = {
        total: records.length,
        byCategory: {},
        recentUploads: 0,
        totalSize: 0
      };

      // Calculate recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      records.forEach(record => {
        // Count by category
        stats.byCategory[record.category] = (stats.byCategory[record.category] || 0) + 1;
        
        // Count recent uploads
        if (new Date(record.created_at) >= sevenDaysAgo) {
          stats.recentUploads++;
        }
        
        // Sum total file size
        if (record.file_size) {
          stats.totalSize += record.file_size;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getHealthRecordStats:', error);
      throw error;
    }
  }

  /**
   * Upload a document and create health record
   */
  static async uploadDocument(
    userId: string,
    recordData: CreateHealthRecordData
  ): Promise<HealthRecord> {
    try {
      // Pick document using the correct Expo DocumentPicker API for SDK 51
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      // Handle the result format for SDK 51
      if (result.type === 'cancel') {
        throw new Error('No document selected');
      }

      // For SDK 51, the result structure is different
      const asset = result as any;
      if (!asset.uri) {
        throw new Error('No document selected');
      }
      
      // Validate file size (max 50MB)
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
      if (asset.size && asset.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 50MB limit');
      }

      // Generate unique file path
      const fileExtension = asset.name?.split('.').pop() || 'unknown';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;

      // Create file object for upload - SDK 51 format
      const fileUri = asset.uri;
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      // Upload to Supabase storage using blob
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, blob, {
          contentType: asset.mimeType || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Create database record
      const { data, error } = await supabase
        .from('health_records')
        .insert({
          user_id: userId,
          file_name: asset.name || fileName,
          display_name: recordData.display_name || asset.name || fileName,
          file_type: fileExtension.toLowerCase(),
          file_size: asset.size,
          mime_type: asset.mimeType,
          file_path: filePath,
          storage_bucket: this.BUCKET_NAME,
          category: recordData.category || 'general',
          description: recordData.description,
          record_date: recordData.record_date,
          provider_name: recordData.provider_name,
          provider_type: recordData.provider_type,
        })
        .select()
        .single();

      if (error) {
        // If database insert fails, clean up uploaded file
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        console.error('Error creating health record:', error);
        throw new Error(`Failed to create health record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  }

  /**
   * Get download URL for a health record file
   */
  static async getFileUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        throw new Error(`Failed to get file URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error in getFileUrl:', error);
      throw error;
    }
  }

  /**
   * Update health record metadata
   */
  static async updateHealthRecord(
    recordId: string,
    updateData: UpdateHealthRecordData
  ): Promise<HealthRecord> {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .update(updateData)
        .eq('id', recordId)
        .select()
        .single();

      if (error) {
        console.error('Error updating health record:', error);
        throw new Error(`Failed to update health record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateHealthRecord:', error);
      throw error;
    }
  }

  /**
   * Delete health record (soft delete)
   */
  static async deleteHealthRecord(recordId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('health_records')
        .update({ is_active: false })
        .eq('id', recordId);

      if (error) {
        console.error('Error deleting health record:', error);
        throw new Error(`Failed to delete health record: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteHealthRecord:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(recordId: string): Promise<HealthRecord> {
    try {
      // First get current favorite status
      const { data: currentRecord, error: fetchError } = await supabase
        .from('health_records')
        .select('is_favorite')
        .eq('id', recordId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch record: ${fetchError.message}`);
      }

      // Toggle the favorite status
      const { data, error } = await supabase
        .from('health_records')
        .update({ is_favorite: !currentRecord.is_favorite })
        .eq('id', recordId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling favorite:', error);
        throw new Error(`Failed to toggle favorite: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      throw error;
    }
  }

  /**
   * Get health record by ID
   */
  static async getHealthRecordById(recordId: string, userId: string): Promise<HealthRecord | null> {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('id', recordId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error fetching health record:', error);
        throw new Error(`Failed to fetch health record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getHealthRecordById:', error);
      throw error;
    }
  }
}