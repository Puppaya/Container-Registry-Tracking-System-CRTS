IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'tb_container_event_externalReferenceNo_key'
    AND object_id = OBJECT_ID('tb_container_event')
)
BEGIN
  CREATE UNIQUE NONCLUSTERED INDEX tb_container_event_externalReferenceNo_key
    ON tb_container_event (externalReferenceNo)
    WHERE externalReferenceNo IS NOT NULL;
END
