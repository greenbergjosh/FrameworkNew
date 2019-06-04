-- DDL for creating signal db

-- DROPS
DROP TABLE contact.email CASCADE;
DROP TABLE contact.phone CASCADE;
DROP TABLE contact.postal CASCADE;

DROP TABLE dimensions_by_email_id.auto_buff CASCADE;
DROP TABLE dimensions_by_email_id.b2b CASCADE;
DROP TABLE dimensions_by_email_id.book_reader CASCADE;
DROP TABLE dimensions_by_email_id.business_owner CASCADE;
DROP TABLE dimensions_by_email_id.cats CASCADE;
DROP TABLE dimensions_by_email_id.charity CASCADE;
DROP TABLE dimensions_by_email_id.cooking CASCADE;
DROP TABLE dimensions_by_email_id.dob CASCADE;
DROP TABLE dimensions_by_email_id.dogs CASCADE;
DROP TABLE dimensions_by_email_id.education CASCADE;
DROP TABLE dimensions_by_email_id.ethnicity CASCADE;
DROP TABLE dimensions_by_email_id.exercise CASCADE;
DROP TABLE dimensions_by_email_id.gender CASCADE;
DROP TABLE dimensions_by_email_id.height CASCADE;
DROP TABLE dimensions_by_email_id.home_business CASCADE;
DROP TABLE dimensions_by_email_id.home_value CASCADE;
DROP TABLE dimensions_by_email_id.household_income CASCADE;
DROP TABLE dimensions_by_email_id.international CASCADE;
DROP TABLE dimensions_by_email_id.language CASCADE;
DROP TABLE dimensions_by_email_id.magazine CASCADE;
DROP TABLE dimensions_by_email_id.mail_responder CASCADE;
DROP TABLE dimensions_by_email_id.music_song CASCADE;
DROP TABLE dimensions_by_email_id.mortgage CASCADE;
DROP TABLE dimensions_by_email_id.merchandise CASCADE;
DROP TABLE dimensions_by_email_id.marital_status CASCADE;
DROP TABLE dimensions_by_email_id.name CASCADE;
DROP TABLE dimensions_by_email_id.occupation CASCADE;
DROP TABLE dimensions_by_email_id.opt_in_domain CASCADE;
DROP TABLE dimensions_by_email_id.opt_in_full CASCADE;
DROP TABLE dimensions_by_email_id.outdoor CASCADE;
DROP TABLE dimensions_by_email_id.outdoor_sport CASCADE;
DROP TABLE dimensions_by_email_id.pc_owner CASCADE;
DROP TABLE dimensions_by_email_id.phone CASCADE;
DROP TABLE dimensions_by_email_id.pool_indicator CASCADE;
DROP TABLE dimensions_by_email_id.postal CASCADE;
DROP TABLE dimensions_by_email_id.presence_of_children CASCADE;
DROP TABLE dimensions_by_email_id.religion CASCADE;
DROP TABLE dimensions_by_email_id.rent_or_own CASCADE;
DROP TABLE dimensions_by_email_id.traveler CASCADE;
DROP TABLE dimensions_by_email_id.wealth_rating CASCADE;
DROP TABLE dimensions_by_email_id.weight CASCADE;

-- CREATES

-- contacts
CREATE TABLE contact.email (
	email_id uuid NOT NULL,
	email varchar(254) NULL,
	domain_id uuid NULL,
	email_md5 uuid NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data
;

CREATE TABLE contact.phone (
	phone_id uuid NOT NULL,
	phone varchar(20) NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data
;

-- Drop table
CREATE TABLE contact.postal (
	postal_id uuid NOT NULL,
	dpv_address1 varchar(256) NULL,
	dpv_address2 varchar(256) NULL,
	dpv_city varchar(256) NULL,
	dpv_state varchar(30) NULL,
	dpv_zip_plus_four varchar(30) NULL,
	true_dpv bool NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data
;

CREATE TABLE raw.pending_postal
(
    seq_id bigserial primary key,
    ts timestamp default now(),
    email_id uuid,
    attribution_id int,
    address1 text,
    address2 text,
    city text,
    state text,
    zip text,
    true_dpv boolean
)
TABLESPACE lvm_data
;

-- dimensions
-- Table: dimensions_by_email_id.auto_buff
CREATE TABLE dimensions_by_email_id.auto_buff
(
    email_id uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    count_seen integer,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.b2b
CREATE TABLE dimensions_by_email_id.b2b
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.book_reader
CREATE TABLE dimensions_by_email_id.book_reader
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.business_owner
CREATE TABLE dimensions_by_email_id.business_owner
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;
-- Table: dimensions_by_email_id.cats
CREATE TABLE dimensions_by_email_id.cats
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.charity
CREATE TABLE dimensions_by_email_id.charity
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    charity_type_id integer NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.cooking
CREATE TABLE dimensions_by_email_id.cooking
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;


-- Table: dimensions_by_email_id.dob
CREATE TABLE dimensions_by_email_id.dob
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    date_of_birth timestamp without time zone,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.dogs
CREATE TABLE dimensions_by_email_id.dogs
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.education
CREATE TABLE dimensions_by_email_id.education
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    education_type_id integer,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.ethnicity
CREATE TABLE dimensions_by_email_id.ethnicity
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    ethnicity_type_id integer NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.exercise
CREATE TABLE dimensions_by_email_id.exercise
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.gender
CREATE TABLE dimensions_by_email_id.gender
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    gender character varying(1) COLLATE pg_catalog."default" NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.height
CREATE TABLE dimensions_by_email_id.height
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    height integer NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.home_business
CREATE TABLE dimensions_by_email_id.home_business
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.home_value
CREATE TABLE dimensions_by_email_id.home_value
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    home_value integer NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.household_income
CREATE TABLE dimensions_by_email_id.household_income
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    income_bracket character varying(100) COLLATE pg_catalog."default" NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.international
CREATE TABLE dimensions_by_email_id.international
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.language
CREATE TABLE dimensions_by_email_id.language
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    language_type_id integer NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.magazine
CREATE TABLE dimensions_by_email_id.magazine
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    magazine_type_id integer NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.mail_responder
CREATE TABLE dimensions_by_email_id.mail_responder
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.marital_status
CREATE TABLE dimensions_by_email_id.marital_status
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    val character varying(1) COLLATE pg_catalog."default" NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.merchandise
CREATE TABLE dimensions_by_email_id.merchandise
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    merchandise_type_id integer NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.mortgage
CREATE TABLE dimensions_by_email_id.mortgage
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    home_purchase_date timestamp without time zone,
    amount integer,
    lender character varying(150) COLLATE pg_catalog."default",
    loan_type character varying(1) COLLATE pg_catalog."default",
    rate_type character varying(1) COLLATE pg_catalog."default",
    term_in_months integer,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.music_song
CREATE TABLE dimensions_by_email_id.music_song
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    music_song character varying(100) COLLATE pg_catalog."default",
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.name
CREATE TABLE dimensions_by_email_id.name
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_name character varying(275) COLLATE pg_catalog."default",
    last_name character varying(275) COLLATE pg_catalog."default",
    first_name_standard boolean,
    last_name_standard boolean,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.occupation
CREATE TABLE dimensions_by_email_id.occupation
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    occupation character varying(100) COLLATE pg_catalog."default",
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.opt_in_domain
CREATE TABLE dimensions_by_email_id.opt_in_domain
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    domain_id uuid NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.opt_in_full
CREATE TABLE dimensions_by_email_id.opt_in_full
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    ip inet,
    domain_id uuid,
    opt_in_date timestamp without time zone,
    user_agent uuid,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.outdoor
CREATE TABLE dimensions_by_email_id.outdoor
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.outdoor_sport
CREATE TABLE dimensions_by_email_id.outdoor_sport
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.pc_owner
CREATE TABLE dimensions_by_email_id.pc_owner
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.phone
CREATE TABLE dimensions_by_email_id.phone
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    phone_id uuid NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.pool_indicator
CREATE TABLE dimensions_by_email_id.pool_indicator
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.postal
CREATE TABLE dimensions_by_email_id.postal
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    postal_id uuid NOT NULL,
    verified_date timestamp without time zone,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.presence_of_children
CREATE TABLE dimensions_by_email_id.presence_of_children
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.religion
CREATE TABLE dimensions_by_email_id.religion
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    religion character varying(1) COLLATE pg_catalog."default" NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.rent_or_own
CREATE TABLE dimensions_by_email_id.rent_or_own
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    rent_or_own character varying(1) COLLATE pg_catalog."default" NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.traveler
CREATE TABLE dimensions_by_email_id.traveler
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.wealth_rating
CREATE TABLE dimensions_by_email_id.wealth_rating
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    wealth_rating character varying(100) COLLATE pg_catalog."default" NOT NULL,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Table: dimensions_by_email_id.weight
CREATE TABLE dimensions_by_email_id.weight
(
    email_id uuid NOT NULL,
    email_md5 uuid NOT NULL,
    attribution_id integer DEFAULT 0,
    min_weight integer,
    max_weight integer,
    first_seen_date timestamp without time zone,
    last_seen_date timestamp without time zone,
    count_seen integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE lvm_data;

-- Pk on email_id

-- contacts
ALTER TABLE contact.email
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

CREATE INDEX ix_contact_email
    ON contact.email USING hash
    (email)
    TABLESPACE lvm_data;
    
CREATE INDEX ix_contact_md5
    ON contact.email USING hash
    (md5)
    TABLESPACE lvm_data;

ALTER TABLE contact.phone
    ADD PRIMARY KEY(phone_id)
    USING INDEX TABLESPACE lvm_data;
    
CREATE INDEX ix_contact_phone
    ON contact.email USING hash
    (phone)
    TABLESPACE lvm_data;

ALTER TABLE contact.postal
    ADD PRIMARY KEY(postal_id)
    USING INDEX TABLESPACE lvm_data;
    
CREATE INDEX ix_postal_5_digit_zip 
    ON contact.postal USING btree (dpv_zip_plus_four) 
    WHERE ((length((dpv_zip_plus_four)::text) = 5) 
    AND ((COALESCE(dpv_address1, ''::character varying))::text = ''::text));
    TABLESPACE lvm_data;

-- dimensions
ALTER TABLE dimensions_by_email_id.auto_buff
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data; 

ALTER TABLE dimensions_by_email_id.b2b
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.book_reader
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.business_owner
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.cats
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.charity
    ADD PRIMARY KEY(charity_type_id, email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.cooking
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.dob
    ADD PRIMARY KEY(date_of_birth ,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.dogs
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.education
    ADD PRIMARY KEY(education_type_id,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.ethnicity
    ADD PRIMARY KEY(ethnicity_type_id,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.exercise
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.gender
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.height
    ADD PRIMARY KEY(height, email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.home_business
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.home_value
    ADD PRIMARY KEY(home_value,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.international
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.language
    ADD PRIMARY KEY(language_type_id,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.magazine
    ADD PRIMARY KEY(magazine_type_id,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.mail_responder
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.marital_status
    ADD PRIMARY KEY(val, email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.merchandise
    ADD PRIMARY KEY(merchandise_type_id,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.music_song
    ADD PRIMARY KEY(music_song,email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.occupation
    ADD PRIMARY KEY(occupation,email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.opt_in_domain
    ADD PRIMARY KEY(domain_id,email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.outdoor
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.outdoor_sport
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.pc_owner
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.phone
    ADD PRIMARY KEY(phone_id,email_id)
    USING INDEX TABLESPACE lvm_data;

ALTER TABLE dimensions_by_email_id.pool_indicator
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.postal
    ADD PRIMARY KEY(postal_id,email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.presence_of_children
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.religion
    ADD PRIMARY KEY(religion,email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.rent_or_own
    ADD PRIMARY KEY(rent_or_own,email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.traveler
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.wealth_rating
    ADD PRIMARY KEY(wealth_rating,email_id)
    USING INDEX TABLESPACE lvm_data;
    
ALTER TABLE dimensions_by_email_id.weight
    ADD PRIMARY KEY(email_id)
    USING INDEX TABLESPACE lvm_data;

-- Hash INDEXES on email_id when not pk
CREATE INDEX ix_charity_email_id
    ON dimensions_by_email_id.charity USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_dob_email_id
    ON dimensions_by_email_id.dob USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_education_email_id
    ON dimensions_by_email_id.education USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_ethnicity_email_id
    ON dimensions_by_email_id.ethnicity USING hash
    (email_id)
    TABLESPACE lvm_data; 

CREATE INDEX ix_height_email_id
    ON dimensions_by_email_id.height USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_home_value_email_id
    ON dimensions_by_email_id.home_value USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_household_income_email_id
    ON dimensions_by_email_id.household_income USING hash
    (email_id)
    TABLESPACE lvm_data;
    
CREATE INDEX ix_household_income_bracket
    ON dimensions_by_email_id.household_income
    (income_bracket,email_id)
    USING INDEX TABLESPACE lvm_data;

CREATE INDEX ix_language_email_id
    ON dimensions_by_email_id.language USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_magazine_email_id
    ON dimensions_by_email_id.magazine USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_marital_status_email_id
    ON dimensions_by_email_id.marital_status USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_merchandise_email_id
    ON dimensions_by_email_id.merchandise USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_mortgage_email_id
    ON dimensions_by_email_id.mortgage USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_music_song_email_id
    ON dimensions_by_email_id.music_song USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_name_email_id
    ON dimensions_by_email_id.name USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_occupation_email_id
    ON dimensions_by_email_id.occupation USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_opt_in_domain_email_id
    ON dimensions_by_email_id.opt_in_domain USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX opt_in_full_domain_id_idx
    ON dimensions_by_email_id.opt_in_full USING hash
    (domain_id)
    TABLESPACE lvm_data;

CREATE INDEX opt_in_full_email_id_idx
    ON dimensions_by_email_id.opt_in_full USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_phone_email_id
    ON dimensions_by_email_id.phone USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_postal_email_id
    ON dimensions_by_email_id.postal USING hash
    (email_id)
    TABLESPACE lvm_data;
    
CREATE INDEX ix_religion_email_id
    ON dimensions_by_email_id.religion USING hash
    (email_id)
    TABLESPACE lvm_data;

CREATE INDEX ix_wealth_rating_email_id
    ON dimensions_by_email_id.wealth_rating USING hash
    (email_id)
    TABLESPACE lvm_data;

-- ALTERs
ALTER TABLE dimensions_by_email_id.weight
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.weight TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.weight TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.weight TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.wealth_rating
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.wealth_rating TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.wealth_rating TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.wealth_rating TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.traveler
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.traveler TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.traveler TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.traveler TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.rent_or_own
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.rent_or_own TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.rent_or_own TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.rent_or_own TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.religion
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.religion TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.religion TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.religion TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.presence_of_children
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.presence_of_children TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.presence_of_children TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.presence_of_children TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.postal
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.postal TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.postal TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.postal TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.pool_indicator
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.pool_indicator TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.pool_indicator TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.pool_indicator TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.phone
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.phone TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.phone TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.phone TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.pc_owner
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.pc_owner TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.pc_owner TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.pc_owner TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.outdoor_sport
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.outdoor_sport TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.outdoor_sport TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.outdoor_sport TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.outdoor
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.outdoor TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.outdoor TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.outdoor TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.opt_in_full
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.opt_in_full TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.opt_in_full TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.opt_in_full TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.opt_in_domain
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.opt_in_domain TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.opt_in_domain TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.opt_in_domain TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.occupation
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.occupation TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.occupation TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.occupation TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.name
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.name TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.name TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.name TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.music_song
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.music_song TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.music_song TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.music_song TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.mortgage
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.mortgage TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.mortgage TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.mortgage TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.merchandise
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.merchandise TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.merchandise TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.merchandise TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.marital_status
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.marital_status TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.marital_status TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.marital_status TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.mail_responder
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.mail_responder TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.mail_responder TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.mail_responder TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.magazine
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.magazine TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.magazine TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.magazine TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.language
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.language TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.language TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.language TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.international
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.international TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.international TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.international TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.household_income
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.household_income TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.household_income TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.household_income TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.home_value
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.home_value TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.home_value TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.home_value TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.home_business
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.home_business TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.home_business TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.home_business TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.height
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.height TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.height TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.height TO data_uploader_role;


ALTER TABLE dimensions_by_email_id.gender
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.gender TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.gender TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.gender TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.exercise
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.exercise TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.exercise TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.exercise TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.ethnicity
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.ethnicity TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.ethnicity TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.ethnicity TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.education
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.education TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.education TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.education TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.dogs
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.dogs TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.dogs TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.dogs TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.dob
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.dob TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.dob TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.dob TO data_uploader_role;



ALTER TABLE dimensions_by_email_id.cooking
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.cooking TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.cooking TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.cooking TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.charity
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.charity TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.charity TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.charity TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.cats
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.cats TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.cats TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.cats TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.business_owner
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.business_owner TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.business_owner TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.business_owner TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.book_reader
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.book_reader TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.book_reader TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.book_reader TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.b2b
    OWNER to admin_user;

GRANT ALL ON TABLE dimensions_by_email_id.b2b TO admin_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.b2b TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.b2b TO data_uploader_role;

ALTER TABLE dimensions_by_email_id.auto_buff
    OWNER to postgres;

GRANT SELECT ON TABLE dimensions_by_email_id.auto_buff TO andrew;

GRANT SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.auto_buff TO event_dropper;

GRANT ALL ON TABLE dimensions_by_email_id.auto_buff TO postgres;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE dimensions_by_email_id.auto_buff TO master_app;

GRANT INSERT, SELECT ON TABLE dimensions_by_email_id.auto_buff TO data_uploader_role;

GRANT SELECT ON TABLE dimensions_by_email_id.auto_buff TO developers;

