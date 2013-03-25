drop table if exists succursale_saq cascade;
create table succursale_saq (
    no_succursale_saq text primary key, -- text to allow searching
    adresse text,
    ville text
);

drop table if exists representant cascade;
create table representant (
    representant_id serial primary key,
    representant_nom text
);

drop table if exists timbre_restaurateur cascade;
create table timbre_restaurateur (
    format_timbre text primary key,
    montant_timbre numeric
);

drop table if exists client cascade;
create table client (
    no_client serial primary key,
    ancien_no_client integer,
    nom_social text,
    no_civique text,
    rue text,
    ville text,
    province text,
    code_postal text check (code_postal ~ $re$^[A-Z]\d[A-Z] \d[A-Z]\d$$re$), -- 'H0H 0H0'
    nom_responsable text,
    no_tel text,
    no_fax text,
    no_tel_personnel text,
    no_cellulaire text,
    courriel text,
    type_client text,
    specialite text,
    representant_id integer references representant,
    expedition text check (expedition in ('direct', 'pickup', 'succursale')),
    no_succursale_saq text references succursale_saq,
    note_client text,
    no_client_saq integer,
    no_civique_fact text,
    rue_fact text,
    ville_fact text,
    province_fact text,
    code_postal_fact text check (code_postal_fact ~ $re$^[A-Z]\d[A-Z] \d[A-Z]\d$$re$), -- 'H0H 0H0'
    suc_num text,
    jours_livraison text[],
    date_ouverture_dossier date,
    mode_facturation text check (mode_facturation in ('courriel', 'poste')) default 'courriel',
    mode_facturation_note text
    --jour_livraison text
);

drop table if exists producteur cascade;
create table producteur (
    no_producteur serial primary key,
    ancien_no_producteur integer,
    nom_producteur text not null,
    no_civique text,
    rue text,
    ville text,
    comte text,
    code_postal text check (code_postal ~ $re$^[A-Z]\d[A-Z] \d[A-Z]\d$|^\d{4,5}$$re$), -- 'H0H 0H0'|'1234'|'12345'
    pays text,
    no_tel text,
    no_fax text,
    note_producteur text,
    suc_num integer,
    nom_responsable text,
    courriel text
);

drop table if exists produit cascade;
create table produit (
    no_produit_interne serial primary key,
    ancien_no_produit integer,
    no_producteur integer not null references producteur,
    type_vin text not null unique,
    nom_domaine text,
    format text not null references timbre_restaurateur (format_timbre),
    couleur text not null,
    quantite_par_caisse integer not null,
    pays text,
    suc_num integer
);

drop table if exists client_produit cascade;
create table client_produit (
    client_produit_id serial primary key,
    no_client integer not null references client on delete cascade,
    no_produit_interne integer not null references produit,
    suc_num integer
);

drop table if exists commande cascade;
create table commande (
    no_commande_facture serial primary key,
    ancien_no_commande_facture integer,
    no_client integer not null not null references client,
    date_commande date,
    expedition text check (expedition in ('direct', 'pickup', 'succursale')),
    no_succursale_saq text references succursale_saq,
    date_pickup date,
    date_direct date,
    date_envoi_saq date,
    statut_commande text,
    sous_total numeric,
    montant numeric,
    tps numeric,
    tvq numeric,
    statut_facture text,
    note_commande text,
    suc_num integer,
    jour_livraison text,
    facture_est_envoyee bool default false,
    bon_de_commande_est_envoye bool default false,
    no_commande_saq integer
);

-- IMPORTANT: I renamed the original commande_produit table to commande_item, to put
-- emphasis on the fact that it works at the inventaire record level (no_produit_saq),
-- not at the produit record level (no_produit_interne); in the app code, when manipulating
-- data related to this table, I distinguish between "items", which can only correspond to a
-- single row, and "produit", which can correspond to many.

drop table if exists commande_item cascade;
create table commande_item (
    commande_item_id serial primary key,
    no_commande_facture integer not null references commande,
    no_produit_interne integer not null references produit,
    no_produit_saq integer,
    no_demande_saq text,
    quantite_caisse integer,
    quantite_bouteille integer,
    statut_item text check (statut_item in ('OK', 'BO')),
    no_client integer,
    commission numeric, -- added
    montant_commission numeric,
    --date_commande date, -- ??
    suc_num integer
);

drop table if exists inventaire cascade;
create table inventaire (
    no_inventaire serial primary key,
    no_produit_interne integer not null references produit,
    no_produit_saq integer,
    no_demande_saq text,
    quantite_commandee integer,
    quantite_recue integer,
    date_commande date,
    date_recue date,
    prix_coutant numeric,
    millesime integer,
    commission numeric,
    statut_inventaire text check (statut_inventaire in ('en attente', 'en réserve', 'actif', 'inactif')) not null,
    solde_bouteille integer, -- en # de bouteilles
    solde_caisse integer,
    solde_30_jours numeric,
    solde_60_jours numeric,
    suc_num integer,
    prix_restaurant numeric, -- prix_coutant / 1.14975 + 16% + 0.81$
    prix_particulier numeric -- prix_coutant + 23%
);

drop table if exists backorder cascade;
create table backorder (
    backorder_id serial primary key,
    --commande_item_id integer not null references commande_item on delete cascade
    no_produit_interne integer not null references produit,
    no_client integer not null references client,
    date_bo date,
    quantite_caisse integer,
    quantite_bouteille integer
);

drop table if exists usager cascade;
create table usager (
    usager_id serial primary key,
    usager_nom text not null,
    mdp_hash text not null,
    representant_id integer references representant
);

insert into representant values (2, 'David Doucet');
insert into representant values (4, 'Nicolas Giroux');
insert into representant values (7, 'Jocelyn Racicot');
insert into representant values (13, 'François Lachapelle');
insert into representant values (18, 'Annie-C. Gaudreau');
insert into representant values (19, 'André Baillargeon');
insert into representant values (20, 'Steve Fradette');
--insert into representant values (22, 'Alain Doucet');
insert into representant values (23, 'Caroline Chouinard');
--insert into representant values (25, 'Patricia Morin');
--insert into representant values (27, 'Inactif');
--insert into representant values (29, 'bureau');
insert into representant values (30, 'Pierre Decelles');

insert into timbre_restaurateur values ('375 ml', 0.51);
insert into timbre_restaurateur values ('500 ml', 0.68);
insert into timbre_restaurateur values ('700 ml', 0.95);
insert into timbre_restaurateur values ('750 ml', 1.01);
insert into timbre_restaurateur values ('1 Litre', 1.35);
insert into timbre_restaurateur values ('1.5 Litre', 2.03);
insert into timbre_restaurateur values ('3 Litres', 4.05);
insert into timbre_restaurateur values ('5 Litres', 6.75);
insert into timbre_restaurateur values ('6 Litres', 8.10);
insert into timbre_restaurateur values ('12 Litres', 16.20);
insert into timbre_restaurateur values ('18 Litres', 24.30);

-- to create an usager:
-- insert into usager (usager_nom, mdp_hash) values (<name>, (select crypt(<pw>, gen_salt('bf'))));

create or replace function age_in_days(date) returns int as $$
    select date_part('day', now() - $1)::int
$$ language sql immutable;

-- if PG >= 9, use these (requires postgresql-contrib)
--create extension unaccent;
--create extension pgcrypto;

-- else, comment previous, uncomment these 2 functions:
-- taken from: http://www.laudatio.com/wordpress/2008/11/05/postgresql-83-to_ascii-utf8/
-- create or replace function to_ascii(bytea, name)
-- returns text strict as 'to_ascii_encname' language internal;

-- create or replace function unaccent(text) returns text as $$
--     select to_ascii(convert_to($1, 'latin1'), 'latin1')
-- $$ language sql immutable;

-- this one does nothing
-- create or replace function unaccent(text) returns text as $$
--     select $1
-- $$ language sql immutable;
