-- change taskid to be new patavi URIs
UPDATE model SET taskid = NULL ;
ALTER TABLE model ALTER COLUMN taskid TYPE VARCHAR(128) ;
ALTER TABLE model RENAME COLUMN taskid TO taskUrl ;
