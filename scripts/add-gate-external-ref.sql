IF COL_LENGTH('tb_container_event', 'externalReferenceNo') IS NULL
BEGIN
  ALTER TABLE tb_container_event ADD externalReferenceNo NVARCHAR(1000) NULL;
END
