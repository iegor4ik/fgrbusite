-- Keep document categories limited to the public federation/ministry sections.

UPDATE documents
SET category = CASE
  WHEN lower(category) IN ('міністерство', 'министерство') THEN 'міністерство'
  WHEN lower(category) IN ('інше', 'інше') THEN 'інше'
  ELSE 'федерація'
END,
updated_at = now();

ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_category_check;

ALTER TABLE documents
  ADD CONSTRAINT documents_category_check
  CHECK (category IN ('федерація', 'міністерство', 'інше'));