create table if not exists raw.visitorid_signal
(
	seq_id bigserial not null
		grant usage on sequence raw.visitorid_signal_id_seq to master_app
		constraint visitorid_signal_pkey
			primary key,
	payload jsonb not null,
	ts timestamp(6) with time zone default now() not null
);

alter table raw.visitorid_signal owner to postgres;

create index if not exists visitorid_signal_record_date
	on raw.visitorid_signal (util.timestamp_or_null(payload ->> 'ts'::text));

grant insert, select on raw.visitorid_signal to data_uploader_role;

grant delete, insert, references, select, trigger, truncate, update on raw.visitorid_signal to master_app;

create table if not exists raw.visitorid_signal_failed
(
	seq_id bigint not null,
	payload jsonb not null,
	ts timestamp(6) with time zone not null
);

alter table raw.visitorid_signal_failed owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on raw.visitorid_signal_failed to master_app;

create or replace function raw.is_visitor_id_lead(args json, payload text) returns json
	language plpgsql
as $$
DECLARE
    md5   uuid;
    email varchar(254);
    res   jsonb;
BEGIN

    md5 = args ->> 'md5';
    email = args ->> 'email';

    if md5 is null and email is null then
        return json_build_object('result', false);
    end if;

    if md5 is null then
        md5 = md5(lower(email))::uuid;
    end if;

    with optin as (
        select oi.email_id, oi.opt_in_date, oi.ip, d.domain
        from dimensions_by_email_id.opt_in_full oi
                 join shared_dimensions.domain d on oi.domain_id = d.domain_id
        where oi.email_id = md5
        order by oi.opt_in_date desc
        limit 1
    ),
         isLead as (
             select e.email_id md5,
                    e.email,
                    n.first_name,
                    n.last_name,
                    cp.dpv_zip_plus_four,
                    oi.opt_in_date,
                    oi.ip,
                    oi.domain
             from contact.email e
                      join dimensions_by_email_id.name n on e.email_id = n.email_id
                      join dimensions_by_email_id.postal_summary ps on e.email_id = ps.email_id
                      join contact.postal cp ON ps.last_postal_id = cp.postal_id
                      join optin oi on e.email_id = oi.email_id
                      left join dimensions_by_email_id.signal s
                                on e.email_id = s.email_id and s.record_type_id in (8, 9, 10, 11, 12, 14, 15, 17, 18)
             where e.email is not null
               and s.email_id is null
               and e.email_id = md5
         )
    select row_to_json(l)
    from isLead l
    into res;

    if res is null then
        return jsonb_build_object('result', 'success'); -- non-null no-op for caller
    else
        return res; -- usable record for caller
    end if;

    -- return (res || jsonb_build_object('result', 'success'))::json;

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('Result', 'failed', 'Error', SQLERRM);
END;
$$;

alter function raw.is_visitor_id_lead(json, text) owner to postgres;

grant execute on function raw.is_visitor_id_lead(json, text) to master_app;

create or replace function raw.save_visitorid_provider_response(args json, payload text) returns json
	language plpgsql
as $$
DECLARE
    error_state TEXT;
    error_message TEXT;
    error_detail TEXT;
    failed_query TEXT;
    response_count_post int := 0;
BEGIN
        INSERT INTO raw.md5_provider_response_cache
        (
                provider_id
                ,session_id
                ,md5
                ,first_seen
                ,last_seen
                ,response_count
        )
        VALUES
        (
                 CAST(args->>'provider_id' AS UUID)
                ,CAST(args->>'session_id' AS UUID)
                ,CAST(args->>'md5' AS UUID)
                ,now()
                ,now()
                ,1
        )
        ON CONFLICT  (provider_id, session_id, md5)
        DO UPDATE SET
                 last_seen = now()
                ,response_count = raw.md5_provider_response_cache.response_count + 1;

        SELECT response_count INTO response_count_post
        FROM raw.md5_provider_response_cache
        WHERE
                provider_id = CAST(args->>'provider_id' AS UUID) AND
                session_id = CAST(args->>'session_id' AS UUID) AND
                md5 = CAST(args->>'md5' AS UUID);

        IF response_count_post = 1 THEN
                RETURN json_build_object('r', 'new');
        ELSE
                RETURN json_build_object('r', 'dup');
        END IF;

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
		VALUES (1, 1001, 'visitorid', 'save_visitorid_provider_response', '', error_message, now());

		RETURN json_build_object('Result', 'Failed', 'Error', error_message );
END;
$$;

alter function raw.save_visitorid_provider_response(json, text) owner to postgres;

grant execute on function raw.save_visitorid_provider_response(json, text) to master_app;

create or replace function raw.save_visitorid_provider_sessionid_email_md5(args json, payload text) returns json
	language plpgsql
as $$
DECLARE
    error_state TEXT;
    error_message TEXT;
    error_detail TEXT;
    failed_query TEXT;
BEGIN

        INSERT INTO raw.visitorid_session_id_lookup
        (
                md5pid
                ,session_id
                ,md5
                ,email
                ,ts
        )
        VALUES
        (
                 (args->>'Md5Pid')::UUID
                ,(args->>'Sid')::UUID
                ,(args->>'Md5')::UUID
                ,args->>'Email'
                ,NOW()
        );

        RETURN json_build_object
        (
                'Md5Pid', args->>'Md5Pid',
                'Em', args->>'Email',
                'Md5', args->>'Md5'
        );


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
		VALUES (1, 1001, 'visitorid', 'save_visitorid_sessionid_email_md5', '', error_message, now());

		RETURN json_build_object('Result', 'Failed', 'Error', error_message );
END;
$$;

alter function raw.save_visitorid_provider_sessionid_email_md5(json, text) owner to postgres;

grant execute on function raw.save_visitorid_provider_sessionid_email_md5(json, text) to master_app;

create or replace function raw.save_visitorid_sessionid_email_md5(args json, payload text) returns json
	language plpgsql
as $$
DECLARE
    error_state TEXT;
    error_message TEXT;
    error_detail TEXT;
    failed_query TEXT;
BEGIN

        INSERT INTO raw.visitorid_session_id_lookup
        (
                session_id
                ,md5
                ,email
                ,ts
        )
        VALUES
        (
                 CAST(args->>'Sid' AS UUID)
                ,CAST(args->>'Md5' AS UUID)
                ,args->>'Email'
                ,NOW()
        );

        RETURN json_build_object
        (
                'Em', args->>'Email',
                'Md5', args->>'Md5'
        );


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
		VALUES (1, 1001, 'visitorid', 'save_visitorid_sessionid_email_md5', '', error_message, now());

		RETURN json_build_object('Result', 'Failed', 'Error', error_message );
END;
$$;

alter function raw.save_visitorid_sessionid_email_md5(json, text) owner to postgres;

grant execute on function raw.save_visitorid_sessionid_email_md5(json, text) to master_app;

create or replace function raw.save_visitorid_signal(args json, payload text) returns jsonb
	language plpgsql
as $$
DECLARE
    error_state TEXT;
    error_message TEXT;
    error_detail TEXT;
    failed_query TEXT;
	signal_id BIGINT;
BEGIN

	INSERT INTO raw.visitorid_signal (payload, ts)
	SELECT args, now()
	RETURNING seq_id INTO signal_id;

	RETURN format('{"status" : "Ok", "signalId": %s}', signal_id)::json;

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
		VALUES (1, 1001, 'visitorid', 'visitorid_save_data', '', error_message, now());

		RETURN json_build_object('Result', 'Failed', 'Error', error_message );
END;

$$;

alter function raw.save_visitorid_signal(json, text) owner to postgres;

grant execute on function raw.save_visitorid_signal(json, text) to master_app;

