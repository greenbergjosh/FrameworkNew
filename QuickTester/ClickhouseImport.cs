using System;
using System.Collections;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using ClickHouse.Ado;

namespace QuickTester
{
    static class ClickhouseImport
    {
        public static void Test()
        {
            var connectionString = "Compress=True;BufferSize=32768;SocketTimeout=300000000;CheckCompressedHash=False;Compressor=lz4;Host=signal1.data.techopg.local;Port=9000;Database=datasets;User=default;Password=abc123";

            var startPiece = 4;
            var pieceCount = 16;
            var concurrentThreads = 2;

            //Step3(connectionString, startPiece, pieceCount, concurrentThreads);
            Step4(connectionString, startPiece, pieceCount, concurrentThreads);
        }

        private static void Step3(string connectionString, int startPiece, int pieceCount, int concurrentThreads)
        {
            Parallel.For(startPiece, pieceCount, new ParallelOptions() { MaxDegreeOfParallelism = concurrentThreads }, i =>
            {
                var partitionIndex = i.ToString("x");

                Console.WriteLine($"{DateTime.Now}: Starting partition: {partitionIndex}");

                using var connection = new ClickHouseConnection(connectionString);
                connection.Open();

                var query = $"DROP TABLE IF EXISTS datasets.email_events_step3_{partitionIndex}";

                using var dropTableCommand = connection.CreateCommand(query);
                dropTableCommand.ExecuteNonQuery();

                query = @$"CREATE TABLE datasets.email_events_step3_{partitionIndex} (
    email_id                              UUID,
    email                                 FixedString(255),
    first_name                            FixedString(275),
    first_name_standard                   FixedString(1),
    last_name                             FixedString(275),
    last_name_standard                    FixedString(1),
    gender                                FixedString(1),
    dob_year                              UInt16,
    dob_month                             UInt8,
    dob_day                               UInt8,
    `postal.dpv_address1`                 Array(FixedString(256)),
    `postal.dpv_address2`                 Array(FixedString(256)),
    `postal.dpv_city`                     Array(FixedString(256)),
    `postal.dpv_state`                    Array(FixedString(30)),
    `postal.dpv_zip_plus_four`            Array(FixedString(30)),
    `postal.true_dpv`                     Array(FixedString(1)),
    `postal.verified_date`                Array(FixedString(1)),
    `events.session_id`                   Array(Int64),
    `events.session_ts`                   Array(DateTime),
    `events.ip_address`                   Array(FixedString(15)),
    `events.domain`                       Array(FixedString(100)),
    `events.publisher_id`                 Array(Int32),
    `events.publisher_name`               Array(FixedString(50)),
    `events.root_campaign_id`             Array(Int32),
    `events.campaign_id`                  Array(Int32),
    `events.sub_campaign_id`              Array(Int32),
    `events.third_party_id`               Array(FixedString(75)),
    `events.path_style_id`                Array(Int32),
    `events.path_style_vertical_type_id`  Array(Int32),
    `events.browser_name`                 Array(FixedString(256)),
    `events.device_platform`              Array(FixedString(256)),
    `events.is_mobile`                    Array(FixedString(1)),
    `events.utm_campaign`                 Array(FixedString(4000)),
    `events.utm_ad_group`                 Array(FixedString(4000)),
    `events.utm_ad`                       Array(FixedString(4000)),
    `events.utm_keyword`                  Array(FixedString(75)),
    `events.event_type`                   Array(FixedString(50)),
    `events.event_ts`                     Array(DateTime),
    `events.path_name_id`                 Array(Int32),
    `events.demarcation_id`               Array(Int32),
    `events.demarcation_page_number`      Array(Int32),
    `events.slot_number`                  Array(Int32),
    `events.offer_id`                     Array(Int32),
    `events.offer_type`                   Array(FixedString(256)),
    `events.offer_category`               Array(FixedString(256)),
    `events.advertiser_id`                Array(Int32),
    `events.offer_set_template_id`        Array(Int32),
    `events.revenue_projected_generating` Array(FixedString(1)),
    `events.revenue_projected`            Array(Decimal(9, 5)),
    `events.revenue_actual_generating`    Array(FixedString(1)),
    `events.revenue_actual`               Array(Decimal(9, 5)),
    `events.expense_generating`           Array(FixedString(1)),
    `events.expense`                      Array(Decimal(9, 5)),
    `events.scrubbed`                     Array(FixedString(1)),
    `events.survey_question`              Array(FixedString(256)),
    `events.survey_answer`                Array(FixedString(256)),
    `lists.list_id`                       Array(UUID),
    `lists.entry_date`                    Array(Date),
    `lists.entry_hour`                    Array(UInt8),
    `lists.entry_minute`                  Array(UInt8),
    `lists.entry_second`                  Array(UInt8)
)
    engine = MergeTree()
        ORDER BY email_id
        SETTINGS index_granularity = 8192;
";

                using var createTableCommand = connection.CreateCommand(query);
                createTableCommand.ExecuteNonQuery();

                query = $@"
insert into datasets.email_events_step3_{partitionIndex}(
email_id,
email,
first_name,
first_name_standard,
last_name,
last_name_standard,
gender,
dob_year,
dob_month,
dob_day,
`postal.dpv_address1`,
`postal.dpv_address2`,
`postal.dpv_city`,
`postal.dpv_state`,
`postal.dpv_zip_plus_four`,
`postal.true_dpv`,
`postal.verified_date`,
`events.session_id`,
`events.session_ts`,
`events.ip_address`,
`events.domain`,
`events.publisher_id`,
`events.publisher_name`,
`events.root_campaign_id`,
`events.campaign_id`,
`events.sub_campaign_id`,
`events.third_party_id`,
`events.path_style_id`,
`events.path_style_vertical_type_id`,
`events.browser_name`,
`events.device_platform`,
`events.is_mobile`,
`events.utm_campaign`,
`events.utm_ad_group`,
`events.utm_ad`,
`events.utm_keyword`,
`events.event_type`,
`events.event_ts`,
`events.path_name_id`,
`events.demarcation_id`,
`events.demarcation_page_number`,
`events.slot_number`,
`events.offer_id`,
`events.offer_type`,
`events.offer_category`,
`events.advertiser_id`,
`events.offer_set_template_id`,
`events.revenue_projected_generating`,
`events.revenue_projected`,
`events.revenue_actual_generating`,
`events.revenue_actual`,
`events.expense_generating`,
`events.expense`,
`events.scrubbed`,
`events.survey_question`,
`events.survey_answer`,
`lists.list_id`,
`lists.entry_date`,
`lists.entry_hour`,
`lists.entry_minute`,
`lists.entry_second`
)
select
    email_id,

    coalesce(max(z.email1),'')            email,
    coalesce(max(z.first_name1),'') first_name,
    coalesce(max(z.first_name_standard1),'')  first_name_standard,
    coalesce(max(z.last_name1),'')  last_name,
    coalesce(max(z.last_name_standard1),'')   last_name_standard,
    coalesce(max(z.gender1),'')   gender,
    coalesce(max(z.dob_year1),0)     dob_year,
    coalesce(max(z.dob_month1),0)  dob_month,
    coalesce(max(z.dob_day1),0)  dob_day,

    max(dpv_address1),
    max(dpv_address2),
    max(dpv_city),
    max(dpv_state),
    max(dpv_zip_plus_four),
    max(true_dpv),
    max(verified_date),

    max(session_id),
    max(session_ts),
    max(ip_address),
    max(domain),
    max(publisher_id),
    max(publisher_name),
    max(root_campaign_id),
    max(campaign_id),
    max(sub_campaign_id),
    max(third_party_id),
    max(path_style_id),
    max(path_style_vertical_type_id),
    max(browser_name),
    max(device_platform),
    max(is_mobile),
    max(utm_campaign),
    max(utm_ad_group),
    max(utm_ad),
    max(utm_keyword),
    max(event_type),
    max(event_ts),
    max(path_name_id),
    max(demarcation_id),
    max(demarcation_page_number),
    max(slot_number),
    max(offer_id),
    max(offer_type),
    max(offer_category),
    max(advertiser_id),
    max(offer_set_template_id),
    max(revenue_projected_generating),
    max(revenue_projected),
    max(revenue_actual_generating),
    max(revenue_actual),
    max(expense_generating),
    max(expense),
    max(scrubbed),
    max(survey_question),
    max(survey_answer),

    arrayFlatten(groupArray(list_id)),
    arrayFlatten(groupArray(entry_date)),
    arrayFlatten(groupArray(entry_hour)),
    arrayFlatten(groupArray(entry_minute)),
    arrayFlatten(groupArray(entry_second))
from (
    select
        email_id,
        email email1,
        first_name first_name1,
        first_name_standard first_name_standard1,
        last_name last_name1,
        last_name_standard last_name_standard1,
        gender gender1,
        dob_year dob_year1,
        dob_month dob_month1,
        dob_day dob_day1,
        postal.dpv_address1 dpv_address1,
        postal.dpv_address2 dpv_address2,
        postal.dpv_city dpv_city,
        postal.dpv_state dpv_state,
        postal.dpv_zip_plus_four dpv_zip_plus_four,
        postal.true_dpv true_dpv,
        postal.verified_date verified_date,
        events.session_id session_id,
        events.session_ts session_ts,
        events.ip_address ip_address,
        events.domain domain,
        events.publisher_id publisher_id,
        events.publisher_name publisher_name,
        events.root_campaign_id root_campaign_id,
        events.campaign_id campaign_id,
        events.sub_campaign_id sub_campaign_id,
        events.third_party_id third_party_id,
        events.path_style_id path_style_id,
        events.path_style_vertical_type_id path_style_vertical_type_id,
        events.browser_name browser_name,
        events.device_platform device_platform,
        events.is_mobile is_mobile,
        events.utm_campaign utm_campaign,
        events.utm_ad_group utm_ad_group,
        events.utm_ad utm_ad,
        events.utm_keyword utm_keyword,
        events.event_type event_type,
        events.event_ts event_ts,
        events.path_name_id path_name_id,
        events.demarcation_id demarcation_id,
        events.demarcation_page_number demarcation_page_number,
        events.slot_number slot_number,
        events.offer_id offer_id,
        events.offer_type offer_type,
        events.offer_category offer_category,
        events.advertiser_id advertiser_id,
        events.offer_set_template_id offer_set_template_id,
        events.revenue_projected_generating revenue_projected_generating,
        events.revenue_projected revenue_projected,
        events.revenue_actual_generating revenue_actual_generating,
        events.revenue_actual revenue_actual,
        events.expense_generating expense_generating,
        events.expense expense,
        events.scrubbed scrubbed,
        events.survey_question survey_question,
        events.survey_answer survey_answer,
        lists.list_id list_id,
        lists.entry_date entry_date,
        lists.entry_hour entry_hour,
        lists.entry_minute entry_minute,
        lists.entry_second entry_second
    from datasets.email_events_{partitionIndex}
union all
    select
        email_id,
        null email1,
        null first_name1,
        null first_name_standard1,
        null last_name1,
        null last_name_standard1,
        null gender1,
        null dob_year1,
        null dob_month1,
        null dob_day1,
        [] dpv_address1,
        [] dpv_address2,
        [] dpv_city,
        [] dpv_state,
        [] dpv_zip_plus_four,
        [] true_dpv,
        [] verified_date,
        [] session_id,
        [] session_ts,
        [] ip_address,
        [] domain,
        [] publisher_id,
        [] publisher_name,
        [] root_campaign_id,
        [] campaign_id,
        [] sub_campaign_id,
        [] third_party_id,
        [] path_style_id,
        [] path_style_vertical_type_id,
        [] browser_name,
        [] device_platform,
        [] is_mobile,
        [] utm_campaign,
        [] utm_ad_group,
        [] utm_ad,
        [] utm_keyword,
        [] event_type,
        [] event_ts,
        [] path_name_id,
        [] demarcation_id,
        [] demarcation_page_number,
        [] slot_number,
        [] offer_id,
        [] offer_type,
        [] offer_category,
        [] advertiser_id,
        [] offer_set_template_id,
        [] revenue_projected_generating,
        [] revenue_projected,
        [] revenue_actual_generating,
        [] revenue_actual,
        [] expense_generating,
        [] expense,
        [] scrubbed,
        [] survey_question,
        [] survey_answer,
        list_id,
        entry_date,
        entry_hour,
        entry_minute,
        entry_second
    from datasets.import_email_lists_grouped
    where substring(cast(email_id, 'String'), 1, 1) = '{partitionIndex}'
) z
group by email_id;";
                //where reinterpretAsInt16(reverse(unhex(substring(cast(email_id, 'String'), 1, 2)))) % {pieceCount} = {partitionName}
                using var insertToTableCommand = connection.CreateCommand(query);
                insertToTableCommand.ExecuteNonQuery();

                Console.WriteLine($"{DateTime.Now}: Finished partition {partitionIndex}");
            });
        }

        private static void Step4(string connectionString, int startPiece, int pieceCount, int concurrentThreads)
        {
            Parallel.For(startPiece, pieceCount, new ParallelOptions() { MaxDegreeOfParallelism = concurrentThreads }, i =>
            {
                var partitionIndex = i.ToString("x");

                Console.WriteLine($"{DateTime.Now}: Starting partition: {partitionIndex}");

                using var connection = new ClickHouseConnection(connectionString);
                connection.Open();

                var query = $"DROP TABLE IF EXISTS datasets.email_events_step4_{partitionIndex}";

                using var dropTableCommand = connection.CreateCommand(query);
                dropTableCommand.ExecuteNonQuery();

                query = @$"CREATE TABLE datasets.email_events_step4_{partitionIndex} (
    email_id                              UUID,
    email                                 FixedString(255),
    first_name                            FixedString(275),
    first_name_standard                   FixedString(1),
    last_name                             FixedString(275),
    last_name_standard                    FixedString(1),
    gender                                FixedString(1),
    dob_year                              UInt16,
    dob_month                             UInt8,
    dob_day                               UInt8,
    `postal.dpv_address1`                 Array(FixedString(256)),
    `postal.dpv_address2`                 Array(FixedString(256)),
    `postal.dpv_city`                     Array(FixedString(256)),
    `postal.dpv_state`                    Array(FixedString(30)),
    `postal.dpv_zip_plus_four`            Array(FixedString(30)),
    `postal.true_dpv`                     Array(FixedString(1)),
    `postal.verified_date`                Array(FixedString(1)),
    `events.session_id`                   Array(Int64),
    `events.session_ts`                   Array(DateTime),
    `events.ip_address`                   Array(FixedString(15)),
    `events.domain`                       Array(FixedString(100)),
    `events.publisher_id`                 Array(Int32),
    `events.publisher_name`               Array(FixedString(50)),
    `events.root_campaign_id`             Array(Int32),
    `events.campaign_id`                  Array(Int32),
    `events.sub_campaign_id`              Array(Int32),
    `events.third_party_id`               Array(FixedString(75)),
    `events.path_style_id`                Array(Int32),
    `events.path_style_vertical_type_id`  Array(Int32),
    `events.browser_name`                 Array(FixedString(256)),
    `events.device_platform`              Array(FixedString(256)),
    `events.is_mobile`                    Array(FixedString(1)),
    `events.utm_campaign`                 Array(FixedString(4000)),
    `events.utm_ad_group`                 Array(FixedString(4000)),
    `events.utm_ad`                       Array(FixedString(4000)),
    `events.utm_keyword`                  Array(FixedString(75)),
    `events.event_type`                   Array(FixedString(50)),
    `events.event_ts`                     Array(DateTime),
    `events.path_name_id`                 Array(Int32),
    `events.demarcation_id`               Array(Int32),
    `events.demarcation_page_number`      Array(Int32),
    `events.slot_number`                  Array(Int32),
    `events.offer_id`                     Array(Int32),
    `events.offer_type`                   Array(FixedString(256)),
    `events.offer_category`               Array(FixedString(256)),
    `events.advertiser_id`                Array(Int32),
    `events.offer_set_template_id`        Array(Int32),
    `events.revenue_projected_generating` Array(FixedString(1)),
    `events.revenue_projected`            Array(Decimal(9, 5)),
    `events.revenue_actual_generating`    Array(FixedString(1)),
    `events.revenue_actual`               Array(Decimal(9, 5)),
    `events.expense_generating`           Array(FixedString(1)),
    `events.expense`                      Array(Decimal(9, 5)),
    `events.scrubbed`                     Array(FixedString(1)),
    `events.survey_question`              Array(FixedString(256)),
    `events.survey_answer`                Array(FixedString(256)),
    `lists.list_id`                       Array(UUID),
    `lists.entry_date`                    Array(Date),
    `lists.entry_hour`                    Array(UInt8),
    `lists.entry_minute`                  Array(UInt8),
    `lists.entry_second`                  Array(UInt8)
)
    engine = MergeTree()
        ORDER BY email_id
        SETTINGS index_granularity = 8192;
";

                using var createTableCommand = connection.CreateCommand(query);
                createTableCommand.ExecuteNonQuery();

                query = $@"
insert into datasets.email_events_step4_{partitionIndex}(
email_id,
email,
first_name,
first_name_standard,
last_name,
last_name_standard,
gender,
dob_year,
dob_month,
dob_day,
`postal.dpv_address1`,
`postal.dpv_address2`,
`postal.dpv_city`,
`postal.dpv_state`,
`postal.dpv_zip_plus_four`,
`postal.true_dpv`,
`postal.verified_date`,
`events.session_id`,
`events.session_ts`,
`events.ip_address`,
`events.domain`,
`events.publisher_id`,
`events.publisher_name`,
`events.root_campaign_id`,
`events.campaign_id`,
`events.sub_campaign_id`,
`events.third_party_id`,
`events.path_style_id`,
`events.path_style_vertical_type_id`,
`events.browser_name`,
`events.device_platform`,
`events.is_mobile`,
`events.utm_campaign`,
`events.utm_ad_group`,
`events.utm_ad`,
`events.utm_keyword`,
`events.event_type`,
`events.event_ts`,
`events.path_name_id`,
`events.demarcation_id`,
`events.demarcation_page_number`,
`events.slot_number`,
`events.offer_id`,
`events.offer_type`,
`events.offer_category`,
`events.advertiser_id`,
`events.offer_set_template_id`,
`events.revenue_projected_generating`,
`events.revenue_projected`,
`events.revenue_actual_generating`,
`events.revenue_actual`,
`events.expense_generating`,
`events.expense`,
`events.scrubbed`,
`events.survey_question`,
`events.survey_answer`,
`lists.list_id`,
`lists.entry_date`,
`lists.entry_hour`,
`lists.entry_minute`,
`lists.entry_second`
)
select
    email_id,

    coalesce(max(z.email1),'')            email,
    coalesce(max(z.first_name1),'') first_name,
    coalesce(max(z.first_name_standard1),'')  first_name_standard,
    coalesce(max(z.last_name1),'')  last_name,
    coalesce(max(z.last_name_standard1),'')   last_name_standard,
    coalesce(max(z.gender1),'')   gender,
    coalesce(max(z.dob_year1),0)     dob_year,
    coalesce(max(z.dob_month1),0)  dob_month,
    coalesce(max(z.dob_day1),0)  dob_day,

    arrayFlatten(groupArray(dpv_address1)),
    arrayFlatten(groupArray(dpv_address2)),
    arrayFlatten(groupArray(dpv_city)),
    arrayFlatten(groupArray(dpv_state)),
    arrayFlatten(groupArray(dpv_zip_plus_four)),
    arrayFlatten(groupArray(true_dpv)),
    arrayFlatten(groupArray(verified_date)),

    max(session_id),
    max(session_ts),
    max(ip_address),
    max(domain),
    max(publisher_id),
    max(publisher_name),
    max(root_campaign_id),
    max(campaign_id),
    max(sub_campaign_id),
    max(third_party_id),
    max(path_style_id),
    max(path_style_vertical_type_id),
    max(browser_name),
    max(device_platform),
    max(is_mobile),
    max(utm_campaign),
    max(utm_ad_group),
    max(utm_ad),
    max(utm_keyword),
    max(event_type),
    max(event_ts),
    max(path_name_id),
    max(demarcation_id),
    max(demarcation_page_number),
    max(slot_number),
    max(offer_id),
    max(offer_type),
    max(offer_category),
    max(advertiser_id),
    max(offer_set_template_id),
    max(revenue_projected_generating),
    max(revenue_projected),
    max(revenue_actual_generating),
    max(revenue_actual),
    max(expense_generating),
    max(expense),
    max(scrubbed),
    max(survey_question),
    max(survey_answer),

    max(list_id),
    max(entry_date),
    max(entry_hour),
    max(entry_minute),
    max(entry_second)
from (
    select
        email_id,
        email email1,
        first_name first_name1,
        first_name_standard first_name_standard1,
        last_name last_name1,
        last_name_standard last_name_standard1,
        gender gender1,
        dob_year dob_year1,
        dob_month dob_month1,
        dob_day dob_day1,

        postal.dpv_address1 dpv_address1,
        postal.dpv_address2 dpv_address2,
        postal.dpv_city dpv_city,
        postal.dpv_state dpv_state,
        postal.dpv_zip_plus_four dpv_zip_plus_four,
        postal.true_dpv true_dpv,
        postal.verified_date verified_date,
        events.session_id session_id,
        events.session_ts session_ts,
        events.ip_address ip_address,
        events.domain domain,
        events.publisher_id publisher_id,
        events.publisher_name publisher_name,
        events.root_campaign_id root_campaign_id,
        events.campaign_id campaign_id,
        events.sub_campaign_id sub_campaign_id,
        events.third_party_id third_party_id,
        events.path_style_id path_style_id,
        events.path_style_vertical_type_id path_style_vertical_type_id,
        events.browser_name browser_name,
        events.device_platform device_platform,
        events.is_mobile is_mobile,
        events.utm_campaign utm_campaign,
        events.utm_ad_group utm_ad_group,
        events.utm_ad utm_ad,
        events.utm_keyword utm_keyword,
        events.event_type event_type,
        events.event_ts event_ts,
        events.path_name_id path_name_id,
        events.demarcation_id demarcation_id,
        events.demarcation_page_number demarcation_page_number,
        events.slot_number slot_number,
        events.offer_id offer_id,
        events.offer_type offer_type,
        events.offer_category offer_category,
        events.advertiser_id advertiser_id,
        events.offer_set_template_id offer_set_template_id,
        events.revenue_projected_generating revenue_projected_generating,
        events.revenue_projected revenue_projected,
        events.revenue_actual_generating revenue_actual_generating,
        events.revenue_actual revenue_actual,
        events.expense_generating expense_generating,
        events.expense expense,
        events.scrubbed scrubbed,
        events.survey_question survey_question,
        events.survey_answer survey_answer,
        lists.list_id list_id,
        lists.entry_date entry_date,
        lists.entry_hour entry_hour,
        lists.entry_minute entry_minute,
        lists.entry_second entry_second
    from datasets.email_events_step3_{partitionIndex}
union all
    select
        email_id,
        null email1,
        null first_name1,
        null first_name_standard1,
        null last_name1,
        null last_name_standard1,
        null gender1,
        null dob_year1,
        null dob_month1,
        null dob_day1,
        
        dpv_address1,
        dpv_address2,
        dpv_city,
        dpv_state,
        dpv_zip_plus_four,
        true_dpv,
        verified_date,
        [] session_id,
        [] session_ts,
        [] ip_address,
        [] domain,
        [] publisher_id,
        [] publisher_name,
        [] root_campaign_id,
        [] campaign_id,
        [] sub_campaign_id,
        [] third_party_id,
        [] path_style_id,
        [] path_style_vertical_type_id,
        [] browser_name,
        [] device_platform,
        [] is_mobile,
        [] utm_campaign,
        [] utm_ad_group,
        [] utm_ad,
        [] utm_keyword,
        [] event_type,
        [] event_ts,
        [] path_name_id,
        [] demarcation_id,
        [] demarcation_page_number,
        [] slot_number,
        [] offer_id,
        [] offer_type,
        [] offer_category,
        [] advertiser_id,
        [] offer_set_template_id,
        [] revenue_projected_generating,
        [] revenue_projected,
        [] revenue_actual_generating,
        [] revenue_actual,
        [] expense_generating,
        [] expense,
        [] scrubbed,
        [] survey_question,
        [] survey_answer,
        [] list_id,
        [] entry_date,
        [] entry_hour,
        [] entry_minute,
        [] entry_second
    from datasets.import_email_postal_grouped
    where substring(cast(email_id, 'String'), 1, 1) = '{partitionIndex}'
) z
group by email_id;";
                //where reinterpretAsInt16(reverse(unhex(substring(cast(email_id, 'String'), 1, 2)))) % {pieceCount} = {partitionName}
                using var insertToTableCommand = connection.CreateCommand(query);
                insertToTableCommand.ExecuteNonQuery();

                Console.WriteLine($"{DateTime.Now}: Finished partition {partitionIndex}");
            });
        }

        private static void PrintData(IDataReader reader)
        {
            do
            {
                Console.Write("Fields: ");
                for (var i = 0; i < reader.FieldCount; i++) Console.Write("{0}:{1} ", reader.GetName(i), reader.GetDataTypeName(i));
                Console.WriteLine();
                while (reader.Read())
                {
                    for (var i = 0; i < reader.FieldCount; i++)
                    {
                        var val = reader.GetValue(i);
                        if (val?.GetType().IsArray == true)
                        {
                            Console.Write('[');
                            Console.Write(string.Join(", ", ((IEnumerable)val).Cast<object>()));
                            Console.Write(']');
                        }
                        else
                        {
                            Console.Write(val);
                        }

                        Console.Write(", ");
                    }

                    Console.WriteLine();
                }

                Console.WriteLine();
            } while (reader.NextResult());
        }
    }
}
