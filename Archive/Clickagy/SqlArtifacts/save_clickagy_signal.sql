CREATE FUNCTION save_clickagy_signal(args json, payload text) RETURNS json
    LANGUAGE plpgsql
AS
$$
DECLARE
    row_guid UUID := public.uuid_generate_v4();
    error_state   TEXT;
    error_message TEXT;
    error_detail  TEXT;
    failed_query TEXT;


BEGIN

WITH record_rows AS 
(
        SELECT 
            row_guid as record_id
            ,CAST(json_extract_path_text(payload::json, 'record', 'page_url_md5') AS UUID) AS page_url_md5
            ,to_timestamp(json_extract_path_text(payload::json, 'record', 'last_seen'), 'YYY-MM-DD hh24::mi::ss') as last_seen
            ,json_extract_path_text(payload::json, 'record', 'list') as list
            ,now() ts
            ,CAST( md5 AS UUID) 
        FROM 
            (SELECT
                json_array_elements_text(
                    json_extract_path(payload::json
                        , 'record'
                        , 'eh_md5'))
            ) AS _(md5)
) 
        INSERT INTO
        raw.clickagy_signal (
                record_id
               ,page_url_md5
               ,last_seen
               ,list
               ,ts
               ,md5
        ) SELECT * FROM record_rows;
            
    /*
        FOR loop_index IN SELECT * FROM json_array_elements(payload#>'{record,eh_md5}')
        LOOP
                INSERT INTO
                raw.clickagy_signal (
                        record_id
                       ,page_url_md5
                       ,last_seen
                       ,list
                       ,md5
                       ,ts
                )
                VALUES (
                        
                        row_guid
                        ,CAST(payload#>>'{record,page_url_md5}' AS UUID)
                        ,to_timestamp(payload#>>'{record,last_seen}', 'YYY-MM-DD hh24::mi::ss')
                        ,payload#>>'{record,list}'
                        ,CAST(trim('"' FROM loop_index::text) AS UUID)
                        ,now()
                );
        END LOOP;
   */        
        
    
   RETURN '{"Result" : "Success"}'::json;

   EXCEPTION  WHEN OTHERS THEN
            -- insert into error log?
      get stacked diagnostics
            error_state   = returned_sqlstate,
            error_message     = message_text,
            error_detail  = pg_exception_detail,
            failed_query = pg_exception_context;
            RAISE notice   E'Error found:
                           state  : %
                           message: %
                           detail : %
                           context: %', error_state, error_message, error_detail,failed_query;
            RETURN json_build_object('Result', 'Failure', 'Reason', error_message );
END;
$$;

ALTER FUNCTION save_clickagy_signal(JSON, TEXT) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION save_clickagy_signal(JSON, TEXT) TO master_app;
