import { supabase } from '../lib/supabaseClient';

const orderByCreatedAt = { ascending: false };

const safeData = (result) => {
  if (result.error) {
    throw result.error;
  }
  return result.data;
};

export const getCurrentUserId = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('No authenticated user.');
  }

  return user.id;
};

export const fetchTableRows = async (tableName, filters = {}) => {
  const userId = await getCurrentUserId();
  let query = supabase.from(tableName).select('*').eq('user_id', userId);

  if (filters.orderBy) {
    query = query.order(filters.orderBy, filters.orderConfig || orderByCreatedAt);
  } else {
    query = query.order('created_at', orderByCreatedAt);
  }

  if (typeof filters.limit === 'number') {
    query = query.limit(filters.limit);
  }

  if (filters.equals) {
    Object.entries(filters.equals).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  return safeData(await query);
};

export const insertRow = async (tableName, payload) => {
  const userId = await getCurrentUserId();
  return safeData(await supabase.from(tableName).insert({ ...payload, user_id: userId }).select().single());
};

export const upsertRow = async (tableName, payload, conflictKey) => {
  const userId = await getCurrentUserId();
  return safeData(
    await supabase
      .from(tableName)
      .upsert({ ...payload, user_id: userId }, { onConflict: conflictKey })
      .select()
      .single()
  );
};

export const updateRow = async (tableName, rowId, payload) => {
  const userId = await getCurrentUserId();
  return safeData(
    await supabase
      .from(tableName)
      .update(payload)
      .eq('id', rowId)
      .eq('user_id', userId)
      .select()
      .single()
  );
};

export const uploadShowCauseAttachment = async (file) => {
  const userId = await getCurrentUserId();
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('show-cause-attachments')
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw error;
  }

  return filePath;
};
