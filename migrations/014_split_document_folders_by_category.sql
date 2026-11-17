ALTER TABLE document_folders
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'федерація';

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES document_folders(id) ON DELETE SET NULL;

UPDATE documents
SET folder_id = NULL
WHERE category = 'інше'
  AND folder_id IS NOT NULL;

UPDATE document_folders f
SET category = 'міністерство',
    updated_at = now()
WHERE f.category = 'федерація'
  AND EXISTS (
    SELECT 1
    FROM documents d
    WHERE d.folder_id = f.id
      AND d.category = 'міністерство'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM documents d
    WHERE d.folder_id = f.id
      AND d.category = 'федерація'
  );

DO $$
DECLARE
  legacy_folder RECORD;
  ministry_folder_id INTEGER;
BEGIN
  FOR legacy_folder IN
    SELECT f.id, f.title
    FROM document_folders f
    WHERE f.category = 'федерація'
      AND EXISTS (
        SELECT 1
        FROM documents d
        WHERE d.folder_id = f.id
          AND d.category = 'міністерство'
      )
      AND EXISTS (
        SELECT 1
        FROM documents d
        WHERE d.folder_id = f.id
          AND d.category = 'федерація'
      )
  LOOP
    INSERT INTO document_folders (title, category)
    VALUES (legacy_folder.title, 'міністерство')
    RETURNING id INTO ministry_folder_id;

    UPDATE documents
    SET folder_id = ministry_folder_id
    WHERE folder_id = legacy_folder.id
      AND category = 'міністерство';
  END LOOP;
END $$;
