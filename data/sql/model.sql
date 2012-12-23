drop table if exists client cascade;
create table client (
    no_client serial primary key,
    ancien_no_client integer,
    nom_social text,
    no_civique text,
    rue text,
    ville text,
    province text,
    code_postal text,
    nom_responsable text,
    no_tel text,
    no_fax text,
    no_tel_personnel text,
    no_cellulaire text,
    courriel text,
    type_client text,
    specialite text,
    representant_id integer,
    expedition text check (expedition in ('direct', 'pickup', 'succursale')),
    no_succursale text,
    note text,
    no_client_saq integer,
    no_civique_fact text,
    rue_fact text,
    ville_fact text,
    province_fact text,
    code_postal_fact text,
    suc_num text,
    jours_livraison text[],
    date_ouverture_dossier date
    --jour_livraison text
);

drop table if exists produit cascade;
create table produit (
    no_produit_interne serial primary key,
    ancien_no_produit integer,
    no_producteur integer,
    type_vin text,
    nom_domaine text,
    format text,
    couleur text,
    quantite_par_caisse integer,
    pays text,
    suc_num integer
);

drop table if exists producteur cascade;
create table producteur (
    no_producteur serial primary key,
    ancien_no_producteur integer,
    nom_producteur text,
    no_civique text,
    rue text,
    ville text,
    comte text,
    code_postal text,
    pays text,
    no_tel text,
    no_fax text,
    note text,
    suc_num integer
);

drop table if exists client_produit cascade;
create table client_produit (
    client_produit_id serial primary key,
    no_client integer not null,
    no_produit_interne integer not null,
    suc_num integer
);

drop table if exists commande cascade;
create table commande (
    no_commande_facture serial primary key,
    ancien_no_commande_facture integer,
    no_client integer not null,
    date_commande date,
    expedition text check (expedition in ('direct', 'pickup', 'succursale')),
    no_succursale integer,
    date_pickup date,
    date_direct date,
    date_envoi date,
    statut_commande text,
    sous_total numeric,
    montant numeric,
    tps numeric,
    tvq numeric,
    statut_facture text,
    note text,
    suc_num integer,
    jour_livraison text,
    facture_est_envoyee bool default false,
    bon_de_commande_est_envoye bool default false
);

-- IMPORTANT: I renamed the original commande_produit table to commande_item, to put
-- emphasis on the fact that it works at the inventaire record level (no_produit_saq),
-- not at the produit record level (no_produit_interne); in the app code, when manipulating
-- data related to this table, I distinguish between "items", which can only correspond to a
-- single row, and "produit", which can correspond to many.

drop table if exists commande_item cascade;
create table commande_item (
    commande_item_id serial primary key,
    no_commande_facture integer not null,
    no_produit_interne integer not null,
    no_produit_saq integer,
    no_commande_saq text, -- ?? should it be in commande?
    quantite_caisse integer,
    quantite_bouteille integer,
    statut text check (statut in ('OK', 'BO')),
    no_client integer,
    commission numeric, -- added
    montant_commission numeric,
    date_commande date, -- ??
    suc_num integer
);

drop table if exists inventaire cascade;
create table inventaire (
    no_inventaire serial primary key,
    no_produit_interne integer not null,
    no_produit_saq integer,
    no_commande_saq text,
    quantite_commandee integer,
    quantite_recue integer,
    date_commande date,
    date_recue date,
    prix_restaurant numeric, -- prix_coutant / 1.14975 + 16% + 0.81$
    prix_particulier numeric, -- prix_coutant + 23%
    prix_coutant numeric,
    millesime integer,
    commission numeric,
    statut text check (statut in ('en attente', 'en réserve', 'actif', 'inactif')),
    solde_bouteille integer, -- en # de bouteilles
    solde_caisse integer,
    solde_30_jours numeric,
    solde_60_jours numeric,
    suc_num integer
);

drop table if exists succursale_saq cascade;
create table succursale_saq (
    succursale_saq_id serial primary key,
    no_succursale text not null,
    adresse text,
    ville text
);

drop table if exists representant cascade;
create table representant (
    representant_id serial primary key,
    representant_nom text
);

insert into representant values (2, 'David Doucet');
insert into representant values (4, 'Nicolas Giroux');
insert into representant values (7, 'Jocelyn Racicot');
insert into representant values (13, 'François Lachapelle');
insert into representant values (18, 'Annie-C. Gaudreau');
insert into representant values (19, 'André Baillargeon');
insert into representant values (20, 'Steve Fradette');
insert into representant values (22, 'Alain Doucet');
insert into representant values (23, 'Caroline Chouinard');
insert into representant values (25, 'Patricia Morin');
insert into representant values (27, 'Inactif');
insert into representant values (29, 'bureau');

create or replace function age_in_days(date) returns int as $$
    select date_part('day', now() - $1)::int
$$ language sql immutable;

-- requires postgresql-contrib, allows: select unaccent('école')
create extension unaccent;
