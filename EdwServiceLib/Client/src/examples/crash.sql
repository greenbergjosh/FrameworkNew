INSERT INTO rollup."local_VisitorIdMd5Provider"
SELECT date_trunc('hour', dt.report_sequence_ts) "sequence_hour" , 
    COALESCE(md5_provider_id, '00000000-0000-0000-0000-000000000000'::uuid) "md5_provider_id" , 
    COALESCE(domain, '') "domain" , 
    COALESCE(affiliate_id, '00000000-0000-0000-0000-000000000000'::uuid) "affiliate_id" , 
    COALESCE(third_party_id, '') "third_party_id" , 
    COALESCE(email_provider_id, '00000000-0000-0000-0000-000000000000'::uuid) "email_provider_id" , 
    COALESCE(md5_slot, -1) "md5_slot" , 
    COALESCE(md5_page, -1) "md5_page" , 
    COALESCE(email_slot, -1) "email_slot" , 
    COALESCE(email_page, -1) "email_page" ,
    SUM(CASE WHEN event_type = 'PageSessionInitiate' THEN 1 ELSE 0 END) "page_session_initiate_count" , 
    SUM(CASE WHEN event_type = 'DomainSessionInitiate' THEN 1 ELSE 0 END) "domain_session_initiate_count" , 
    SUM(CASE WHEN event_type = 'Md5ProviderSelected' THEN 1 ELSE 0 END) "md5_provider_selected_count" , 
    SUM(CASE WHEN event_type = 'Md5ProviderResponse' THEN 1 ELSE 0 END) "md5_provider_response_count" , 
    SUM(CASE WHEN event_type = 'Md5ProviderResponse' AND success THEN 1 ELSE 0 END) "md5_provider_response_success_count" , 
    SUM(CASE WHEN event_type = 'Md5ProviderResponse' AND expense_generating THEN 1 ELSE 0 END) "md5_provider_response_expense_generating_count" , 
    SUM(CASE WHEN event_type = 'EmailProviderSelected' THEN 1 ELSE 0 END) "email_provider_selected_count" , 
    SUM(CASE WHEN event_type = 'EmailProviderResponse' THEN 1 ELSE 0 END) "email_provider_response_count" , 
    SUM(CASE WHEN event_type = 'EmailProviderResponse' AND success THEN 1 ELSE 0 END) "email_provider_response_success_count"
    FROM
    (
        
        SELECT
            ers.rs_id,
            rs.report_sequence_ts,
            "affiliate_id", 
            "domain", 
            "very_first_visit", 
            "third_party_id", "page",
            ers.event_id,
            ea.event_ts,
            "md5_slot", 
            "event_type", 
            "email_slot", 
            "success", 
            "md5_provider_id", 
            "email_provider_id", 
            "expense_generating", 
            "email_page", 
            "md5_page"
        FROM
        (
            SELECT id event_id, 
                ts event_ts, 
                coalesce((t.payload->>'md5slot')::INT, 0) "md5_slot", 
                coalesce((t.payload->>'et')::TEXT, '') "event_type", 
                coalesce((t.payload->>'emailslot')::INT, 0) "email_slot", 
                coalesce((t.payload->>'succ')::BOOLEAN, false) "success", 
                coalesce((t.payload->>'md5pid')::UUID, '00000000-0000-0000-0000-000000000000') "md5_provider_id", 
                coalesce((t.payload->>'emailpid')::UUID, '00000000-0000-0000-0000-000000000000') "email_provider_id", 
                coalesce((t.payload->>'eg')::BOOLEAN, false) "expense_generating", 
                coalesce((t.payload->>'emailpage')::INT, 0) "email_page", 
                coalesce((t.payload->>'md5page')::INT, 0) "md5_page"
                FROM staging.event_payload  t--, jsonb_array_elements(t.payload) e
        ) ea
        JOIN LATERAL
        (
            SELECT event_id, 
                rs_id
                FROM warehouse.event_report_sequence
                    WHERE event_id = ea.event_id
        ) ers ON true
        JOIN LATERAL
        (
            SELECT a.id, 
                a.ts report_sequence_ts, 
                (a.payload->>'afid')::UUID "affiliate_id", 
                (a.payload->>'Domain')::TEXT "domain", 
                (a.payload->>'VeryFirstVisit')::BOOLEAN "very_first_visit", 
                (a.payload->>'tpid')::TEXT "third_party_id", 
                (a.payload->>'Page')::TEXT "page"
                FROM warehouse.report_sequence a--, jsonb_array_elements(a.payload) e
                    WHERE config_id = '2cbe0f59-1df0-414a-8d6b-a97428c8f312'
                        AND id = ers.rs_id
        ) rs ON true

    ) dt
    GROUP BY
    date_trunc('hour', dt.report_sequence_ts), 
    COALESCE(md5_provider_id, '00000000-0000-0000-0000-000000000000'::uuid), 
    COALESCE(domain, ''), 
    COALESCE(affiliate_id, '00000000-0000-0000-0000-000000000000'::uuid), 
    COALESCE(third_party_id, ''), 
    COALESCE(email_provider_id, '00000000-0000-0000-0000-000000000000'::uuid), 
    COALESCE(md5_slot, -1), 
    COALESCE(md5_page, -1), 
    COALESCE(email_slot, -1), 
    COALESCE(email_page, -1);