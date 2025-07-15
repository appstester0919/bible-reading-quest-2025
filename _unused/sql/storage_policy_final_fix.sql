(bucket_id = 'avatars'::text) AND (auth.uid() = ((storage.foldername(name))[1])::uuid)
