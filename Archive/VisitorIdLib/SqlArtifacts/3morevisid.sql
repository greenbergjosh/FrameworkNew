create function raw.get_visitorid_md5_email_by_sessionid(args json, payload text) returns json
	language plpgsql
as $$
DECLARE
    error_state TEXT;
    error_message TEXT;
    error_detail TEXT;
    failed_query TEXT;
    email TEXT;
    md5 UUID;
BEGIN
        
        SELECT
                 visitorid_session_id_lookup.md5
                ,visitorid_session_id_lookup.email
        INTO
                 md5
                ,email
        FROM
                raw.visitorid_session_id_lookup
        WHERE
                
                session_id = CAST(args->>'Sid' AS UUID)
                order by ts desc
        LIMIT 1;
       
	RETURN json_build_object('Em', email, 'Md5', md5);

	EXCEPTION  WHEN OTHERS THEN
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

		INSERT INTO error_log.error_log (sequence, severity, process, method, descriptor, message, ts)
		VALUES (1, 1001, 'visitorid', 'get_visitorid_md5_email_by_sessionid', '', error_message, now());

		RETURN json_build_object('Result', 'Failed', 'Error', error_message );
END;
$$;

alter function raw.get_visitorid_md5_email_by_sessionid(json, text) owner to postgres;

grant execute on function raw.get_visitorid_md5_email_by_sessionid(json, text) to master_app;

create function raw.get_visitorid_md5_provider_responses_by_date(args json, payload text) returns json
	language plpgsql
as $$
DECLARE
    error_state TEXT;
    error_message TEXT;
    error_detail TEXT;
    failed_query TEXT;
    ret JSON;
    days_ago INT := 30;
BEGIN
        SELECT json_agg(t) FROM (
        SELECT
                 provider_id AS "Pid"
                ,session_id AS "Sid"
                ,mprc.md5 AS "Md5"
                ,first_seen as "FirstSeen"
                FROM raw.md5_provider_response_cache mprc
                LEFT JOIN LATERAL
                        (SELECT value FROM json_array_elements_text(args->'exclude_list') ) x
                ON mprc.md5 = CAST(x.value AS UUID)
                                
        INTO ret
        WHERE
                DATE_PART('day', now()) - DATE_PART('day', first_seen) <= days_ago
                AND x.value IS NULL
        ) t;
        RETURN ret;
        
/*
select * from md5_provider_response_cache m5rc 
LEFT JOIN LATERAL (
select * FROM json_array_elements_text('["78a1291b-66e5-450c-87e5-c8535e0e6d29", "d96a2aeb-52d3-47ac-802b-41582a066f9a" ]'::json)
) x on m5rc.md5 = CAST(x.value AS UUID)
where x.value IS NULL
*/

	EXCEPTION  WHEN OTHERS THEN
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

		INSERT INTO error_log.error_log (sequence, severity, process, method, descriptor, message, ts)
		VALUES (1, 1001, 'visitorid', 'get_visitorid_md5_provider_responses_by_date', '', error_message, now());

		RETURN json_build_object('Result', 'Failed', 'Error', error_message );
END;
$$;

alter function raw.get_visitorid_md5_provider_responses_by_date(json, text) owner to postgres;

grant execute on function raw.get_visitorid_md5_provider_responses_by_date(json, text) to master_app;

create function raw.get_visitorid_provider_md5_email_by_sessionid(args json, payload text) returns json
	language plpgsql
as $$
DECLARE
    error_state TEXT;
    error_message TEXT;
    error_detail TEXT;
    failed_query TEXT;
    email TEXT;
    md5 UUID;
    md5pid UUID;
    ts TIMESTAMP WITHOUT TIME ZONE;
BEGIN
        
        SELECT
                 visitorid_session_id_lookup.md5pid
                ,visitorid_session_id_lookup.md5
                ,visitorid_session_id_lookup.email
                ,visitorid_session_id_lookup.ts
        INTO
                 md5pid
                ,md5
                ,email
                ,ts
        FROM
                raw.visitorid_session_id_lookup
        WHERE
                
                session_id = CAST(args->>'Sid' AS UUID)
                order by ts desc
        LIMIT 1;
       
	RETURN json_build_object('Md5Pid', md5pid, 'Em', email, 'Md5', translate(md5::text,'-',''), 'Ts', ts);

	EXCEPTION  WHEN OTHERS THEN
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

		INSERT INTO error_log.error_log (sequence, severity, process, method, descriptor, message, ts)
		VALUES (1, 1001, 'visitorid', 'get_visitorid_md5_email_by_sessionid', '', error_message, now());

		RETURN json_build_object('Result', 'Failed', 'Error', error_message );
END;
$$;

alter function raw.get_visitorid_provider_md5_email_by_sessionid(json, text) owner to postgres;

grant execute on function raw.get_visitorid_provider_md5_email_by_sessionid(json, text) to master_app;

